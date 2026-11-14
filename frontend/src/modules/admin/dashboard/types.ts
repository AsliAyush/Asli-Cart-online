/**
 * Asli Cart Super Admin Dashboard Types
 */

export interface AdminDashboardRawSummary {
  users: {
    total: number;
    active: number;
  };
  products: {
    total: number;
    _note: string;
  };
  offers: {
    total: number;
    published: number;
    pendingApprovals: number;
    _note: string;
  };
}

export interface ProductManagerDashboardSummary {
  products: {
    total: number;
    active: number;
    draft: number;
    pendingApproval: number;
    assignedToSmm: number;
  };
  offers: {
    total: number;
    active: number;
    expired: number;
    pendingApproval: number;
  };
}

export interface ConsolidatedAdminMetrics {
  totalUsers: number;
  activeUsers: number;
  totalProducts: number;
  approvedProducts: number;
  draftProducts: number;
  pendingProducts: number;
  totalOffers: number;
  publishedOffers: number;
  pendingOfferApprovals: number;
  expiredOffers: number;
}

