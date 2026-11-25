import { Prisma } from '@prisma/client';
import prisma from '../infra/database/prisma.js';
import { cuelinksClient, CuelinksClient } from '../infra/integrations/cuelinks/cuelinksClient.js';
import { distributedLock } from '../infra/lock/distributedLock.js';
import { AppError } from '../utils/appError.js';

export interface TransactionSyncOptions {
  fullSync?: boolean;
  updatedSince?: Date | string;
  startDate?: string;
  endDate?: string;
  maxPages?: number;
  perPage?: number;
  checkpointPage?: number;
  overlapMinutes?: number;
}

export interface TransactionSyncSummary {
  status: 'COMPLETED' | 'PARTIALLY_COMPLETED' | 'FAILED';
  startedAt: Date;
  completedAt: Date;
  updatedSince?: string | null;
  totalFetched: number;
  created: number;
  updated: number;
  failed: number;
  durationMs: number;
  isPartial: boolean;
  checkpointPage?: number | null;
  reachedPageLimit: boolean;
  lastProcessedDate?: Date | null;
  error?: string | null;
}

export interface ListTransactionsFilterParams {
  startDate?: string;
  endDate?: string;
  status?: string;
  campaignId?: number | string;
  subId?: string;
  invoiceNumber?: string;
  currency?: string;
  search?: string;
  page?: number;
  limit?: number;
  sort?: string;
  order?: 'asc' | 'desc';
}

export interface ParsedMonetaryValue {
  value: Prisma.Decimal | null;
  status: 'VALID' | 'ZERO' | 'MISSING' | 'INVALID';
  raw: any;
}

const SENSITIVE_KEY_REGEX = /^(.*_)?(ip|client_ip|user_ip|ip_address|email|customer_email|user_email|phone|mobile|token|api_?key|secret|password|auth|bearer|cookie|session|credit_?card|cvv|card_number)(_.*)?$/i;

/**
 * Recursively sanitize / redact sensitive fields from raw API payloads.
 */
export function redactSensitivePayload(obj: any): any {
  if (obj === null || obj === undefined) return obj;
  if (typeof obj !== 'object') return obj;

  if (Array.isArray(obj)) {
    return obj.map((item) => redactSensitivePayload(item));
  }

  const sanitized: Record<string, any> = {};
  for (const [key, value] of Object.entries(obj)) {
    if (SENSITIVE_KEY_REGEX.test(key)) {
      sanitized[key] = '[REDACTED]';
    } else if (typeof value === 'object' && value !== null) {
      sanitized[key] = redactSensitivePayload(value);
    } else {
      sanitized[key] = value;
    }
  }
  return sanitized;
}

export class CuelinksTransactionSyncService {
  private isSyncInProgress = false;
  private client: CuelinksClient;
  private readonly LOCK_RESOURCE = 'cuelinks:transaction:sync';
  private readonly LOCK_TTL_SECONDS = 600; // 10 minutes safe timeout

  constructor(clientInstance: CuelinksClient = cuelinksClient) {
    this.client = clientInstance;
  }

  public isSynchronizing(): boolean {
    return this.isSyncInProgress;
  }

  /**
   * Distinguishes missing, null, invalid, zero, and valid positive/negative monetary values.
   * Never silently converts null/missing to 0.00.
   */
  public parseMonetaryField(val: any): ParsedMonetaryValue {
    if (val === null || val === undefined) {
      return { value: null, status: 'MISSING', raw: val };
    }
    const str = String(val).trim();
    if (str === '') {
      return { value: null, status: 'MISSING', raw: val };
    }
    const cleanStr = str.replace(/[^0-9.-]/g, '');
    if (!cleanStr || isNaN(Number(cleanStr))) {
      return { value: null, status: 'INVALID', raw: val };
    }
    try {
      const dec = new Prisma.Decimal(cleanStr);
      if (dec.isZero()) {
        return { value: new Prisma.Decimal('0.00'), status: 'ZERO', raw: val };
      }
      return { value: dec, status: 'VALID', raw: val };
    } catch {
      return { value: null, status: 'INVALID', raw: val };
    }
  }

  /**
   * Synchronize transactions from Cuelinks API to local database.
   * Protected with distributed locking, checkpointing, and exact decimal & currency preservation.
   */
  public async syncTransactions(options: TransactionSyncOptions = {}): Promise<TransactionSyncSummary> {
    // 1. Process-level check
    if (this.isSyncInProgress) {
      throw AppError.conflict('Transaction synchronization is already in progress. Please wait for completion.');
    }

    // 2. Acquire distributed lock across multiple backend instances
    const lock = await distributedLock.acquireLock(this.LOCK_RESOURCE, this.LOCK_TTL_SECONDS);
    if (!lock.acquired) {
      throw AppError.conflict(
        'Transaction synchronization is already in progress on another server or worker. Distributed lock held.'
      );
    }

    // 3. Heartbeat lease renewal for long-running sync jobs (renews at half-life)
    let lockLost = false;
    let renewalTimer: NodeJS.Timeout | null = null;
    if (lock.token) {
      renewalTimer = setInterval(async () => {
        try {
          const renewed = await distributedLock.renewLock(this.LOCK_RESOURCE, lock.token!, this.LOCK_TTL_SECONDS);
          if (!renewed) {
            lockLost = true;
            console.error('[CuelinksSync] CRITICAL: Distributed lock lease lost or expired. Synchronization job will abort.');
          }
        } catch (err: any) {
          lockLost = true;
          console.error('[CuelinksSync] CRITICAL: Lock renewal error:', err?.message || err);
        }
      }, Math.floor((this.LOCK_TTL_SECONDS / 2) * 1000));
      if (renewalTimer.unref) renewalTimer.unref();
    }

    this.isSyncInProgress = true;
    const startedAt = new Date();
    const overlapMinutes = options.overlapMinutes ?? 15;
    let syncLogId: string | null = null;
    let resolvedUpdatedSince: string | null = null;

    try {
      // Create initial audit sync log
      const initialLog = await prisma.cuelinksTransactionSyncLog.create({
        data: {
          status: 'IN_PROGRESS',
          startedAt,
        },
      });
      syncLogId = initialLog.id;

      // Determine updated_since if not a forced fullSync
      if (!options.fullSync) {
        if (options.updatedSince) {
          const d = new Date(options.updatedSince);
          resolvedUpdatedSince = isNaN(d.getTime()) ? String(options.updatedSince) : d.toISOString();
        } else {
          // Look up latest completed sync or highest transaction date
          const lastCompletedLog = await prisma.cuelinksTransactionSyncLog.findFirst({
            where: { status: 'COMPLETED' },
            orderBy: { startedAt: 'desc' },
          });

          if (lastCompletedLog?.startedAt) {
            // Apply 15-minute overlap window
            const overlapDate = new Date(lastCompletedLog.startedAt.getTime() - overlapMinutes * 60 * 1000);
            resolvedUpdatedSince = overlapDate.toISOString();
          } else {
            // Check if there was a partial log with lastProcessedDate to resume from
            const lastPartialLog = await prisma.cuelinksTransactionSyncLog.findFirst({
              where: { isPartial: true, lastProcessedDate: { not: null } },
              orderBy: { startedAt: 'desc' },
            });
            if (lastPartialLog?.lastProcessedDate) {
              const overlapDate = new Date(lastPartialLog.lastProcessedDate.getTime() - overlapMinutes * 60 * 1000);
              resolvedUpdatedSince = overlapDate.toISOString();
            }
          }
        }
      }

      if (syncLogId && resolvedUpdatedSince) {
        await prisma.cuelinksTransactionSyncLog.update({
          where: { id: syncLogId },
          data: { updatedSince: new Date(resolvedUpdatedSince) },
        });
      }

      let currentPage = options.checkpointPage || 1;
      let totalPages = 1;
      const perPage = options.perPage ? Math.min(Math.max(1, options.perPage), 500) : 100;
      const maxPages = options.maxPages || 50; // Safety limit to avoid unbounded memory/time

      let totalFetched = 0;
      let totalCreated = 0;
      let totalUpdated = 0;
      let totalFailed = 0;
      let reachedPageLimit = false;
      let lastProcessedDate: Date | null = null;

      while (currentPage <= totalPages) {
        if (lockLost) {
          throw AppError.internal('Distributed lock lease lost during synchronization. Aborted safely to prevent split-brain writes.');
        }

        if (currentPage > maxPages) {
          reachedPageLimit = true;
          break;
        }

        const queryParams: any = {
          page: currentPage,
          per_page: perPage,
        };

        if (resolvedUpdatedSince) {
          queryParams.updated_since = resolvedUpdatedSince;
        } else {
          if (options.startDate) queryParams.start_date = options.startDate;
          if (options.endDate) queryParams.end_date = options.endDate;
        }

        const response = await this.client.getTransactions(queryParams);
        const records = response.data || [];
        totalFetched += records.length;

        // Calculate totalPages based on meta
        const total = response.meta?.total || records.length;
        const effectivePerPage = response.meta?.per_page || perPage;
        totalPages = Math.ceil(total / effectivePerPage) || 1;

        for (const tx of records) {
          if (lockLost) {
            throw AppError.internal('Distributed lock lease lost during synchronization. Aborted safely to prevent split-brain writes.');
          }
          try {
            const externalId = String(tx.id);
            if (!externalId) {
              totalFailed++;
              continue;
            }

            const txDate = tx.transaction_date ? new Date(tx.transaction_date) : new Date();
            const safeTxDate = isNaN(txDate.getTime()) ? new Date() : txDate;

            // Semantically correct checkpoint timestamp: track upstream modification timestamp (updated_at)
            // NEVER confuse transaction_date (order placement) with record update timestamp
            let upstreamUpdatedAt: Date | null = null;
            if (tx.updated_at) {
              const d = new Date(tx.updated_at);
              if (!isNaN(d.getTime())) upstreamUpdatedAt = d;
            } else if (tx.validation_date) {
              const d = new Date(tx.validation_date);
              if (!isNaN(d.getTime())) upstreamUpdatedAt = d;
            }

            if (upstreamUpdatedAt) {
              if (!lastProcessedDate || upstreamUpdatedAt > lastProcessedDate) {
                lastProcessedDate = upstreamUpdatedAt;
              }
            } else if (!lastProcessedDate) {
              // If upstream API does not provide individual record updated_at, anchor checkpoint to sync startedAt
              lastProcessedDate = startedAt;
            }

            // Financial parsing: never convert null/missing to 0.00
            const parsedSale = this.parseMonetaryField(tx.sale_amount);
            const rawComm = tx.user_commission ?? (tx as any).commission;
            const parsedComm = this.parseMonetaryField(rawComm);

            // Currency handling: never default to INR without verified source
            const currency =
              tx.currency && typeof tx.currency === 'string' && tx.currency.trim()
                ? tx.currency.trim().toUpperCase()
                : 'UNKNOWN';

            // Sensitive data redaction for rawMetadata
            const sanitizedMetadata = redactSensitivePayload(tx);

            // Check if record exists for accurate created vs updated counter
            const existing = await prisma.cuelinksTransaction.findUnique({
              where: { externalTransactionId: externalId },
            });

            await prisma.cuelinksTransaction.upsert({
              where: { externalTransactionId: externalId },
              create: {
                externalTransactionId: externalId,
                campaignId: tx.campaign_id ? Number(tx.campaign_id) : null,
                campaignName: tx.campaign_name || null,
                campaignType: tx.campaign_type || null,
                transactionDate: safeTxDate,
                status: tx.status ? String(tx.status).toLowerCase() : 'pending',
                saleAmount: parsedSale.value,
                commissionAmount: parsedComm.value,
                currency,
                merchantRefId: tx.merchant_ref_id || null,
                orderId: tx.order_id || null,
                productName: tx.product_name || null,
                category: tx.category || null,
                channelId: tx.channel_id ? Number(tx.channel_id) : null,
                channelName: tx.channel_name || null,
                subId: tx.sub_id || null,
                subId2: tx.sub_id2 || null,
                subId3: tx.sub_id3 || null,
                subId4: tx.sub_id4 || null,
                subId5: tx.sub_id5 || null,
                invoiceNumber: tx.invoice_number || null,
                rawMetadata: sanitizedMetadata,
                lastSyncedAt: new Date(),
              },
              update: {
                campaignId: tx.campaign_id ? Number(tx.campaign_id) : undefined,
                campaignName: tx.campaign_name || undefined,
                campaignType: tx.campaign_type || undefined,
                transactionDate: safeTxDate,
                status: tx.status ? String(tx.status).toLowerCase() : 'pending',
                saleAmount: parsedSale.value,
                commissionAmount: parsedComm.value,
                currency,
                merchantRefId: tx.merchant_ref_id || undefined,
                orderId: tx.order_id || undefined,
                productName: tx.product_name || undefined,
                category: tx.category || undefined,
                channelId: tx.channel_id ? Number(tx.channel_id) : undefined,
                channelName: tx.channel_name || undefined,
                subId: tx.sub_id || undefined,
                subId2: tx.sub_id2 || undefined,
                subId3: tx.sub_id3 || undefined,
                subId4: tx.sub_id4 || undefined,
                subId5: tx.sub_id5 || undefined,
                invoiceNumber: tx.invoice_number || undefined,
                rawMetadata: sanitizedMetadata,
                lastSyncedAt: new Date(),
              },
            });

            if (existing) {
              totalUpdated++;
            } else {
              totalCreated++;
            }
          } catch (itemErr) {
            totalFailed++;
          }
        }

        if (records.length === 0 || currentPage >= totalPages) {
          break;
        }

        currentPage++;
      }

      const completedAt = new Date();
      const durationMs = completedAt.getTime() - startedAt.getTime();

      // Check if partial sync due to safety page limit or failures
      const isPartial = reachedPageLimit || (totalFailed > 0 && (totalCreated > 0 || totalUpdated > 0));
      const status = isPartial
        ? 'PARTIALLY_COMPLETED'
        : totalFailed > 0 && totalCreated === 0 && totalUpdated === 0 && totalFetched > 0
          ? 'FAILED'
          : 'COMPLETED';

      const partialErrorNote = reachedPageLimit
        ? `Safety limit of ${maxPages} pages reached. More pages remain in Cuelinks. Checkpoint page: ${currentPage}.`
        : null;

      if (syncLogId) {
        await prisma.cuelinksTransactionSyncLog.update({
          where: { id: syncLogId },
          data: {
            status,
            completedAt,
            recordsFetched: totalFetched,
            recordsCreated: totalCreated,
            recordsUpdated: totalUpdated,
            failedRecords: totalFailed,
            isPartial,
            checkpointPage: isPartial ? currentPage : null,
            reachedPageLimit,
            lastProcessedDate,
            error: partialErrorNote,
          },
        });
      }

      return {
        status,
        startedAt,
        completedAt,
        updatedSince: resolvedUpdatedSince,
        totalFetched,
        created: totalCreated,
        updated: totalUpdated,
        failed: totalFailed,
        durationMs,
        isPartial,
        checkpointPage: isPartial ? currentPage : null,
        reachedPageLimit,
        lastProcessedDate,
        error: partialErrorNote,
      };
    } catch (err: any) {
      const completedAt = new Date();
      const safeError = err?.message || 'Transaction synchronization failed';

      if (syncLogId) {
        await prisma.cuelinksTransactionSyncLog.update({
          where: { id: syncLogId },
          data: {
            status: 'FAILED',
            completedAt,
            error: safeError,
          },
        });
      }

      throw err;
    } finally {
      this.isSyncInProgress = false;
      if (renewalTimer) {
        clearInterval(renewalTimer);
        renewalTimer = null;
      }
      // Release distributed lock safely using ownership token (only if lease was not lost)
      if (lock.token && !lockLost) {
        await distributedLock.releaseLock(this.LOCK_RESOURCE, lock.token);
      }
    }
  }

  /**
   * Return current synchronization status and latest execution log.
   */
  public async getSyncStatus() {
    const isLocked = await distributedLock.isLocked(this.LOCK_RESOURCE);

    const latestLog = await prisma.cuelinksTransactionSyncLog.findFirst({
      orderBy: { startedAt: 'desc' },
    });

    const totalTransactions = await prisma.cuelinksTransaction.count();

    const lastCompletedLog = await prisma.cuelinksTransactionSyncLog.findFirst({
      where: { status: 'COMPLETED' },
      orderBy: { completedAt: 'desc' },
    });

    return {
      isSyncInProgress: this.isSyncInProgress || isLocked,
      isDistributedLockActive: isLocked,
      totalTransactions,
      latestLog,
      lastSuccessfulSyncAt: lastCompletedLog?.completedAt || null,
    };
  }

  /**
   * List local synced transactions with sorting, filtering, and pagination.
   * Excludes rawMetadata to prevent leaking unredacted payload or overloading bandwidth.
   */
  public async listTransactions(params: ListTransactionsFilterParams = {}) {
    const page = Math.max(1, Number(params.page) || 1);
    const limit = Math.min(Math.max(1, Number(params.limit) || 20), 100);
    const skip = (page - 1) * limit;

    const where: Prisma.CuelinksTransactionWhereInput = {};

    if (params.status && params.status !== 'ALL') {
      where.status = { equals: params.status.toLowerCase(), mode: 'insensitive' };
    }

    if (params.campaignId) {
      where.campaignId = Number(params.campaignId);
    }

    if (params.currency && params.currency !== 'ALL') {
      where.currency = { equals: params.currency.toUpperCase() };
    }

    if (params.subId) {
      where.subId = { contains: params.subId, mode: 'insensitive' };
    }

    if (params.invoiceNumber) {
      where.invoiceNumber = { contains: params.invoiceNumber, mode: 'insensitive' };
    }

    if (params.startDate || params.endDate) {
      where.transactionDate = {};
      if (params.startDate) {
        where.transactionDate.gte = new Date(params.startDate);
      }
      if (params.endDate) {
        const end = new Date(params.endDate);
        end.setHours(23, 59, 59, 999);
        where.transactionDate.lte = end;
      }
    }

    if (params.search) {
      const q = params.search.trim();
      where.OR = [
        { externalTransactionId: { contains: q, mode: 'insensitive' } },
        { productName: { contains: q, mode: 'insensitive' } },
        { campaignName: { contains: q, mode: 'insensitive' } },
        { orderId: { contains: q, mode: 'insensitive' } },
        { merchantRefId: { contains: q, mode: 'insensitive' } },
        { subId: { contains: q, mode: 'insensitive' } },
      ];
    }

    // Sort allowlist verification
    const allowedSortFields = ['transactionDate', 'updatedAt', 'saleAmount', 'commissionAmount', 'status'];
    const sortField = params.sort && allowedSortFields.includes(params.sort) ? params.sort : 'transactionDate';
    const orderDir = params.order === 'asc' ? 'asc' : 'desc';

    const orderBy: Prisma.CuelinksTransactionOrderByWithRelationInput = {
      [sortField]: orderDir,
    };

    // Sensitive data protection: Select only necessary columns, excluding rawMetadata from list
    const [items, total] = await Promise.all([
      prisma.cuelinksTransaction.findMany({
        where,
        skip,
        take: limit,
        orderBy,
        select: {
          id: true,
          externalTransactionId: true,
          campaignId: true,
          campaignName: true,
          campaignType: true,
          transactionDate: true,
          status: true,
          saleAmount: true,
          commissionAmount: true,
          currency: true,
          merchantRefId: true,
          orderId: true,
          productName: true,
          category: true,
          channelId: true,
          channelName: true,
          subId: true,
          subId2: true,
          subId3: true,
          subId4: true,
          subId5: true,
          invoiceNumber: true,
          lastSyncedAt: true,
          createdAt: true,
          updatedAt: true,
        },
      }),
      prisma.cuelinksTransaction.count({ where }),
    ]);

    return {
      items,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit) || 1,
      },
    };
  }

  /**
   * Get transaction details by internal ID or external ID.
   * Ensures rawMetadata is sanitized before returning.
   */
  public async getTransactionById(id: string) {
    if (!id) {
      throw AppError.badRequest('Transaction ID is required');
    }

    const tx = await prisma.cuelinksTransaction.findFirst({
      where: {
        OR: [{ id }, { externalTransactionId: id }],
      },
    });

    if (!tx) {
      throw AppError.notFound('Transaction not found');
    }

    // Protect sensitive data in raw metadata
    if (tx.rawMetadata) {
      tx.rawMetadata = redactSensitivePayload(tx.rawMetadata);
    }

    return tx;
  }
}

export const cuelinksTransactionSyncService = new CuelinksTransactionSyncService();
