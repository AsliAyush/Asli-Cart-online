import { apiClient } from "@/services/api";
import type { ApiResponse } from "@/types/api";
import type { CustomerDashboardSummary } from "../types";

export class CustomerDashboardService {
  /**
   * Fetch customer dashboard summary: stats, recent cart items, recommended deals
   * GET /api/v1/customer/dashboard/summary
   */
  async getSummary(): Promise<CustomerDashboardSummary> {
    const res = await apiClient.get<ApiResponse<CustomerDashboardSummary>>(
      "/customer/dashboard/summary"
    );
    if (!res.data.data) {
      return {
        stats: { totalCartItems: 0, totalWishlistItems: 0 },
        recentCartItems: [],
        recommendedDeals: [],
      };
    }
    return res.data.data;
  }
}

export const customerDashboardService = new CustomerDashboardService();

