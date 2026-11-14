import { apiClient } from "@/services/api";
import type { ApiResponse } from "@/types/api";
import type {
  PriceCalculationResult,
  PriceHistoryItem,
} from "./types";

export const pricingService = {
  /**
   * Calculate honest discount percentage and monetary savings via backend calculator.
   * Endpoint: POST /api/v1/product-manager/pricing/calculate
   */
  async calculateDiscount(
    originalPrice: number,
    sellingPrice: number
  ): Promise<PriceCalculationResult> {
    const response = await apiClient.post<ApiResponse<PriceCalculationResult>>(
      "/product-manager/pricing/calculate",
      { originalPrice, sellingPrice }
    );

    if (!response.data.data) {
      throw new Error(
        response.data.message || "Failed to calculate discount"
      );
    }

    return response.data.data;
  },

  /**
   * Retrieve historical price tracking points for a product.
   * Endpoint: GET /api/v1/product-manager/pricing/history/:productId?limit=20
   */
  async getPriceHistory(
    productId: string,
    limit = 20
  ): Promise<PriceHistoryItem[]> {
    const response = await apiClient.get<ApiResponse<PriceHistoryItem[]>>(
      `/product-manager/pricing/history/${productId}?limit=${limit}`
    );

    if (!response.data.data) {
      throw new Error(
        response.data.message || "Failed to fetch price history"
      );
    }

    return response.data.data;
  },

  /**
   * Update offer pricing directly via the Offer API.
   * Endpoint: PATCH /api/v1/product-manager/offers/:id
   */
  async updateOfferPrice(
    offerId: string,
    data: { originalPrice: number; sellingPrice: number }
  ) {
    const response = await apiClient.patch(
      `/product-manager/offers/${offerId}`,
      data
    );

    return response.data;
  },
};

