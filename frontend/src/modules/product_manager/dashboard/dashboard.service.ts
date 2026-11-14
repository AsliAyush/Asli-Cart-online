import { apiClient } from "@/services/api";
import type { ApiResponse } from "@/types/api";
import type {
  ProductManagerSummary,
  RecentActivityData,
  PendingReviewsData,
} from "./types";

export const productManagerDashboardService = {
  /**
   * Fetch aggregate summary counts for products and offers.
   * Endpoint: GET /api/v1/product-manager/dashboard
   */
  async getSummary(): Promise<ProductManagerSummary> {
    const response = await apiClient.get<ApiResponse<ProductManagerSummary>>(
      "/product-manager/dashboard"
    );

    if (!response.data.data) {
      throw new Error(
        response.data.message || "Failed to retrieve dashboard summary"
      );
    }

    return response.data.data;
  },

  /**
   * Fetch recent catalog products and created offers.
   * Endpoint: GET /api/v1/product-manager/dashboard/recent-activity?limit=10
   */
  async getRecentActivity(limit = 10): Promise<RecentActivityData> {
    const response = await apiClient.get<ApiResponse<RecentActivityData>>(
      `/product-manager/dashboard/recent-activity?limit=${limit}`
    );

    if (!response.data.data) {
      throw new Error(
        response.data.message || "Failed to retrieve recent activity"
      );
    }

    return response.data.data;
  },

  /**
   * Fetch pending review items (products and offers awaiting admin approval).
   * Endpoint: GET /api/v1/product-manager/dashboard/pending-reviews
   */
  async getPendingReviews(): Promise<PendingReviewsData> {
    const response = await apiClient.get<ApiResponse<PendingReviewsData>>(
      "/product-manager/dashboard/pending-reviews"
    );

    if (!response.data.data) {
      throw new Error(
        response.data.message || "Failed to retrieve pending reviews"
      );
    }

    return response.data.data;
  },
};

