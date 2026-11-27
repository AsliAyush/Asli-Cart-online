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
    // Clean params to avoid sending empty search parameters or empty strings
    const cleanParams: Record<string, any> = {};
    if (params) {
      for (const [key, val] of Object.entries(params)) {
        if (val !== undefined && val !== null && val !== "") {
          cleanParams[key] = val;
        }
      }
    }

    const res = await apiClient.get<ApiResponse<BackendPaginatedData<CustomerProductItem>>>(
      "/customer/products",
      { params: cleanParams }
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

