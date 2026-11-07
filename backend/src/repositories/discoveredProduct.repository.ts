import prisma from '../infra/database/prisma.js';
import { Prisma } from '@prisma/client';

export class DiscoveredProductRepository {
  async findMany(params: {
    page: number;
    limit: number;
    merchantId?: string;
    imported?: boolean;
    search?: string;
  }) {
    const { page, limit, merchantId, imported, search } = params;
    const skip = (page - 1) * limit;

    const where: Prisma.DiscoveredProductWhereInput = {};
    if (merchantId) where.merchantId = merchantId;
    if (typeof imported === 'boolean') where.imported = imported;

    if (search) {
      where.OR = [
        { title: { contains: search, mode: 'insensitive' } },
        { brand: { contains: search, mode: 'insensitive' } },
      ];
    }

    const [items, total] = await Promise.all([
      prisma.discoveredProduct.findMany({
        where,
        skip,
        take: limit,
        orderBy: { discoveredAt: 'desc' },
        include: {
          merchant: true,
        },
      }),
      prisma.discoveredProduct.count({ where }),
    ]);

    return { items, total };
  }

  async findById(id: string) {
    return prisma.discoveredProduct.findUnique({
      where: { id },
      include: {
        merchant: true,
      },
    });
  }

  async findByExternalId(merchantId: string, externalId: string) {
    return prisma.discoveredProduct.findUnique({
      where: {
        merchantId_externalId: {
          merchantId,
          externalId,
        },
      },
    });
  }

  async create(data: {
    externalId: string;
    merchantId: string;
    title: string;
    brand?: string;
    category?: string;
    price: number;
    originalPrice?: number;
    discountPercentage?: number;
    currency?: string;
    imageUrl?: string;
    productUrl: string;
    imported?: boolean;
  }) {
    return prisma.discoveredProduct.create({
      data: {
        externalId: data.externalId,
        merchantId: data.merchantId,
        title: data.title,
        brand: data.brand,
        category: data.category,
        price: data.price,
        originalPrice: data.originalPrice,
        discountPercentage: data.discountPercentage,
        currency: data.currency || 'INR',
        imageUrl: data.imageUrl,
        productUrl: data.productUrl,
        imported: data.imported ?? false,
      },
    });
  }

  async markImported(id: string, importedProductId: string) {
    return prisma.discoveredProduct.update({
      where: { id },
      data: {
        imported: true,
        importedProductId,
      },
    });
  }
}

export const discoveredProductRepository = new DiscoveredProductRepository();

