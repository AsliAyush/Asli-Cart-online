import prisma from '../infra/database/prisma.js';
import { Prisma } from '@prisma/client';

export class OfferRepository {
  async findMany(params: {
    page: number;
    limit: number;
    productId?: string;
    merchantId?: string;
    status?: string;
    search?: string;
  }) {
    const { page, limit, productId, merchantId, status, search } = params;
    const skip = (page - 1) * limit;

    const where: Prisma.OfferWhereInput = {};

    if (productId) where.productId = productId;
    if (merchantId) where.merchantId = merchantId;
    if (status) where.status = status;

    if (search) {
      where.OR = [
        { title: { contains: search, mode: 'insensitive' } },
        { product: { name: { contains: search, mode: 'insensitive' } } },
      ];
    }

    const [items, total] = await Promise.all([
      prisma.offer.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: {
          product: {
            select: { id: true, name: true, slug: true, mainImage: true },
          },
          merchant: {
            select: { id: true, name: true, slug: true, logoUrl: true },
          },
          createdBy: {
            select: { id: true, fullName: true, email: true },
          },
        },
      }),
      prisma.offer.count({ where }),
    ]);

    return { items, total };
  }

  async findById(id: string) {
    return prisma.offer.findUnique({
      where: { id },
      include: {
        product: true,
        merchant: true,
        createdBy: {
          select: { id: true, fullName: true, email: true },
        },
        priceHistories: {
          orderBy: { recordedAt: 'desc' },
          take: 10,
        },
        affiliateLinks: {
          orderBy: { createdAt: 'desc' },
        },
      },
    });
  }

  async create(data: {
    productId: string;
    merchantId: string;
    title: string;
    originalPrice: number;
    sellingPrice: number;
    discountPercentage: number;
    currency?: string;
    couponCode?: string;
    originalUrl: string;
    affiliateUrl?: string;
    availability?: string;
    status?: string;
    priceVerifiedAt?: Date;
    priceSource?: string;
    startDate?: Date;
    endDate?: Date;
    createdById: string;
  }) {
    return prisma.offer.create({
      data: {
        productId: data.productId,
        merchantId: data.merchantId,
        title: data.title,
        originalPrice: data.originalPrice,
        sellingPrice: data.sellingPrice,
        discountPercentage: data.discountPercentage,
        currency: data.currency || 'INR',
        couponCode: data.couponCode,
        originalUrl: data.originalUrl,
        affiliateUrl: data.affiliateUrl,
        availability: data.availability || 'IN_STOCK',
        status: data.status || 'DRAFT',
        priceVerifiedAt: data.priceVerifiedAt || new Date(),
        priceSource: data.priceSource || 'manual',
        startDate: data.startDate,
        endDate: data.endDate,
        createdById: data.createdById,
      },
      include: {
        product: true,
        merchant: true,
      },
    });
  }

  async update(id: string, data: Prisma.OfferUpdateInput) {
    return prisma.offer.update({
      where: { id },
      data,
      include: {
        product: true,
        merchant: true,
      },
    });
  }

  async count(where?: Prisma.OfferWhereInput): Promise<number> {
    return prisma.offer.count({ where });
  }
}

export const offerRepository = new OfferRepository();

