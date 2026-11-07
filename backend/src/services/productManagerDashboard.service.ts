import { productRepository, ProductRepository } from '../repositories/product.repository.js';
import { offerRepository, OfferRepository } from '../repositories/offer.repository.js';

export class ProductManagerDashboardService {
  constructor(
    private productRepo: ProductRepository = productRepository,
    private offerRepo: OfferRepository = offerRepository
  ) {}

  async getSummary() {
    const [
      totalProducts,
      activeProducts,
      draftProducts,
      pendingProducts,
      assignedToSmm,
      totalOffers,
      activeOffers,
      expiredOffers,
      pendingOffers,
    ] = await Promise.all([
      this.productRepo.count(),
      this.productRepo.count({ status: 'APPROVED' }),
      this.productRepo.count({ status: 'DRAFT' }),
      this.productRepo.count({ status: 'PENDING_APPROVAL' }),
      this.productRepo.count({ isAssignedToSmm: true }),
      this.offerRepo.count(),
      this.offerRepo.count({ status: 'PUBLISHED' }),
      this.offerRepo.count({ status: 'EXPIRED' }),
      this.offerRepo.count({ status: 'PENDING_APPROVAL' }),
    ]);

    return {
      products: {
        total: totalProducts,
        active: activeProducts,
        draft: draftProducts,
        pendingApproval: pendingProducts,
        assignedToSmm,
      },
      offers: {
        total: totalOffers,
        active: activeOffers,
        expired: expiredOffers,
        pendingApproval: pendingOffers,
      },
    };
  }

  async getRecentActivity(limit = 10) {
    const [productsResult, offersResult] = await Promise.all([
      this.productRepo.findMany({ page: 1, limit }),
      this.offerRepo.findMany({ page: 1, limit }),
    ]);

    return {
      recentProducts: productsResult.items,
      recentOffers: offersResult.items,
    };
  }

  async getPendingReviews() {
    const [pendingProducts, pendingOffers] = await Promise.all([
      this.productRepo.findMany({ page: 1, limit: 50, status: 'PENDING_APPROVAL' }),
      this.offerRepo.findMany({ page: 1, limit: 50, status: 'PENDING_APPROVAL' }),
    ]);

    return {
      pendingProducts: pendingProducts.items,
      pendingOffers: pendingOffers.items,
      totalPending: pendingProducts.total + pendingOffers.total,
    };
  }
}

export const productManagerDashboardService = new ProductManagerDashboardService();

