import { apiClient } from "@/services/api";
import type { ApiResponse } from "@/types/api";
import type {
  DiscoveredProductItem,
  SearchDiscoveryParams,
  ImportProductResponse,
} from "./types";

export const productDiscoveryService = {
  /**
   * Search external discovered products through backend discovery provider.
   * Endpoint: GET /api/v1/product-manager/discovery
   */
  async searchDiscovered(
    params: SearchDiscoveryParams = {}
  ): Promise<DiscoveredProductItem[]> {
    const searchParams = new URLSearchParams();
    if (params.keyword) searchParams.set("keyword", params.keyword);
    if (params.category) searchParams.set("category", params.category);
    if (params.merchant) searchParams.set("merchant", params.merchant);
    if (params.limit) searchParams.set("limit", String(params.limit));

    const query = searchParams.toString();
    const url = `/product-manager/discovery${query ? `?${query}` : ""}`;

    const response = await apiClient.get<ApiResponse<DiscoveredProductItem[]>>(url);

    if (!response.data.data) {
      throw new Error(
        response.data.message || "Failed to search discovered products"
      );
    }

    return response.data.data;
  },

  /**
   * Get single discovered product details by externalId.
   * Endpoint: GET /api/v1/product-manager/discovery/:externalId
   */
  async getDiscoveredItem(externalId: string): Promise<DiscoveredProductItem> {
    const response = await apiClient.get<ApiResponse<DiscoveredProductItem>>(
      `/product-manager/discovery/${encodeURIComponent(externalId)}`
    );

    if (!response.data.data) {
      throw new Error(
        response.data.message || "Discovered product not found"
      );
    }

    return response.data.data;
  },

  /**
   * Import discovered item into catalog as a DRAFT product and initial DRAFT offer.
   * Endpoint: POST /api/v1/product-manager/discovery/import
   */
  async importProduct(externalId: string): Promise<ImportProductResponse> {
    const response = await apiClient.post<ApiResponse<ImportProductResponse>>(
      "/product-manager/discovery/import",
      { externalId }
    );

    if (!response.data.data) {
      throw new Error(
        response.data.message || "Failed to import discovered product"
      );
    }

    return response.data.data;
  },
};

