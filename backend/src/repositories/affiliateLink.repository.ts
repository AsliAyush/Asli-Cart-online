import prisma from '../infra/database/prisma.js';
import { Prisma } from '@prisma/client';

export class AffiliateLinkRepository {
  async create(data: {
    offerId?: string;
    originalUrl: string;
    affiliateUrl: string;
    provider?: string;
    subId1?: string;
    subId2?: string;
    status?: string;
    createdById: string;
  }) {
    return prisma.affiliateLink.create({
      data: {
        offerId: data.offerId,
        originalUrl: data.originalUrl,
        affiliateUrl: data.affiliateUrl,
        provider: data.provider || 'CUELINKS',
        subId1: data.subId1,
        subId2: data.subId2,
        status: data.status || 'ACTIVE',
        createdById: data.createdById,
      },
    });
  }

  async findMany(params: {
    page: number;
    limit: number;
    offerId?: string;
    provider?: string;
    status?: string;
  }) {
    const { page, limit, offerId, provider, status } = params;
    const skip = (page - 1) * limit;

    const where: Prisma.AffiliateLinkWhereInput = {};
    if (offerId) where.offerId = offerId;
    if (provider) where.provider = provider;
    if (status) where.status = status;

    const [items, total] = await Promise.all([
      prisma.affiliateLink.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: {
          offer: {
            select: {
              id: true,
              title: true,
              merchant: { select: { id: true, name: true } },
            },
          },
        },
      }),
      prisma.affiliateLink.count({ where }),
    ]);

    return { items, total };
  }

  async findById(id: string) {
    return prisma.affiliateLink.findUnique({
      where: { id },
      include: {
        offer: {
          include: {
            product: true,
            merchant: true,
          },
        },
      },
    });
  }
}

export const affiliateLinkRepository = new AffiliateLinkRepository();

