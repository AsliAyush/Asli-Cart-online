import { priceHistoryRepository, PriceHistoryRepository } from '../repositories/priceHistory.repository.js';
import { productRepository, ProductRepository } from '../repositories/product.repository.js';
import { offerRepository, OfferRepository } from '../repositories/offer.repository.js';
import { AppError } from '../utils/appError.js';

export interface PriceCalculation {
  originalPrice: number;
  sellingPrice: number;
  discountPercentage: number;
  savings: number;
}

export class PricingService {
  constructor(
    private priceHistoryRepo: PriceHistoryRepository = priceHistoryRepository,
    private productRepo: ProductRepository = productRepository,
    private offerRepo: OfferRepository = offerRepository
  ) {}

  calculateDiscount(originalPrice: number, sellingPrice: number): PriceCalculation {
    if (originalPrice < 0 || sellingPrice < 0) {
      throw AppError.badRequest('Prices cannot be negative numbers');
    }

    if (sellingPrice > originalPrice) {
      throw AppError.badRequest(
        'Selling price cannot be greater than original price (cannot represent a discount)'
      );
    }

    if (originalPrice === 0) {
      return {
        originalPrice: 0,
        sellingPrice: 0,
        discountPercentage: 0,
        savings: 0,
      };
    }

    const savings = originalPrice - sellingPrice;
    const discountPercentage = Number(((savings / originalPrice) * 100).toFixed(2));

    return {
      originalPrice,
      sellingPrice,
      discountPercentage,
      savings,
    };
  }

  async recordPriceChange(data: {
    productId: string;
    offerId?: string;
    price: number;
    originalPrice?: number;
    discountPercentage?: number;
    currency?: string;
    source?: string;
  }) {
    return this.priceHistoryRepo.create(data);
  }

  async getPriceHistory(productId: string, limit = 20) {
    const product = await this.productRepo.findById(productId);
    if (!product) {
      throw AppError.notFound('Product not found');
    }

    return this.priceHistoryRepo.findByProductId(productId, limit);
  }
}

export const pricingService = new PricingService();

