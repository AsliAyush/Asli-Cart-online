import prisma from '../infra/database/prisma.js';
import {
  cuelinksClient,
  CuelinksClient,
  CuelinksPingResult,
  CuelinksCampaignQueryParams,
  CuelinksCampaignsResponse,
  CuelinksCampaignDetailResponse,
  CuelinksRequestAccessResponse,
  CuelinksApiCampaign,
} from '../infra/integrations/cuelinks/cuelinksClient.js';
import { AppError } from '../utils/appError.js';

export interface CampaignListFilters {
  page?: number;
  limit?: number;
  search?: string;
  accessStatus?: string;
  category?: string;
  country?: string;
  sort?: string;
  order?: 'asc' | 'desc';
}

export interface CampaignSyncSummary {
  totalFetched: number;
  created: number;
  updated: number;
  unchanged: number;
  failed: number;
  startedAt: Date;
  completedAt: Date;
  durationMs: number;
  status: 'COMPLETED' | 'PARTIALLY_COMPLETED' | 'FAILED';
  error?: string;
}

export interface CampaignSyncState {
  status: 'IDLE' | 'IN_PROGRESS' | 'COMPLETED' | 'PARTIALLY_COMPLETED' | 'FAILED';
  lastSyncedAt: Date | null;
  lastSummary: CampaignSyncSummary | null;
  currentError: string | null;
}

export class CuelinksService {
  private syncState: CampaignSyncState = {
    status: 'IDLE',
    lastSyncedAt: null,
    lastSummary: null,
    currentError: null,
  };

  constructor(private readonly client: CuelinksClient = cuelinksClient) {}

  public async checkHealth(): Promise<CuelinksPingResult> {
    return this.client.ping();
  }

  public async fetchRemoteCampaigns(params: CuelinksCampaignQueryParams = {}): Promise<CuelinksCampaignsResponse> {
    return this.client.getCampaigns(params);
  }

  public async fetchRemoteCampaignById(id: number | string): Promise<CuelinksCampaignDetailResponse> {
    return this.client.getCampaignById(id);
  }

  public async requestAccess(id: number | string): Promise<CuelinksRequestAccessResponse> {
    const response = await this.client.requestAccess(id);

    // Update local database record if present
    const numericId = Number(id);
    if (!isNaN(numericId)) {
      try {
        const existing = await prisma.cuelinksCampaign.findUnique({
          where: { externalCampaignId: numericId },
        });

        if (existing) {
          await prisma.cuelinksCampaign.update({
            where: { id: existing.id },
            data: {
              accessStatus: response.status || 'pending',
              lastSyncedAt: new Date(),
            },
          });
        }
      } catch (err) {
        // Non-blocking: remote request succeeded
      }
    }

    return response;
  }

  public async listCampaigns(filters: CampaignListFilters = {}) {
    const page = Math.max(1, Number(filters.page) || 1);
    const limit = Math.max(1, Math.min(100, Number(filters.limit) || 20));
    const skip = (page - 1) * limit;

    const where: any = {};

    if (filters.accessStatus && filters.accessStatus !== 'all') {
      where.accessStatus = filters.accessStatus;
    }

    if (filters.category && filters.category !== 'all') {
      where.category = { contains: filters.category, mode: 'insensitive' };
    }

    if (filters.country && filters.country !== 'all') {
      where.country = { equals: filters.country, mode: 'insensitive' };
    }

    if (filters.search && filters.search.trim().length > 0) {
      const q = filters.search.trim();
      where.OR = [
        { name: { contains: q, mode: 'insensitive' } },
        { domain: { contains: q, mode: 'insensitive' } },
        { category: { contains: q, mode: 'insensitive' } },
      ];
    }

    const sortField = filters.sort || 'lastSyncedAt';
    const sortOrder = filters.order === 'asc' ? 'asc' : 'desc';
    const orderBy: any = {};
    if (['name', 'lastSyncedAt', 'createdAt', 'payout', 'domain'].includes(sortField)) {
      orderBy[sortField] = sortOrder;
    } else {
      orderBy.lastSyncedAt = 'desc';
    }

    const [campaigns, total] = await Promise.all([
      prisma.cuelinksCampaign.findMany({
        where,
        orderBy,
        skip,
        take: limit,
      }),
      prisma.cuelinksCampaign.count({ where }),
    ]);

    return {
      campaigns,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit) || 1,
      },
    };
  }

  public async getCampaignById(id: string) {
    const numericId = Number(id);
    let campaign: any = null;

    if (!isNaN(numericId) && numericId > 0) {
      campaign = await prisma.cuelinksCampaign.findFirst({
        where: {
          OR: [{ id }, { externalCampaignId: numericId }],
        },
      });
    } else {
      campaign = await prisma.cuelinksCampaign.findUnique({
        where: { id },
      });
    }

    if (!campaign) {
      throw AppError.notFound('Campaign not found in local database');
    }

    return campaign;
  }

  public async syncCampaigns(options?: {
    accessStatus?: string;
    page?: number;
    perPage?: number;
    maxPages?: number;
  }): Promise<CampaignSyncSummary> {
    if (this.syncState.status === 'IN_PROGRESS') {
      throw AppError.conflict('A campaign synchronization task is already in progress');
    }

    const startedAt = new Date();
    this.syncState.status = 'IN_PROGRESS';
    this.syncState.currentError = null;

    const summary: CampaignSyncSummary = {
      totalFetched: 0,
      created: 0,
      updated: 0,
      unchanged: 0,
      failed: 0,
      startedAt,
      completedAt: new Date(),
      durationMs: 0,
      status: 'COMPLETED',
    };

    try {
      const perPage = options?.perPage ?? 50;
      const initialPage = options?.page ?? 1;
      const maxPages = options?.maxPages ?? 5; // Default safety bound per sync run

      let currentPage = initialPage;
      let totalPages = 1;

      do {
        const response = await this.client.getCampaigns({
          page: currentPage,
          per_page: perPage,
          access_status: options?.accessStatus,
        });

        const items = response.data || [];
        summary.totalFetched += items.length;

        if (response.meta?.total) {
          totalPages = Math.ceil(response.meta.total / perPage);
        }

        for (const item of items) {
          try {
            await this.upsertCampaign(item, summary);
          } catch (itemErr) {
            summary.failed += 1;
          }
        }

        currentPage += 1;
      } while (currentPage <= Math.min(totalPages, maxPages) && currentPage <= initialPage + maxPages - 1);

      summary.completedAt = new Date();
      summary.durationMs = summary.completedAt.getTime() - startedAt.getTime();
      summary.status = summary.failed > 0 && summary.created + summary.updated === 0 ? 'FAILED' : summary.failed > 0 ? 'PARTIALLY_COMPLETED' : 'COMPLETED';

      this.syncState.status = summary.status;
      this.syncState.lastSyncedAt = summary.completedAt;
      this.syncState.lastSummary = summary;

      return summary;
    } catch (err: any) {
      summary.completedAt = new Date();
      summary.durationMs = summary.completedAt.getTime() - startedAt.getTime();
      summary.status = 'FAILED';
      summary.error = err.message || 'Unknown error occurred during synchronization';

      this.syncState.status = 'FAILED';
      this.syncState.currentError = summary.error || null;
      this.syncState.lastSummary = summary;

      throw err;
    }
  }

  public getSyncStatus(): CampaignSyncState {
    return { ...this.syncState };
  }

  private async upsertCampaign(item: CuelinksApiCampaign, summary: CampaignSyncSummary): Promise<void> {
    const externalId = Number(item.id);
    if (!externalId || isNaN(externalId)) {
      summary.failed += 1;
      return;
    }

    const domain = item.domain || (item.url ? this.extractDomain(item.url) : null);
    const existing = await prisma.cuelinksCampaign.findUnique({
      where: { externalCampaignId: externalId },
    });

    const mappedData: any = {
      name: item.name || `Campaign #${externalId}`,
      description: item.description !== undefined ? item.description : (existing?.description ?? null),
      url: item.url || item.tracking_url || existing?.url || null,
      domain: domain || existing?.domain || null,
      image: item.image || item.logo_url || existing?.image || null,
      accessStatus: item.access_status || existing?.accessStatus || 'open',
      payout: item.payout !== undefined && item.payout !== null ? String(item.payout) : (existing?.payout ?? null),
      payoutCurrency: item.payout_currency || item.currency || existing?.payoutCurrency || 'INR',
      epc7d: item.epc_7d !== undefined && item.epc_7d !== null ? String(item.epc_7d) : (existing?.epc7d ?? null),
      epc90d: item.epc_90d !== undefined && item.epc_90d !== null ? String(item.epc_90d) : (existing?.epc90d ?? null),
      campaignType: item.campaign_type || existing?.campaignType || null,
      isFeatured: typeof item.is_featured === 'boolean' ? item.is_featured : (existing?.isFeatured ?? false),
      country: item.country || existing?.country || null,
      category: item.category || existing?.category || null,
      platforms: item.platforms ?? existing?.platforms ?? undefined,
      media: item.media ?? existing?.media ?? undefined,
      rawMetadata: item ?? existing?.rawMetadata ?? undefined,
      lastSyncedAt: new Date(),
    };

    if (!existing) {
      await prisma.cuelinksCampaign.create({
        data: {
          externalCampaignId: externalId,
          ...mappedData,
        } as any,
      });
      summary.created += 1;
    } else {
      // Check whether key attributes changed
      const hasChanged =
        existing.name !== mappedData.name ||
        existing.accessStatus !== mappedData.accessStatus ||
        existing.payout !== mappedData.payout ||
        existing.epc7d !== mappedData.epc7d ||
        existing.isFeatured !== mappedData.isFeatured ||
        existing.category !== mappedData.category;

      await prisma.cuelinksCampaign.update({
        where: { id: existing.id },
        data: mappedData as any,
      });

      if (hasChanged) {
        summary.updated += 1;
      } else {
        summary.unchanged += 1;
      }
    }
  }

  private extractDomain(urlStr: string): string | null {
    try {
      const parsed = new URL(urlStr.startsWith('http') ? urlStr : `https://${urlStr}`);
      return parsed.hostname.replace(/^www\./, '');
    } catch {
      return null;
    }
  }
}

export const cuelinksService = new CuelinksService();
