import { apiClient } from "@/services/api";
import type { ApiResponse, BackendPaginatedData } from "@/types/api";
import type {
  PMOfferListItem,
  PMOfferDetail,
  ListPMOffersParams,
  CreateOfferInput,
  UpdateOfferInput,
} from "./types";

export const pmOfferService = {
  /**
   * List offers with pagination, status filter, and search.
   * Endpoint: GET /api/v1/product-manager/offers
   */
  async listOffers(
    params: ListPMOffersParams = {}
  ): Promise<BackendPaginatedData<PMOfferListItem>> {
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
      ApiResponse<BackendPaginatedData<PMOfferListItem>>
    >(url);

    if (!response.data.data) {
      throw new Error(response.data.message || "Failed to fetch offers");
    }

    return response.data.data;
  },

  /**
   * Fetch single offer details including rejectionReason, affiliate links, and price history.
   * Endpoint: GET /api/v1/product-manager/offers/:id
   */
  async getOfferById(id: string): Promise<PMOfferDetail> {
    const response = await apiClient.get<ApiResponse<PMOfferDetail>>(
      `/product-manager/offers/${id}`
    );

    if (!response.data.data) {
      throw new Error(response.data.message || "Offer not found");
    }

    return response.data.data;
  },

  /**
   * Create a new merchant offer in DRAFT status.
   * Endpoint: POST /api/v1/product-manager/offers
   */
  async createOffer(data: CreateOfferInput): Promise<PMOfferListItem> {
    const response = await apiClient.post<ApiResponse<PMOfferListItem>>(
      "/product-manager/offers",
      data
    );

    if (!response.data.data) {
      throw new Error(response.data.message || "Failed to create offer");
    }

    return response.data.data;
  },

  /**
   * Update offer details (e.g. correct rejected offer price or title).
   * Endpoint: PATCH /api/v1/product-manager/offers/:id
   */
  async updateOffer(
    id: string,
    data: UpdateOfferInput
  ): Promise<PMOfferListItem> {
    const response = await apiClient.patch<ApiResponse<PMOfferListItem>>(
      `/product-manager/offers/${id}`,
      data
    );

    if (!response.data.data) {
      throw new Error(response.data.message || "Failed to update offer");
    }

    return response.data.data;
  },

  /**
   * Submit offer for Admin review and approval.
   * Resets rejectionReason and transitions status to PENDING_APPROVAL.
   * Exact Endpoint: PATCH /api/v1/product-manager/offers/:id/submit-approval
   */
  async submitForApproval(id: string): Promise<PMOfferListItem> {
    const response = await apiClient.patch<ApiResponse<PMOfferListItem>>(
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
   * Transition offer status to PAUSED or EXPIRED.
   * Product Managers can only set PAUSED or EXPIRED.
   * Endpoint: PATCH /api/v1/product-manager/offers/:id/status
   */
  async updateStatus(
    id: string,
    status: "PAUSED" | "EXPIRED"
  ): Promise<PMOfferListItem> {
    const response = await apiClient.patch<ApiResponse<PMOfferListItem>>(
      `/product-manager/offers/${id}/status`,
      { status }
    );

    if (!response.data.data) {
      throw new Error(
        response.data.message || `Failed to update offer status to ${status}`
      );
    }

    return response.data.data;
  },

  /**
   * Convert or retry converting an offer original URL into an affiliate link via Cuelinks.
   * Endpoint: POST /api/v1/product-manager/offers/:id/affiliate/convert
   */
  async convertAffiliateLink(id: string): Promise<any> {
    const response = await apiClient.post<ApiResponse<any>>(
      `/product-manager/offers/${id}/affiliate/convert`
    );

    if (!response.data.data) {
      throw new Error(response.data.message || 'Failed to convert affiliate link');
    }

    return response.data.data;
  },

  /**
   * Get affiliate conversion status for an offer.
   * Endpoint: GET /api/v1/product-manager/offers/:id/affiliate/status
   */
  async getAffiliateStatus(id: string): Promise<any> {
    const response = await apiClient.get<ApiResponse<any>>(
      `/product-manager/offers/${id}/affiliate/status`
    );

    if (!response.data.data) {
      throw new Error(response.data.message || 'Failed to fetch affiliate status');
    }

    return response.data.data;
  },
};

