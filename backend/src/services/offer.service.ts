import { offerRepository, OfferRepository } from '../repositories/offer.repository.js';
import { productRepository, ProductRepository } from '../repositories/product.repository.js';
import { merchantRepository, MerchantRepository } from '../repositories/merchant.repository.js';
import { priceHistoryRepository, PriceHistoryRepository } from '../repositories/priceHistory.repository.js';
import { affiliateLinkRepository, AffiliateLinkRepository } from '../repositories/affiliateLink.repository.js';
import { auditLogRepository, AuditLogRepository } from '../repositories/auditLog.repository.js';
import { pricingService, PricingService } from './pricing.service.js';
import { defaultAffiliateProvider, IAffiliateLinkProvider } from '../infra/integrations/affiliate/index.js';
import { AppError } from '../utils/appError.js';
import { ROLES } from '../constants/roles.js';
import { MODULES } from '../constants/modules.js';

export interface CreateOfferInput {
  productId: string;
  merchantId: string;
  title: string;
  originalPrice: number;
  sellingPrice: number;
  currency?: string;
  couponCode?: string;
  originalUrl: string;
  availability?: 'IN_STOCK' | 'OUT_OF_STOCK' | 'PRE_ORDER';
  startDate?: string;
  endDate?: string;
  priceSource?: string;
}

export interface UpdateOfferInput {
  title?: string;
  originalPrice?: number;
  sellingPrice?: number;
  currency?: string;
  couponCode?: string;
  originalUrl?: string;
  availability?: 'IN_STOCK' | 'OUT_OF_STOCK' | 'PRE_ORDER';
  startDate?: string;
  endDate?: string;
}

export class OfferService {
  constructor(
    private offerRepo: OfferRepository = offerRepository,
    private productRepo: ProductRepository = productRepository,
    private merchantRepo: MerchantRepository = merchantRepository,
    private priceHistoryRepo: PriceHistoryRepository = priceHistoryRepository,
    private affiliateRepo: AffiliateLinkRepository = affiliateLinkRepository,
    private auditRepo: AuditLogRepository = auditLogRepository,
    private pricingSvc: PricingService = pricingService,
    private affiliateProvider: IAffiliateLinkProvider = defaultAffiliateProvider
  ) {}

  async listOffers(params: {
    page: number;
    limit: number;
    productId?: string;
    merchantId?: string;
    status?: string;
    search?: string;
  }) {
    return this.offerRepo.findMany(params);
  }

  async getOfferById(id: string) {
    const offer = await this.offerRepo.findById(id);
    if (!offer) {
      throw AppError.notFound('Offer not found');
    }
    return offer;
  }

  async createOffer(input: CreateOfferInput, actorId: string) {
    const product = await this.productRepo.findById(input.productId);
    if (!product) {
      throw AppError.badRequest('Referenced product does not exist');
    }

    const merchant = await this.merchantRepo.findById(input.merchantId);
    if (!merchant) {
      throw AppError.badRequest('Referenced merchant does not exist');
    }

    const priceCalc = this.pricingSvc.calculateDiscount(input.originalPrice, input.sellingPrice);

    // Auto-generate affiliate URL via provider
    const conversion = await this.affiliateProvider.convertUrl(input.originalUrl, {
      subId1: product.id,
      subId2: merchant.slug,
    });

    const offer = await this.offerRepo.create({
      productId: input.productId,
      merchantId: input.merchantId,
      title: input.title,
      originalPrice: priceCalc.originalPrice,
      sellingPrice: priceCalc.sellingPrice,
      discountPercentage: priceCalc.discountPercentage,
      currency: input.currency || 'INR',
      couponCode: input.couponCode,
      originalUrl: input.originalUrl,
      affiliateUrl: conversion.affiliateUrl,
      availability: input.availability || 'IN_STOCK',
      status: 'DRAFT',
      priceVerifiedAt: new Date(),
      priceSource: input.priceSource || 'manual',
      startDate: input.startDate ? new Date(input.startDate) : undefined,
      endDate: input.endDate ? new Date(input.endDate) : undefined,
      createdById: actorId,
    });

    // Store affiliate link entry
    await this.affiliateRepo.create({
      offerId: offer.id,
      originalUrl: input.originalUrl,
      affiliateUrl: conversion.affiliateUrl,
      provider: conversion.provider,
      subId1: product.id,
      subId2: merchant.slug,
      status: conversion.status,
      createdById: actorId,
    });

    // Store initial price history
    await this.priceHistoryRepo.create({
      productId: product.id,
      offerId: offer.id,
      price: priceCalc.sellingPrice,
      originalPrice: priceCalc.originalPrice,
      discountPercentage: priceCalc.discountPercentage,
      currency: input.currency || 'INR',
      source: input.priceSource || 'manual',
    });

    await this.auditRepo.create({
      actorUserId: actorId,
      action: 'offer.create',
      moduleName: MODULES.OFFER,
      entityId: offer.id,
      metadata: { productId: product.id, merchantId: merchant.id, title: offer.title },
    });

    return offer;
  }

  async updateOffer(id: string, input: UpdateOfferInput, actorId: string) {
    const existing = await this.offerRepo.findById(id);
    if (!existing) {
      throw AppError.notFound('Offer not found');
    }

    const originalPrice = input.originalPrice !== undefined ? input.originalPrice : Number(existing.originalPrice);
    const sellingPrice = input.sellingPrice !== undefined ? input.sellingPrice : Number(existing.sellingPrice);

    const priceCalc = this.pricingSvc.calculateDiscount(originalPrice, sellingPrice);

    let newAffiliateUrl = existing.affiliateUrl;
    if (input.originalUrl && input.originalUrl !== existing.originalUrl) {
      const conversion = await this.affiliateProvider.convertUrl(input.originalUrl, {
        subId1: existing.productId,
        subId2: existing.merchant.slug,
      });
      newAffiliateUrl = conversion.affiliateUrl;

      await this.affiliateRepo.create({
        offerId: existing.id,
        originalUrl: input.originalUrl,
        affiliateUrl: conversion.affiliateUrl,
        provider: conversion.provider,
        subId1: existing.productId,
        subId2: existing.merchant.slug,
        status: conversion.status,
        createdById: actorId,
      });
    }

    const priceChanged =
      input.originalPrice !== undefined || input.sellingPrice !== undefined;

    const updated = await this.offerRepo.update(id, {
      ...(input.title ? { title: input.title } : {}),
      originalPrice: priceCalc.originalPrice,
      sellingPrice: priceCalc.sellingPrice,
      discountPercentage: priceCalc.discountPercentage,
      ...(input.currency ? { currency: input.currency } : {}),
      ...(input.couponCode !== undefined ? { couponCode: input.couponCode } : {}),
      ...(input.originalUrl ? { originalUrl: input.originalUrl, affiliateUrl: newAffiliateUrl } : {}),
      ...(input.availability ? { availability: input.availability } : {}),
      ...(input.startDate ? { startDate: new Date(input.startDate) } : {}),
      ...(input.endDate ? { endDate: new Date(input.endDate) } : {}),
      ...(priceChanged ? { priceVerifiedAt: new Date() } : {}),
    });

    // Record price history if price changed
    if (priceChanged) {
      await this.priceHistoryRepo.create({
        productId: existing.productId,
        offerId: existing.id,
        price: priceCalc.sellingPrice,
        originalPrice: priceCalc.originalPrice,
        discountPercentage: priceCalc.discountPercentage,
        currency: input.currency || existing.currency,
        source: 'manual_update',
      });
    }

    await this.auditRepo.create({
      actorUserId: actorId,
      action: 'offer.update',
      moduleName: MODULES.OFFER,
      entityId: id,
      metadata: { changes: Object.keys(input) },
    });

    return updated;
  }

  async submitForApproval(id: string, actorId: string) {
    const offer = await this.offerRepo.findById(id);
    if (!offer) {
      throw AppError.notFound('Offer not found');
    }

    if (offer.status === 'PENDING_APPROVAL') {
      throw AppError.badRequest('Offer is already pending approval');
    }

    if (['PUBLISHED', 'EXPIRED'].includes(offer.status)) {
      throw AppError.badRequest(`Cannot submit offer in ${offer.status} status for approval`);
    }

    const updated = await this.offerRepo.update(id, {
      status: 'PENDING_APPROVAL',
    });

    await this.auditRepo.create({
      actorUserId: actorId,
      action: 'offer.submit_approval',
      moduleName: MODULES.OFFER,
      entityId: id,
      metadata: { previousStatus: offer.status, newStatus: 'PENDING_APPROVAL' },
    });

    return updated;
  }

  async updateStatus(
    id: string,
    status: 'PAUSED' | 'EXPIRED',
    actorId: string,
    userRole: string
  ) {
    const offer = await this.offerRepo.findById(id);
    if (!offer) {
      throw AppError.notFound('Offer not found');
    }

    // Product Managers can only pause or expire offers, not directly approve or publish
    if (['APPROVED', 'PUBLISHED'].includes(status) && userRole !== ROLES.SUPER_ADMIN) {
      throw AppError.forbidden(
        'Product Managers cannot publish or approve offers directly. Admin review required.'
      );
    }

    const updated = await this.offerRepo.update(id, { status });

    await this.auditRepo.create({
      actorUserId: actorId,
      action: `offer.${status.toLowerCase()}`,
      moduleName: MODULES.OFFER,
      entityId: id,
      metadata: { previousStatus: offer.status, newStatus: status },
    });

    return updated;
  }
}

export const offerService = new OfferService();

