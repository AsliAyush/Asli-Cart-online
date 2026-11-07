import prisma from '../infra/database/prisma.js';
import { AppError } from '../utils/appError.js';

export class CustomerOfferService {
  async compareOffersForProduct(productId: string, sort: 'price_asc' | 'discount_desc' = 'price_asc') {
    const product = await prisma.product.findUnique({
      where: { id: productId, status: 'PUBLISHED' },
      select: { id: true, name: true, slug: true, brand: true, mainImage: true },
    });

    if (!product) {
      throw AppError.notFound('Product not found or currently unavailable');
    }

    const now = new Date();
    const offers = await prisma.offer.findMany({
      where: {
        productId,
        status: 'PUBLISHED',
        OR: [{ endDate: null }, { endDate: { gte: now } }],
      },
      include: {
        merchant: {
          select: {
            id: true,
            name: true,
            slug: true,
            logoUrl: true,
            websiteUrl: true,
          },
        },
      },
      orderBy: sort === 'discount_desc' ? { discountPercentage: 'desc' } : { sellingPrice: 'asc' },
    });

    return {
      product,
      totalOffers: offers.length,
      offers: offers.map((o) => ({
        id: o.id,
        merchant: o.merchant,
        title: o.title,
        originalPrice: Number(o.originalPrice),
        sellingPrice: Number(o.sellingPrice),
        savings: Number(o.originalPrice) - Number(o.sellingPrice),
        discountPercentage: Number(o.discountPercentage),
        currency: o.currency,
        couponCode: o.couponCode,
        availability: o.availability,
        priceVerifiedAt: o.priceVerifiedAt,
        endDate: o.endDate,
      })),
    };
  }

  async getOfferById(offerId: string) {
    const now = new Date();
    const offer = await prisma.offer.findUnique({
      where: { id: offerId },
      include: {
        product: {
          select: {
            id: true,
            name: true,
            slug: true,
            mainImage: true,
            brand: true,
            status: true,
          },
        },
        merchant: {
          select: {
            id: true,
            name: true,
            slug: true,
            logoUrl: true,
            websiteUrl: true,
          },
        },
      },
    });

    if (!offer || offer.status !== 'PUBLISHED' || offer.product.status !== 'PUBLISHED') {
      throw AppError.notFound('Offer not found or no longer available');
    }

    if (offer.endDate && offer.endDate < now) {
      throw AppError.badRequest('This offer has expired');
    }

    return {
      id: offer.id,
      title: offer.title,
      product: offer.product,
      merchant: offer.merchant,
      originalPrice: Number(offer.originalPrice),
      sellingPrice: Number(offer.sellingPrice),
      savings: Number(offer.originalPrice) - Number(offer.sellingPrice),
      discountPercentage: Number(offer.discountPercentage),
      currency: offer.currency,
      couponCode: offer.couponCode,
      availability: offer.availability,
      priceVerifiedAt: offer.priceVerifiedAt,
      startDate: offer.startDate,
      endDate: offer.endDate,
    };
  }
}

export const customerOfferService = new CustomerOfferService();

