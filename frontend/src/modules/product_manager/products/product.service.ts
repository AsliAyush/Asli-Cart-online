import { apiClient } from "@/services/api";
import type { ApiResponse, BackendPaginatedData } from "@/types/api";
import type {
  PMProductListItem,
  PMProductDetail,
  ListPMProductsParams,
  CreateProductInput,
  UpdateProductInput,
  ProductCategorySummary,
} from "./types";

export const pmProductService = {
  /**
   * List products with pagination, search, status, and category filters.
   * Endpoint: GET /api/v1/product-manager/products
   */
  async listProducts(
    params: ListPMProductsParams = {}
  ): Promise<BackendPaginatedData<PMProductListItem>> {
    const searchParams = new URLSearchParams();
    if (params.page) searchParams.set("page", String(params.page));
    if (params.limit) searchParams.set("limit", String(params.limit));
    if (params.categoryId) searchParams.set("categoryId", params.categoryId);
    if (params.status) searchParams.set("status", params.status);
    if (params.brand) searchParams.set("brand", params.brand);
    if (params.search) searchParams.set("search", params.search);
    if (typeof params.isAssignedToSmm === "boolean") {
      searchParams.set("isAssignedToSmm", String(params.isAssignedToSmm));
    }

    const query = searchParams.toString();
    const url = `/product-manager/products${query ? `?${query}` : ""}`;

    const response = await apiClient.get<
      ApiResponse<BackendPaginatedData<PMProductListItem>>
    >(url);

    if (!response.data.data) {
      throw new Error(response.data.message || "Failed to fetch products");
    }

    return response.data.data;
  },

  /**
   * Retrieve single product with full offers, category, and price histories.
   * Endpoint: GET /api/v1/product-manager/products/:id
   */
  async getProductById(id: string): Promise<PMProductDetail> {
    const response = await apiClient.get<ApiResponse<PMProductDetail>>(
      `/product-manager/products/${id}`
    );

    if (!response.data.data) {
      throw new Error(response.data.message || "Product not found");
    }

    return response.data.data;
  },

  /**
   * Create a new product.
   * Endpoint: POST /api/v1/product-manager/products
   */
  async createProduct(data: CreateProductInput): Promise<PMProductListItem> {
    const response = await apiClient.post<ApiResponse<PMProductListItem>>(
      "/product-manager/products",
      data
    );

    if (!response.data.data) {
      throw new Error(response.data.message || "Failed to create product");
    }

    return response.data.data;
  },

  /**
   * Update an existing product.
   * Endpoint: PATCH /api/v1/product-manager/products/:id
   */
  async updateProduct(
    id: string,
    data: UpdateProductInput
  ): Promise<PMProductListItem> {
    const response = await apiClient.patch<ApiResponse<PMProductListItem>>(
      `/product-manager/products/${id}`,
      data
    );

    if (!response.data.data) {
      throw new Error(response.data.message || "Failed to update product");
    }

    return response.data.data;
  },

  /**
   * Submit draft product for Admin approval.
   * Endpoint: PATCH /api/v1/product-manager/products/:id/submit-approval
   */
  async submitForApproval(id: string): Promise<PMProductListItem> {
    const response = await apiClient.patch<ApiResponse<PMProductListItem>>(
      `/product-manager/products/${id}/submit-approval`
    );

    if (!response.data.data) {
      throw new Error(
        response.data.message || "Failed to submit product for approval"
      );
    }

    return response.data.data;
  },

  /**
   * Soft archive product.
   * Endpoint: DELETE /api/v1/product-manager/products/:id
   */
  async archiveProduct(id: string): Promise<PMProductListItem> {
    const response = await apiClient.delete<ApiResponse<PMProductListItem>>(
      `/product-manager/products/${id}`
    );

    if (!response.data.data) {
      throw new Error(response.data.message || "Failed to archive product");
    }

    return response.data.data;
  },

  /**
   * Assign or unassign product to Social Media Manager.
   * Endpoint: PATCH /api/v1/product-manager/products/:id/assign-smm
   */
  async assignToSmm(
    id: string,
    isAssigned: boolean
  ): Promise<PMProductListItem> {
    const response = await apiClient.patch<ApiResponse<PMProductListItem>>(
      `/product-manager/products/${id}/assign-smm`,
      { isAssigned }
    );

    if (!response.data.data) {
      throw new Error(
        response.data.message || "Failed to update SMM assignment"
      );
    }

    return response.data.data;
  },

  /**
   * Fetch active categories for dropdown selection.
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

