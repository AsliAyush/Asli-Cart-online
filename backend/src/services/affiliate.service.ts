import { affiliateLinkRepository, AffiliateLinkRepository } from '../repositories/affiliateLink.repository.js';
import { defaultAffiliateProvider, IAffiliateLinkProvider } from '../infra/integrations/affiliate/index.js';
import { AppError } from '../utils/appError.js';

export class AffiliateService {
  constructor(
    private affiliateRepo: AffiliateLinkRepository = affiliateLinkRepository,
    private provider: IAffiliateLinkProvider = defaultAffiliateProvider
  ) {}

  async convertUrl(params: {
    originalUrl: string;
    offerId?: string;
    subId1?: string;
    subId2?: string;
    actorId: string;
  }) {
    if (!this.provider.isValidMerchantUrl(params.originalUrl)) {
      throw AppError.badRequest('Invalid merchant URL provided');
    }

    const conversion = await this.provider.convertUrl(params.originalUrl, {
      subId1: params.subId1,
      subId2: params.subId2,
    });

    const link = await this.affiliateRepo.create({
      offerId: params.offerId,
      originalUrl: params.originalUrl,
      affiliateUrl: conversion.affiliateUrl,
      provider: conversion.provider,
      subId1: params.subId1,
      subId2: params.subId2,
      status: conversion.status,
      createdById: params.actorId,
    });

    return link;
  }

  async listLinks(params: {
    page: number;
    limit: number;
    offerId?: string;
    provider?: string;
    status?: string;
  }) {
    return this.affiliateRepo.findMany(params);
  }

  async getLinkById(id: string) {
    const link = await this.affiliateRepo.findById(id);
    if (!link) {
      throw AppError.notFound('Affiliate link not found');
    }
    return link;
  }
}

export const affiliateService = new AffiliateService();

