import { apiClient } from "@/services/api";
import type { ApiResponse } from "@/types/api";
import type { CustomerCartResponse, MerchantRedirectResponse } from "../types";

export class CustomerCartService {
  /**
   * Fetch current customer shopping cart with merchant groups
   * GET /api/v1/customer/cart
   */
  async getCart(): Promise<CustomerCartResponse> {
    const res = await apiClient.get<ApiResponse<CustomerCartResponse>>("/customer/cart");
    if (!res.data.data) {
      return {
        cartId: "",
        itemsCount: 0,
        subtotal: 0,
        currency: "INR",
        merchantGroups: [],
        items: [],
      };
    }
    return res.data.data;
  }

  /**
   * Add a merchant offer to cart
   * POST /api/v1/customer/cart/items
   */
  async addItem(offerId: string, quantity = 1): Promise<{ id: string; quantity: number }> {
    const res = await apiClient.post<ApiResponse<{ id: string; quantity: number }>>(
      "/customer/cart/items",
      { offerId, quantity }
    );
    if (!res.data.data) {
      throw new Error("Failed to add item to cart");
    }
    return res.data.data;
  }

  /**
   * Update quantity of a cart item
   * PATCH /api/v1/customer/cart/items/:itemId
   */
  async updateQuantity(itemId: string, quantity: number): Promise<{ id: string; quantity: number }> {
    const res = await apiClient.patch<ApiResponse<{ id: string; quantity: number }>>(
      `/customer/cart/items/${encodeURIComponent(itemId)}`,
      { quantity }
    );
    if (!res.data.data) {
      throw new Error("Failed to update item quantity");
    }
    return res.data.data;
  }

  /**
   * Remove an item from the cart
   * DELETE /api/v1/customer/cart/items/:itemId
   */
  async removeItem(itemId: string): Promise<void> {
    await apiClient.delete(`/customer/cart/items/${encodeURIComponent(itemId)}`);
  }

  /**
   * Clear all items from the cart
   * DELETE /api/v1/customer/cart/clear
   */
  async clearCart(): Promise<void> {
    await apiClient.delete("/customer/cart/clear");
  }

  /**
   * Request outbound affiliate redirect for a specific merchant offer
   * POST /api/v1/customer/cart/merchant-redirect
   */
  async generateMerchantRedirect(offerId: string, source = "cart"): Promise<MerchantRedirectResponse> {
    const res = await apiClient.post<ApiResponse<MerchantRedirectResponse>>(
      "/customer/cart/merchant-redirect",
      { offerId, source }
    );
    if (!res.data.data) {
      throw new Error("Failed to resolve merchant redirect URL");
    }
    return res.data.data;
  }
}

export const customerCartService = new CustomerCartService();

