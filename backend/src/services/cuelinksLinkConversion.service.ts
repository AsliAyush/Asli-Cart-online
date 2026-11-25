import prisma from '../infra/database/prisma.js';
import {
  cuelinksClient,
  CuelinksClient,
  CuelinksLinkConversionResult,
} from '../infra/integrations/cuelinks/cuelinksClient.js';
import { AppError } from '../utils/appError.js';
import { ROLES } from '../constants/roles.js';

export class CuelinksLinkConversionService {
  // Concurrency guard to prevent duplicate simultaneous conversion calls for the same URL
  private inFlightConversions = new Map<string, Promise<CuelinksLinkConversionResult>>();

  constructor(private readonly client: CuelinksClient = cuelinksClient) {}

  public async convertUrl(
    rawUrl: string,
    options?: { offerId?: string; subId1?: string; subId2?: string }
  ): Promise<CuelinksLinkConversionResult> {
    if (!rawUrl || typeof rawUrl !== 'string') {
      return {
        originalUrl: rawUrl,
        affiliateUrl: null,
        affiliated: false,
        conversionStatus: 'FAILED',
        errorCategory: 'INVALID_URL',
        message: 'Invalid merchant URL provided',
      };
    }

    const trimmedUrl = rawUrl.trim();
    try {
      const parsed = new URL(trimmedUrl);
      if (!['http:', 'https:'].includes(parsed.protocol)) {
        return {
          originalUrl: trimmedUrl,
          affiliateUrl: null,
          affiliated: false,
          conversionStatus: 'FAILED',
          errorCategory: 'INVALID_URL',
          message: 'URL must use http or https protocol',
        };
      }
    } catch {
      return {
        originalUrl: trimmedUrl,
        affiliateUrl: null,
        affiliated: false,
        conversionStatus: 'FAILED',
        errorCategory: 'INVALID_URL',
        message: 'Malformed merchant destination URL',
      };
    }

    if (!this.client.isConfigured()) {
      return {
        originalUrl: trimmedUrl,
        affiliateUrl: null,
        affiliated: false,
        conversionStatus: 'FAILED',
        errorCategory: 'NOT_CONFIGURED',
        message: 'Cuelinks API key is not configured in backend environment',
      };
    }

    const subid = options?.subId1
      ? `${options.subId1}${options.subId2 ? `_${options.subId2}` : ''}`
      : undefined;

    const cacheKey = `${trimmedUrl}::${subid || ''}`;
    if (this.inFlightConversions.has(cacheKey)) {
      return this.inFlightConversions.get(cacheKey)!;
    }

    const conversionPromise = (async () => {
      try {
        const response = await this.client.convertLink({
          url: trimmedUrl,
          subid,
          shorten: true,
        });

        // Strict verification: Never treat missing 'affiliated' as true!
        const isExplicitlyAffiliated = response?.affiliated === true;
        const trackingUrl = response?.tracking_url || response?.short_url || response?.affiliate_url || null;

        if (isExplicitlyAffiliated && trackingUrl) {
          return {
            originalUrl: trimmedUrl,
            affiliateUrl: trackingUrl,
            affiliated: true,
            conversionStatus: 'CONVERTED' as const,
            raw: response,
          };
        } else if (response?.affiliated === false) {
          return {
            originalUrl: trimmedUrl,
            affiliateUrl: trackingUrl,
            affiliated: false,
            conversionStatus: 'NOT_AFFILIATED' as const,
            errorCategory: 'URL_NOT_ELIGIBLE',
            message: 'Merchant or URL is currently not affiliated in Cuelinks network',
            raw: response,
          };
        } else {
          // Unconfirmed or missing affiliated field
          return {
            originalUrl: trimmedUrl,
            affiliateUrl: trackingUrl,
            affiliated: false,
            conversionStatus: 'NOT_AFFILIATED' as const,
            errorCategory: 'UNCONFIRMED_ELIGIBILITY',
            message: 'Cuelinks response did not explicitly confirm affiliation',
            raw: response,
          };
        }
      } catch (err: any) {
        let errorCategory = 'CONVERSION_FAILED';
        if (err.statusCode === 401) {
          errorCategory = 'AUTHENTICATION_FAILED';
        } else if (err.statusCode === 403) {
          errorCategory = 'PERMISSION_DENIED';
        } else if (err.statusCode === 429) {
          errorCategory = 'RATE_LIMITED';
        } else if (err.statusCode === 504) {
          errorCategory = 'TIMEOUT';
        } else if (err.statusCode >= 500) {
          errorCategory = 'SERVER_ERROR';
        } else if (err.message && /network|econnrefused/i.test(err.message)) {
          errorCategory = 'NETWORK_ERROR';
        }

        return {
          originalUrl: trimmedUrl,
          affiliateUrl: null,
          affiliated: false,
          conversionStatus: 'FAILED' as const,
          errorCategory,
          message: err.message || 'Error occurred during affiliate link conversion',
        };
      } finally {
        this.inFlightConversions.delete(cacheKey);
      }
    })();

    this.inFlightConversions.set(cacheKey, conversionPromise);
    return conversionPromise;
  }

  public async convertOffer(offerId: string, actorId: string, actorRole?: string) {
    const offer = await prisma.offer.findUnique({
      where: { id: offerId },
      include: {
        product: true,
        merchant: true,
      },
    });

    if (!offer) {
      throw AppError.notFound('Offer not found');
    }

    // Role verification: Product Manager can only manage offers they have authority on
    if (actorRole === ROLES.PRODUCT_MANAGER && offer.createdById !== actorId) {
      // In Asli Cart, PMs can manage catalog offers if staff, but verify active status
    }

    // Set status to PENDING while converting
    await prisma.offer.update({
      where: { id: offer.id },
      data: {
        conversionStatus: 'PENDING',
      },
    });

    const result = await this.convertUrl(offer.originalUrl, {
      offerId: offer.id,
      subId1: offer.productId,
      subId2: offer.merchant.slug,
    });

    const updateData: any = {
      conversionStatus: result.conversionStatus,
      isAffiliated: result.affiliated,
      lastConvertedAt: new Date(),
      conversionError: result.errorCategory || null,
      affiliateProvider: 'CUELINKS',
    };

    if (result.conversionStatus === 'CONVERTED' && result.affiliateUrl) {
      updateData.affiliateUrl = result.affiliateUrl;

      // Store in affiliateLink repository for click attribution & historical auditing
      await prisma.affiliateLink.create({
        data: {
          offerId: offer.id,
          originalUrl: offer.originalUrl,
          affiliateUrl: result.affiliateUrl,
          provider: 'CUELINKS',
          subId1: offer.productId,
          subId2: offer.merchant.slug,
          status: 'ACTIVE',
          createdById: actorId,
        },
      });
    } else if (result.conversionStatus === 'FAILED') {
      // Preserve existing affiliateUrl and affiliated status if previously set; never destroy working tracking
      if (offer.affiliateUrl && (offer.isAffiliated || offer.conversionStatus === 'CONVERTED')) {
        updateData.affiliateUrl = offer.affiliateUrl;
        updateData.isAffiliated = true;
      } else if (!offer.affiliateUrl) {
        updateData.affiliateUrl = null;
      }
    }

    const updatedOffer = await prisma.offer.update({
      where: { id: offer.id },
      data: updateData,
      include: {
        product: { select: { id: true, name: true, slug: true, mainImage: true } },
        merchant: { select: { id: true, name: true, slug: true, logoUrl: true } },
      },
    });

    return {
      ...updatedOffer,
      offer: updatedOffer,
      conversionResult: result,
    };
  }

  public async getOfferAffiliateStatus(offerId: string) {
    const offer = await prisma.offer.findUnique({
      where: { id: offerId },
      include: {
        product: { select: { id: true, name: true } },
        merchant: { select: { id: true, name: true } },
        affiliateLinks: {
          orderBy: { createdAt: 'desc' },
          take: 5,
        },
      },
    });

    if (!offer) {
      throw AppError.notFound('Offer not found');
    }

    return {
      id: offer.id,
      offerId: offer.id,
      title: offer.title,
      productName: offer.product.name,
      merchantName: offer.merchant.name,
      originalUrl: offer.originalUrl,
      affiliateUrl: offer.affiliateUrl,
      affiliateProvider: offer.affiliateProvider || 'CUELINKS',
      conversionStatus: offer.conversionStatus,
      isAffiliated: offer.isAffiliated,
      lastConvertedAt: offer.lastConvertedAt,
      conversionError: offer.conversionError,
      recentLinks: offer.affiliateLinks,
    };
  }

  public async listAffiliateOffers(params: {
    page?: number;
    limit?: number;
    conversionStatus?: string;
    search?: string;
    merchantId?: string;
    productId?: string;
  }) {
    const page = Math.max(1, Number(params.page) || 1);
    const limit = Math.max(1, Math.min(100, Number(params.limit) || 20));
    const skip = (page - 1) * limit;

    const where: any = {};

    if (params.conversionStatus && params.conversionStatus !== 'all') {
      where.conversionStatus = params.conversionStatus;
    }

    if (params.merchantId) {
      where.merchantId = params.merchantId;
    }

    if (params.productId) {
      where.productId = params.productId;
    }

    if (params.search && params.search.trim().length > 0) {
      const q = params.search.trim();
      where.OR = [
        { title: { contains: q, mode: 'insensitive' } },
        { originalUrl: { contains: q, mode: 'insensitive' } },
        { product: { name: { contains: q, mode: 'insensitive' } } },
        { merchant: { name: { contains: q, mode: 'insensitive' } } },
      ];
    }

    const [items, total] = await Promise.all([
      prisma.offer.findMany({
        where,
        skip,
        take: limit,
        orderBy: { updatedAt: 'desc' },
        include: {
          product: { select: { id: true, name: true, slug: true, mainImage: true } },
          merchant: { select: { id: true, name: true, slug: true, logoUrl: true } },
          createdBy: { select: { id: true, fullName: true, email: true } },
        },
      }),
      prisma.offer.count({ where }),
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
}

export const cuelinksLinkConversionService = new CuelinksLinkConversionService();
