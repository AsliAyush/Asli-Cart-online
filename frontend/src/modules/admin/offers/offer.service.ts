import { apiClient } from "@/services/api";
import type { ApiResponse, BackendPaginatedData } from "@/types/api";
import type {
  AdminOfferListItem,
  AdminOfferDetail,
  ListOffersParams,
} from "./types";

export const adminOfferService = {
  /**
   * List offers with server-side filtering, status selection, and search.
   * Endpoint: GET /api/v1/product-manager/offers
   */
  async listOffers(
    params: ListOffersParams = {}
  ): Promise<BackendPaginatedData<AdminOfferListItem>> {
    const searchParams = new URLSearchParams();
    if (params.page) searchParams.set("page", String(params.page));
    if (params.limit) searchParams.set("limit", String(params.limit));
    if (params.productId) searchParams.set("productId", params.productId);
    if (params.merchantId) searchParams.set("merchantId", params.merchantId);
    if (params.status) searchParams.set("status", params.status);
    if (params.search) searchParams.set("search", params.search);

    const query = searchParams.toString();
    const url = `/product-manager/offers${query ? `?${query}` : ""}`;

    const response = await apiClient.get<
      ApiResponse<BackendPaginatedData<AdminOfferListItem>>
    >(url);

    if (!response.data.data) {
      throw new Error(response.data.message || "Failed to fetch offers");
    }

    return response.data.data;
  },

  /**
   * Get full offer details by ID, including affiliate links and price histories.
   * Endpoint: GET /api/v1/product-manager/offers/:id
   */
  async getOfferById(id: string): Promise<AdminOfferDetail> {
    const response = await apiClient.get<ApiResponse<AdminOfferDetail>>(
      `/product-manager/offers/${id}`
    );

    if (!response.data.data) {
      throw new Error(response.data.message || "Offer not found");
    }

    return response.data.data;
  },

  /**
   * Update offer status (e.g. PAUSED or EXPIRED).
   * Endpoint: PATCH /api/v1/product-manager/offers/:id/status
   */
  async updateStatus(
    id: string,
    status: string
  ): Promise<AdminOfferListItem> {
    const response = await apiClient.patch<ApiResponse<AdminOfferListItem>>(
      `/product-manager/offers/${id}/status`,
      { status }
    );

    if (!response.data.data) {
      throw new Error(response.data.message || "Failed to update offer status");
    }

    return response.data.data;
  },

  /**
   * Submit draft offer for Admin review.
   * Endpoint: PATCH /api/v1/product-manager/offers/:id/submit-approval
   */
  async submitForApproval(id: string): Promise<AdminOfferListItem> {
    const response = await apiClient.patch<ApiResponse<AdminOfferListItem>>(
      `/product-manager/offers/${id}/submit-approval`
    );

    if (!response.data.data) {
      throw new Error(
        response.data.message || "Failed to submit offer for approval"
      );
    }

    return response.data.data;
  },

  /**
   * Super Admin approves an offer in PENDING_APPROVAL status.
   * Endpoint: PATCH /api/v1/admin/offers/:id/approve
   */
  async approveOffer(id: string): Promise<AdminOfferListItem> {
    const response = await apiClient.patch<ApiResponse<AdminOfferListItem>>(
      `/admin/offers/${id}/approve`
    );

    if (!response.data.data) {
      throw new Error(response.data.message || "Failed to approve offer");
    }

    return response.data.data;
  },

  /**
   * Super Admin rejects an offer with mandatory reason.
   * Endpoint: PATCH /api/v1/admin/offers/:id/reject
   */
  async rejectOffer(id: string, reason: string): Promise<AdminOfferListItem> {
    const response = await apiClient.patch<ApiResponse<AdminOfferListItem>>(
      `/admin/offers/${id}/reject`,
      { reason }
    );

    if (!response.data.data) {
      throw new Error(response.data.message || "Failed to reject offer");
    }

    return response.data.data;
  },

  /**
   * Super Admin publishes an approved offer.
   * Endpoint: PATCH /api/v1/admin/offers/:id/publish
   */
  async publishOffer(id: string): Promise<AdminOfferListItem> {
    const response = await apiClient.patch<ApiResponse<AdminOfferListItem>>(
      `/admin/offers/${id}/publish`
    );

    if (!response.data.data) {
      throw new Error(response.data.message || "Failed to publish offer");
    }

    return response.data.data;
  },
};

