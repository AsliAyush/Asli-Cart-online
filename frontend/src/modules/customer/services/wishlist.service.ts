import { apiClient } from "@/services/api";
import type { ApiResponse } from "@/types/api";
import type { CustomerWishlistResponse } from "../types";

export class CustomerWishlistService {
  /**
   * Fetch customer wishlist items
   * GET /api/v1/customer/wishlist
   */
  async getWishlist(): Promise<CustomerWishlistResponse> {
    const res = await apiClient.get<ApiResponse<CustomerWishlistResponse>>("/customer/wishlist");
    if (!res.data.data) {
      return {
        wishlistId: "",
        itemsCount: 0,
        items: [],
      };
    }
    return res.data.data;
  }

  /**
   * Add a product to wishlist
   * POST /api/v1/customer/wishlist/items
   */
  async addItem(productId: string): Promise<{ message: string; item: { itemId: string; productId: string; name: string } }> {
    const res = await apiClient.post<
      ApiResponse<{ message: string; item: { itemId: string; productId: string; name: string } }>
    >("/customer/wishlist/items", { productId });
    if (!res.data.data) {
      throw new Error("Failed to add product to wishlist");
    }
    return res.data.data;
  }

  /**
   * Remove an item from wishlist
   * DELETE /api/v1/customer/wishlist/items/:itemId
   */
  async removeItem(itemId: string): Promise<void> {
    await apiClient.delete(`/customer/wishlist/items/${encodeURIComponent(itemId)}`);
  }
}

export const customerWishlistService = new CustomerWishlistService();

