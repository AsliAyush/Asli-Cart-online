import prisma from '../infra/database/prisma.js';
import { Prisma } from '@prisma/client';

export class AffiliateClickRepository {
  async create(data: {
    customerId?: string;
    offerId: string;
    productId: string;
    merchantId: string;
    affiliateLinkId?: string;
    clickReference: string;
    source?: string;
    ipAddress?: string;
    userAgent?: string;
  }) {
    return prisma.affiliateClick.create({
      data: {
        customerId: data.customerId,
        offerId: data.offerId,
        productId: data.productId,
        merchantId: data.merchantId,
        affiliateLinkId: data.affiliateLinkId,
        clickReference: data.clickReference,
        source: data.source || 'direct',
        ipAddress: data.ipAddress,
        userAgent: data.userAgent,
      },
      include: {
        offer: {
          include: {
            merchant: true,
          },
        },
        product: true,
      },
    });
  }

  async findByClickReference(clickReference: string) {
    return prisma.affiliateClick.findUnique({
      where: { clickReference },
      include: {
        offer: {
          include: {
            merchant: true,
            affiliateLinks: {
              where: { status: 'ACTIVE' },
              take: 1,
            },
          },
        },
        product: true,
        merchant: true,
      },
    });
  }

  async count(where?: Prisma.AffiliateClickWhereInput): Promise<number> {
    return prisma.affiliateClick.count({ where });
  }
}

export const affiliateClickRepository = new AffiliateClickRepository();

