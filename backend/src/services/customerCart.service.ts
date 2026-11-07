import crypto from 'crypto';
import { cartRepository, CartRepository } from '../repositories/cart.repository.js';
import { offerRepository, OfferRepository } from '../repositories/offer.repository.js';
import { affiliateClickRepository, AffiliateClickRepository } from '../repositories/affiliateClick.repository.js';
import { AppError } from '../utils/appError.js';

export class CustomerCartService {
  constructor(
    private cartRepo: CartRepository = cartRepository,
    private offerRepo: OfferRepository = offerRepository,
    private clickRepo: AffiliateClickRepository = affiliateClickRepository
  ) {}

  async getCart(customerId: string) {
    const cart = await this.cartRepo.getOrCreateCart(customerId);
    const cartData = await this.cartRepo.findByCustomerId(customerId);

    if (!cartData || !cartData.items.length) {
      return {
        cartId: cart.id,
        itemsCount: 0,
        subtotal: 0,
        currency: 'INR',
        merchantGroups: [],
        items: [],
      };
    }

    const now = new Date();
    let subtotal = 0;
    const merchantMap = new Map<string, { merchant: any; items: any[]; groupSubtotal: number }>();

    const items = cartData.items.map((item) => {
      const offer = item.offer;
      const currentSellingPrice = Number(offer.sellingPrice);
      const originalPrice = Number(offer.originalPrice);
      const snapshotPrice = Number(item.priceSnapshot);

      const isExpired = offer.endDate ? new Date(offer.endDate) < now : false;
      const isEligible = offer.status === 'PUBLISHED' && !isExpired && offer.availability === 'IN_STOCK';
      const hasPriceChanged = snapshotPrice !== currentSellingPrice;
      const priceDifference = currentSellingPrice - snapshotPrice;

      if (isEligible) {
        subtotal += currentSellingPrice * item.quantity;
      }

      const itemFormatted = {
        itemId: item.id,
        quantity: item.quantity,
        offerId: offer.id,
        title: offer.title,
        product: offer.product,
        merchant: offer.merchant,
        snapshotPrice,
        currentSellingPrice,
        originalPrice,
        discountPercentage: Number(offer.discountPercentage),
        currency: offer.currency,
        couponCode: offer.couponCode,
        isEligible,
        isExpired,
        hasPriceChanged,
        priceDifference,
        itemSubtotal: isEligible ? currentSellingPrice * item.quantity : 0,
        createdAt: item.createdAt,
      };

      // Group by merchant for retailer-specific checkout journeys
      const merchantId = offer.merchant.id;
      if (!merchantMap.has(merchantId)) {
        merchantMap.set(merchantId, {
          merchant: offer.merchant,
          items: [],
          groupSubtotal: 0,
        });
      }
      const group = merchantMap.get(merchantId)!;
      group.items.push(itemFormatted);
      if (isEligible) {
        group.groupSubtotal += currentSellingPrice * item.quantity;
      }

      return itemFormatted;
    });

    return {
      cartId: cart.id,
      itemsCount: items.reduce((acc, curr) => acc + curr.quantity, 0),
      subtotal: Math.round(subtotal * 100) / 100,
      currency: 'INR',
      merchantGroups: Array.from(merchantMap.values()),
      items,
    };
  }

  async addToCart(customerId: string, offerId: string, quantity: number = 1) {
    if (quantity < 1) {
      throw AppError.badRequest('Quantity must be at least 1');
    }

    const offer = await this.offerRepo.findById(offerId);
    if (!offer) {
      throw AppError.notFound('Offer not found');
    }

    if (offer.status !== 'PUBLISHED') {
      throw AppError.badRequest('This offer is not currently active for purchase');
    }

    const now = new Date();
    if (offer.endDate && new Date(offer.endDate) < now) {
      throw AppError.badRequest('This merchant offer has expired');
    }

    if (offer.availability === 'OUT_OF_STOCK') {
      throw AppError.badRequest('This product offer is currently out of stock');
    }

    const cart = await this.cartRepo.getOrCreateCart(customerId);

    // Check if offer is already in cart
    const existingItem = await this.cartRepo.findItemByCartAndOffer(cart.id, offerId);
    if (existingItem) {
      // Update existing item quantity
      const newQuantity = existingItem.quantity + quantity;
      return this.cartRepo.updateItemQuantity(existingItem.id, newQuantity);
    }

    // Add new cart item with price snapshot
    return this.cartRepo.addItem({
      cartId: cart.id,
      offerId,
      quantity,
      priceSnapshot: Number(offer.sellingPrice),
    });
  }

  async updateItemQuantity(customerId: string, itemId: string, quantity: number) {
    if (quantity < 1) {
      throw AppError.badRequest('Quantity must be at least 1');
    }

    const item = await this.cartRepo.findItemById(itemId);
    if (!item) {
      throw AppError.notFound('Cart item not found');
    }

    // Enforce IDOR protection: item must belong to customer's cart
    const customerCart = await this.cartRepo.getOrCreateCart(customerId);
    if (item.cartId !== customerCart.id) {
      throw AppError.forbidden('You do not have permission to modify this cart item');
    }

    return this.cartRepo.updateItemQuantity(itemId, quantity);
  }

  async removeItem(customerId: string, itemId: string) {
    const item = await this.cartRepo.findItemById(itemId);
    if (!item) {
      throw AppError.notFound('Cart item not found');
    }

    // Enforce IDOR protection
    const customerCart = await this.cartRepo.getOrCreateCart(customerId);
    if (item.cartId !== customerCart.id) {
      throw AppError.forbidden('You do not have permission to remove this cart item');
    }

    await this.cartRepo.removeItem(itemId);
    return { message: 'Item removed from cart' };
  }

  async clearCart(customerId: string) {
    const customerCart = await this.cartRepo.getOrCreateCart(customerId);
    await this.cartRepo.clearCart(customerCart.id);
    return { message: 'Cart cleared successfully' };
  }

  async generateMerchantRedirect(params: {
    customerId: string;
    offerId: string;
    source?: string;
    ipAddress?: string;
    userAgent?: string;
  }) {
    const { customerId, offerId, source = 'cart', ipAddress, userAgent } = params;

    const offer = await this.offerRepo.findById(offerId);
    if (!offer) {
      throw AppError.notFound('Offer not found');
    }

    if (offer.status !== 'PUBLISHED') {
      throw AppError.badRequest('This offer is no longer available');
    }

    // Resolve affiliate link
    const affiliateLink = offer.affiliateLinks && offer.affiliateLinks.length > 0
      ? offer.affiliateLinks[0]
      : null;

    // Generate unique click reference token
    const clickReference = `clk_${Date.now()}_${crypto.randomBytes(6).toString('hex')}`;

    // Record click attribution
    await this.clickRepo.create({
      customerId,
      offerId,
      productId: offer.productId,
      merchantId: offer.merchantId,
      affiliateLinkId: affiliateLink ? affiliateLink.id : undefined,
      clickReference,
      source,
      ipAddress,
      userAgent,
    });

    // Stored destination URL (strictly from database, never user-injected)
    const destinationUrl = affiliateLink ? affiliateLink.affiliateUrl : (offer.affiliateUrl || offer.originalUrl);

    return {
      clickReference,
      redirectPath: `/api/v1/customer/redirect/${clickReference}`,
      merchant: {
        id: offer.merchant.id,
        name: offer.merchant.name,
        slug: offer.merchant.slug,
        websiteUrl: offer.merchant.websiteUrl,
      },
      product: {
        id: offer.product.id,
        name: offer.product.name,
      },
      offer: {
        id: offer.id,
        title: offer.title,
        sellingPrice: Number(offer.sellingPrice),
      },
      destinationUrl,
    };
  }
}

export const customerCartService = new CustomerCartService();

