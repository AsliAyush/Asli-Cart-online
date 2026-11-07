import { wishlistRepository, WishlistRepository } from '../repositories/wishlist.repository.js';
import { productRepository, ProductRepository } from '../repositories/product.repository.js';
import { AppError } from '../utils/appError.js';

export class CustomerWishlistService {
  constructor(
    private wishlistRepo: WishlistRepository = wishlistRepository,
    private productRepo: ProductRepository = productRepository
  ) {}

  async getWishlist(customerId: string) {
    const wishlist = await this.wishlistRepo.getOrCreateWishlist(customerId);
    const wishlistData = await this.wishlistRepo.findByCustomerId(customerId);

    if (!wishlistData || !wishlistData.items.length) {
      return {
        wishlistId: wishlist.id,
        itemsCount: 0,
        items: [],
      };
    }

    const items = wishlistData.items.map((item) => {
      const product = item.product;
      const bestOffer = product.offers[0] || null;

      return {
        itemId: item.id,
        productId: product.id,
        name: product.name,
        slug: product.slug,
        brand: product.brand,
        mainImage: product.mainImage,
        category: product.category,
        isAvailable: product.status === 'PUBLISHED' && product.offers.length > 0,
        bestPrice: bestOffer ? Number(bestOffer.sellingPrice) : null,
        originalPrice: bestOffer ? Number(bestOffer.originalPrice) : null,
        discountPercentage: bestOffer ? Number(bestOffer.discountPercentage) : 0,
        merchantName: bestOffer?.merchant.name || null,
        totalOffers: product.offers.length,
        savedAt: item.createdAt,
      };
    });

    return {
      wishlistId: wishlist.id,
      itemsCount: items.length,
      items,
    };
  }

  async addToWishlist(customerId: string, productId: string) {
    const product = await this.productRepo.findById(productId);
    if (!product) {
      throw AppError.notFound('Product not found');
    }

    if (product.status !== 'PUBLISHED') {
      throw AppError.badRequest('Only published products can be added to your wishlist');
    }

    const wishlist = await this.wishlistRepo.getOrCreateWishlist(customerId);

    // Prevent duplicate wishlist entries
    const existing = await this.wishlistRepo.findItemByWishlistAndProduct(wishlist.id, productId);
    if (existing) {
      throw AppError.conflict('This product is already in your wishlist');
    }

    const item = await this.wishlistRepo.addItem({
      wishlistId: wishlist.id,
      productId,
    });

    return {
      message: 'Product added to wishlist',
      item: {
        itemId: item.id,
        productId: item.productId,
        name: item.product.name,
      },
    };
  }

  async removeFromWishlist(customerId: string, itemId: string) {
    const item = await this.wishlistRepo.findItemById(itemId);
    if (!item) {
      throw AppError.notFound('Wishlist item not found');
    }

    const customerWishlist = await this.wishlistRepo.getOrCreateWishlist(customerId);
    if (item.wishlistId !== customerWishlist.id) {
      throw AppError.forbidden('You do not have permission to remove this wishlist item');
    }

    await this.wishlistRepo.removeItem(itemId);
    return { message: 'Item removed from wishlist' };
  }
}

export const customerWishlistService = new CustomerWishlistService();

