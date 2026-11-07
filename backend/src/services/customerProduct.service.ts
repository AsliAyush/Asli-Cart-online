import prisma from '../infra/database/prisma.js';
import { Prisma } from '@prisma/client';
import { AppError } from '../utils/appError.js';

export interface ListCustomerProductsParams {
  page: number;
  limit: number;
  search?: string;
  brand?: string;
  category?: string; // slug or ID
  merchant?: string; // slug or ID
  minPrice?: number;
  maxPrice?: number;
  minDiscount?: number;
  sort?: 'newest' | 'price_asc' | 'price_desc' | 'discount_desc';
}

export class CustomerProductService {
  async listProducts(params: ListCustomerProductsParams) {
    const {
      page,
      limit,
      search,
      brand,
      category,
      merchant,
      minPrice,
      maxPrice,
      minDiscount,
      sort = 'newest',
    } = params;

    const skip = (page - 1) * limit;

    // Strict filter: Customers only see PUBLISHED products that have active PUBLISHED offers
    const now = new Date();
    const offerFilter: Prisma.OfferWhereInput = {
      status: 'PUBLISHED',
      availability: 'IN_STOCK',
      OR: [{ endDate: null }, { endDate: { gte: now } }],
    };

    if (merchant) {
      offerFilter.merchant = {
        OR: [{ slug: merchant }, { id: merchant }],
      };
    }

    if (typeof minPrice === 'number') {
      offerFilter.sellingPrice = {
        ...(offerFilter.sellingPrice as any),
        gte: minPrice,
      };
    }

    if (typeof maxPrice === 'number') {
      offerFilter.sellingPrice = {
        ...(offerFilter.sellingPrice as any),
        lte: maxPrice,
      };
    }

    if (typeof minDiscount === 'number') {
      offerFilter.discountPercentage = {
        gte: minDiscount,
      };
    }

    const where: Prisma.ProductWhereInput = {
      status: 'PUBLISHED',
      offers: {
        some: offerFilter,
      },
    };

    if (brand) {
      where.brand = { contains: brand, mode: 'insensitive' };
    }

    if (category) {
      where.category = {
        OR: [{ slug: category }, { id: category }],
      };
    }

    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } },
        { brand: { contains: search, mode: 'insensitive' } },
      ];
    }

    let orderBy: Prisma.ProductOrderByWithRelationInput = { createdAt: 'desc' };
    if (sort === 'newest') {
      orderBy = { createdAt: 'desc' };
    }

    const [rawProducts, total] = await Promise.all([
      prisma.product.findMany({
        where,
        skip,
        take: limit,
        orderBy,
        include: {
          category: {
            select: { id: true, name: true, slug: true },
          },
          offers: {
            where: offerFilter,
            include: {
              merchant: {
                select: { id: true, name: true, slug: true, logoUrl: true },
              },
            },
            orderBy: { sellingPrice: 'asc' },
          },
        },
      }),
      prisma.product.count({ where }),
    ]);

    // Format products with best deal highlight (lowest price)
    const items = rawProducts.map((p) => {
      const bestOffer = p.offers[0] || null;
      return {
        id: p.id,
        name: p.name,
        slug: p.slug,
        brand: p.brand,
        mainImage: p.mainImage,
        category: p.category,
        bestPrice: bestOffer ? Number(bestOffer.sellingPrice) : null,
        originalPrice: bestOffer ? Number(bestOffer.originalPrice) : null,
        discountPercentage: bestOffer ? Number(bestOffer.discountPercentage) : 0,
        merchantName: bestOffer?.merchant.name || null,
        merchantLogo: bestOffer?.merchant.logoUrl || null,
        totalOffers: p.offers.length,
        createdAt: p.createdAt,
      };
    });

    // Handle price or discount sorting in memory if requested
    if (sort === 'price_asc') {
      items.sort((a, b) => (a.bestPrice || 0) - (b.bestPrice || 0));
    } else if (sort === 'price_desc') {
      items.sort((a, b) => (b.bestPrice || 0) - (a.bestPrice || 0));
    } else if (sort === 'discount_desc') {
      items.sort((a, b) => b.discountPercentage - a.discountPercentage);
    }

    return {
      items,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async getProductDetails(idOrSlug: string) {
    const now = new Date();
    const product = await prisma.product.findFirst({
      where: {
        OR: [{ id: idOrSlug }, { slug: idOrSlug }],
        status: 'PUBLISHED',
      },
      include: {
        category: {
          select: { id: true, name: true, slug: true },
        },
        offers: {
          where: {
            status: 'PUBLISHED',
            OR: [{ endDate: null }, { endDate: { gte: now } }],
          },
          include: {
            merchant: {
              select: { id: true, name: true, slug: true, logoUrl: true, websiteUrl: true },
            },
          },
          orderBy: { sellingPrice: 'asc' },
        },
      },
    });

    if (!product) {
      throw AppError.notFound('Product not found or currently unavailable');
    }

    const bestOffer = product.offers[0] || null;

    return {
      id: product.id,
      name: product.name,
      slug: product.slug,
      description: product.description,
      brand: product.brand,
      mainImage: product.mainImage,
      additionalImages: product.additionalImages,
      specifications: product.specifications,
      category: product.category,
      bestPrice: bestOffer ? Number(bestOffer.sellingPrice) : null,
      maxDiscount: bestOffer ? Number(bestOffer.discountPercentage) : 0,
      offers: product.offers.map((o) => ({
        id: o.id,
        merchant: o.merchant,
        title: o.title,
        originalPrice: Number(o.originalPrice),
        sellingPrice: Number(o.sellingPrice),
        discountPercentage: Number(o.discountPercentage),
        currency: o.currency,
        couponCode: o.couponCode,
        availability: o.availability,
        priceVerifiedAt: o.priceVerifiedAt,
        endDate: o.endDate,
      })),
      createdAt: product.createdAt,
    };
  }

  async getCategories() {
    return prisma.category.findMany({
      where: { isActive: true },
      select: {
        id: true,
        name: true,
        slug: true,
        description: true,
        _count: {
          select: {
            products: {
              where: { status: 'PUBLISHED' },
            },
          },
        },
      },
      orderBy: { name: 'asc' },
    });
  }
}

export const customerProductService = new CustomerProductService();

