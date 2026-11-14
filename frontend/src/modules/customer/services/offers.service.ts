import { apiClient } from "@/services/api";
import type { ApiResponse } from "@/types/api";
import type { CompareOffersResponse, CustomerOfferDetails } from "../types";

export class CustomerOffersService {
  /**
   * Compare all published merchant offers for a given product
   * GET /api/v1/customer/offers/compare/:productId
   */
  async compareOffers(
    productId: string,
    sort?: "price_asc" | "discount_desc"
  ): Promise<CompareOffersResponse> {
    const res = await apiClient.get<ApiResponse<CompareOffersResponse>>(
      `/customer/offers/compare/${encodeURIComponent(productId)}`,
      { params: sort ? { sort } : undefined }
    );
    if (!res.data.data) {
      throw new Error("Unable to load offer comparison data");
    }
    return res.data.data;
  }

  /**
   * Fetch specific published merchant offer details
   * GET /api/v1/customer/offers/:id
   */
  async getOfferById(offerId: string): Promise<CustomerOfferDetails> {
    const res = await apiClient.get<ApiResponse<CustomerOfferDetails>>(
      `/customer/offers/${encodeURIComponent(offerId)}`
    );
    if (!res.data.data) {
      throw new Error("Offer not found or no longer available");
    }
    return res.data.data;
  }
}

export const customerOffersService = new CustomerOffersService();

