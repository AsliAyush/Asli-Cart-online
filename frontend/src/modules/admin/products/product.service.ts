import { apiClient } from "@/services/api";
import type { ApiResponse, BackendPaginatedData } from "@/types/api";
import type {
  AdminProductListItem,
  AdminProductDetail,
  ListProductsParams,
  ProductCategorySummary,
} from "./types";

export const adminProductService = {
  /**
   * List catalog products with pagination, category filter, status filter, and search.
   * Endpoint: GET /api/v1/product-manager/products
   */
  async listProducts(
    params: ListProductsParams = {}
  ): Promise<BackendPaginatedData<AdminProductListItem>> {
    const searchParams = new URLSearchParams();
    if (params.page) searchParams.set("page", String(params.page));
    if (params.limit) searchParams.set("limit", String(params.limit));
    if (params.categoryId) searchParams.set("categoryId", params.categoryId);
    if (params.status) searchParams.set("status", params.status);
    if (params.brand) searchParams.set("brand", params.brand);
    if (params.search) searchParams.set("search", params.search);

    const query = searchParams.toString();
    const url = `/product-manager/products${query ? `?${query}` : ""}`;

    const response = await apiClient.get<
      ApiResponse<BackendPaginatedData<AdminProductListItem>>
    >(url);

    if (!response.data.data) {
      throw new Error(response.data.message || "Failed to fetch products");
    }

    return response.data.data;
  },

  /**
   * Get complete product details by ID, including merchant offers and price histories.
   * Endpoint: GET /api/v1/product-manager/products/:id
   */
  async getProductById(id: string): Promise<AdminProductDetail> {
    const response = await apiClient.get<ApiResponse<AdminProductDetail>>(
      `/product-manager/products/${id}`
    );

    if (!response.data.data) {
      throw new Error(response.data.message || "Product not found");
    }

    return response.data.data;
  },

  /**
   * Archive or soft-delete a product.
   * Endpoint: DELETE /api/v1/product-manager/products/:id
   */
  async archiveProduct(id: string): Promise<AdminProductListItem> {
    const response = await apiClient.delete<ApiResponse<AdminProductListItem>>(
      `/product-manager/products/${id}`
    );

    if (!response.data.data) {
      throw new Error(response.data.message || "Failed to archive product");
    }

    return response.data.data;
  },

  /**
   * Fetch active categories for product filter dropdowns.
   * Endpoint: GET /api/v1/customer/products/categories
   */
  async getCategories(): Promise<ProductCategorySummary[]> {
    try {
      const response = await apiClient.get<ApiResponse<ProductCategorySummary[]>>(
        "/customer/products/categories"
      );
      return response.data.data || [];
    } catch {
      return [];
    }
  },
};

