import { apiClient } from "@/services/api";
import type { ApiResponse, BackendPaginatedData } from "@/types/api";
import type {
  AffiliateLinkItem,
  ConvertAffiliateInput,
  ListAffiliateLinksParams,
} from "./types";

export const pmAffiliateService = {
  /**
   * Convert raw merchant URL into tracked affiliate link using backend integration.
   * Endpoint: POST /api/v1/product-manager/affiliate/convert
   */
  async convertUrl(params: ConvertAffiliateInput): Promise<AffiliateLinkItem> {
    const response = await apiClient.post<ApiResponse<AffiliateLinkItem>>(
      "/product-manager/affiliate/convert",
      params
    );

    if (!response.data.data) {
      throw new Error(
        response.data.message || "Failed to convert affiliate URL"
      );
    }

    return response.data.data;
  },

  /**
   * List generated affiliate links.
   * Endpoint: GET /api/v1/product-manager/affiliate/links
   */
  async listLinks(
    params: ListAffiliateLinksParams = {}
  ): Promise<BackendPaginatedData<AffiliateLinkItem>> {
    const searchParams = new URLSearchParams();
    if (params.page) searchParams.set("page", String(params.page));
    if (params.limit) searchParams.set("limit", String(params.limit));
    if (params.offerId) searchParams.set("offerId", params.offerId);
    if (params.provider) searchParams.set("provider", params.provider);
    if (params.status) searchParams.set("status", params.status);

    const query = searchParams.toString();
    const url = `/product-manager/affiliate/links${query ? `?${query}` : ""}`;

    const response = await apiClient.get<
      ApiResponse<BackendPaginatedData<AffiliateLinkItem>>
    >(url);

    if (!response.data.data) {
      throw new Error(
        response.data.message || "Failed to list affiliate links"
      );
    }

    return response.data.data;
  },
};

