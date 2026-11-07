import prisma from '../infra/database/prisma.js';

export class PriceHistoryRepository {
  async create(data: {
    productId: string;
    offerId?: string;
    price: number;
    originalPrice?: number;
    discountPercentage?: number;
    currency?: string;
    source?: string;
  }) {
    return prisma.priceHistory.create({
      data: {
        productId: data.productId,
        offerId: data.offerId,
        price: data.price,
        originalPrice: data.originalPrice,
        discountPercentage: data.discountPercentage,
        currency: data.currency || 'INR',
        source: data.source || 'manual',
      },
    });
  }

  async findByProductId(productId: string, limit = 20) {
    return prisma.priceHistory.findMany({
      where: { productId },
      orderBy: { recordedAt: 'desc' },
      take: limit,
      include: {
        offer: {
          select: {
            id: true,
            title: true,
            merchant: {
              select: { id: true, name: true, slug: true },
            },
          },
        },
      },
    });
  }
}

export const priceHistoryRepository = new PriceHistoryRepository();

