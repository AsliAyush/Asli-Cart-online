import { apiClient } from "@/services/api";
import type { ApiResponse, BackendPaginatedData } from "@/types/api";
import type {
  CustomerProductItem,
  CustomerProductDetails,
  CustomerCategoryItem,
  ListCustomerProductsParams,
} from "../types";

export class CustomerCatalogService {
  /**
   * List published products with best offer pricing and server-side filtering
   * GET /api/v1/customer/products
   */
  async listProducts(params?: ListCustomerProductsParams): Promise<BackendPaginatedData<CustomerProductItem>> {
    const res = await apiClient.get<ApiResponse<BackendPaginatedData<CustomerProductItem>>>(
      "/customer/products",
      { params }
    );
    if (!res.data.data) {
      return {
        items: [],
        pagination: { page: 1, limit: 20, total: 0, totalPages: 1 },
      };
    }
    return res.data.data;
  }

  /**
   * Fetch full product details with all published merchant offers
   * GET /api/v1/customer/products/:id
   */
  async getProductDetails(idOrSlug: string): Promise<CustomerProductDetails> {
    const res = await apiClient.get<ApiResponse<CustomerProductDetails>>(
      `/customer/products/${encodeURIComponent(idOrSlug)}`
    );
    if (!res.data.data) {
      throw new Error("Product not found or unavailable");
    }
    return res.data.data;
  }

  /**
   * Fetch active product categories with published product count
   * GET /api/v1/customer/products/categories
   */
  async getCategories(): Promise<CustomerCategoryItem[]> {
    const res = await apiClient.get<ApiResponse<CustomerCategoryItem[]>>(
      "/customer/products/categories"
    );
    return res.data.data || [];
  }

  /**
   * Quick search endpoint
   * GET /api/v1/customer/products/search?q=...
   */
  async searchProducts(q: string, page = 1, limit = 20): Promise<BackendPaginatedData<CustomerProductItem>> {
    const res = await apiClient.get<ApiResponse<BackendPaginatedData<CustomerProductItem>>>(
      "/customer/products/search",
      { params: { q, page, limit } }
    );
    if (!res.data.data) {
      return {
        items: [],
        pagination: { page: 1, limit, total: 0, totalPages: 1 },
      };
    }
    return res.data.data;
  }
}

export const customerCatalogService = new CustomerCatalogService();

