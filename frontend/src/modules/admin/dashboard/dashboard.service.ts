import { apiClient } from "@/services/api";
import type { ApiResponse } from "@/types/api";
import type {
  AdminDashboardRawSummary,
  ProductManagerDashboardSummary,
  ConsolidatedAdminMetrics,
} from "./types";

export const adminDashboardService = {
  /**
   * Fetches the official Admin dashboard summary.
   * Endpoint: GET /api/v1/admin/dashboard
   */
  async getAdminSummary(): Promise<AdminDashboardRawSummary> {
    const response = await apiClient.get<ApiResponse<AdminDashboardRawSummary>>(
      "/admin/dashboard"
    );
    if (!response.data.data) {
      throw new Error(response.data.message || "Failed to fetch admin dashboard summary");
    }
    return response.data.data;
  },

  /**
   * Fetches the Product Manager catalog & offer summary.
   * Super Admin is authorized on this route.
   * Endpoint: GET /api/v1/product-manager/dashboard
   */
  async getCatalogMetrics(): Promise<ProductManagerDashboardSummary | null> {
    try {
      const response = await apiClient.get<ApiResponse<ProductManagerDashboardSummary>>(
        "/product-manager/dashboard"
      );
      return response.data.data ?? null;
    } catch {
      // Gracefully return null if unavailable
      return null;
    }
  },

  /**
   * Consolidates real backend counts from the available administrative endpoints.
   */
  async getConsolidatedMetrics(): Promise<ConsolidatedAdminMetrics> {
    const [adminSummary, catalogMetrics] = await Promise.all([
      this.getAdminSummary(),
      this.getCatalogMetrics(),
    ]);

    return {
      totalUsers: adminSummary.users.total,
      activeUsers: adminSummary.users.active,
      totalProducts: catalogMetrics?.products.total ?? adminSummary.products.total,
      approvedProducts: catalogMetrics?.products.active ?? 0,
      draftProducts: catalogMetrics?.products.draft ?? 0,
      pendingProducts: catalogMetrics?.products.pendingApproval ?? 0,
      totalOffers: catalogMetrics?.offers.total ?? adminSummary.offers.total,
      publishedOffers: catalogMetrics?.offers.active ?? adminSummary.offers.published,
      pendingOfferApprovals: catalogMetrics?.offers.pendingApproval ?? adminSummary.offers.pendingApprovals,
      expiredOffers: catalogMetrics?.offers.expired ?? 0,
    };
  },
};

