import prisma from '../infra/database/prisma.js';
import { cartRepository, CartRepository } from '../repositories/cart.repository.js';
import { wishlistRepository, WishlistRepository } from '../repositories/wishlist.repository.js';

export class CustomerDashboardService {
  constructor(
    private cartRepo: CartRepository = cartRepository,
    private wishlistRepo: WishlistRepository = wishlistRepository
  ) {}

  async getSummary(customerId: string) {
    const [cart, wishlist] = await Promise.all([
      this.cartRepo.getOrCreateCart(customerId),
      this.wishlistRepo.getOrCreateWishlist(customerId),
    ]);

    const [totalCartItems, totalWishlistItems, recentCartData, topDeals] = await Promise.all([
      this.cartRepo.countItems(cart.id),
      this.wishlistRepo.countItems(wishlist.id),
      prisma.cartItem.findMany({
        where: { cartId: cart.id },
        take: 3,
        orderBy: { createdAt: 'desc' },
        include: {
          offer: {
            include: {
              product: {
                select: { id: true, name: true, slug: true, mainImage: true },
              },
              merchant: {
                select: { id: true, name: true, slug: true, logoUrl: true },
              },
            },
          },
        },
      }),
      // Real recommended published offers with highest discounts
      prisma.offer.findMany({
        where: {
          status: 'PUBLISHED',
          availability: 'IN_STOCK',
          product: { status: 'PUBLISHED' },
        },
        take: 4,
        orderBy: { discountPercentage: 'desc' },
        include: {
          product: {
            select: { id: true, name: true, slug: true, mainImage: true, brand: true },
          },
          merchant: {
            select: { id: true, name: true, slug: true, logoUrl: true },
          },
        },
      }),
    ]);

    return {
      stats: {
        totalCartItems,
        totalWishlistItems,
      },
      recentCartItems: recentCartData.map((item) => ({
        itemId: item.id,
        quantity: item.quantity,
        title: item.offer.title,
        productName: item.offer.product.name,
        mainImage: item.offer.product.mainImage,
        merchantName: item.offer.merchant.name,
        sellingPrice: Number(item.offer.sellingPrice),
        addedAt: item.createdAt,
      })),
      recommendedDeals: topDeals.map((deal) => ({
        offerId: deal.id,
        title: deal.title,
        productName: deal.product.name,
        brand: deal.product.brand,
        mainImage: deal.product.mainImage,
        merchantName: deal.merchant.name,
        originalPrice: Number(deal.originalPrice),
        sellingPrice: Number(deal.sellingPrice),
        discountPercentage: Number(deal.discountPercentage),
      })),
    };
  }
}

export const customerDashboardService = new CustomerDashboardService();

