import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { customerCartService } from "../services";
import { useAuth } from "@/hooks/use-auth";
import { getErrorMessage } from "@/services/api/errors";
import { CUSTOMER_DASHBOARD_KEYS } from "./use-customer-dashboard";

export const CUSTOMER_CART_KEYS = {
  all: ["customer-cart"] as const,
  cart: () => [...CUSTOMER_CART_KEYS.all, "current"] as const,
};

export function useCustomerCart() {
  const { isAuthenticated, user } = useAuth();
  const isCustomer = isAuthenticated && user?.role === "CUSTOMER";

  return useQuery({
    queryKey: CUSTOMER_CART_KEYS.cart(),
    queryFn: () => customerCartService.getCart(),
    enabled: isCustomer,
    staleTime: 30 * 1000,
  });
}

export function useAddToCart() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ offerId, quantity = 1 }: { offerId: string; quantity?: number }) =>
      customerCartService.addItem(offerId, quantity),
    onSuccess: () => {
      toast.success("Added offer to your cart");
      queryClient.invalidateQueries({ queryKey: CUSTOMER_CART_KEYS.cart() });
      queryClient.invalidateQueries({ queryKey: CUSTOMER_DASHBOARD_KEYS.summary() });
    },
    onError: (error) => {
      toast.error(getErrorMessage(error) || "Failed to add item to cart");
    },
  });
}

export function useUpdateCartQuantity() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ itemId, quantity }: { itemId: string; quantity: number }) =>
      customerCartService.updateQuantity(itemId, quantity),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: CUSTOMER_CART_KEYS.cart() });
    },
    onError: (error) => {
      toast.error(getErrorMessage(error) || "Failed to update item quantity");
    },
  });
}

export function useRemoveCartItem() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (itemId: string) => customerCartService.removeItem(itemId),
    onSuccess: () => {
      toast.success("Item removed from cart");
      queryClient.invalidateQueries({ queryKey: CUSTOMER_CART_KEYS.cart() });
      queryClient.invalidateQueries({ queryKey: CUSTOMER_DASHBOARD_KEYS.summary() });
    },
    onError: (error) => {
      toast.error(getErrorMessage(error) || "Failed to remove item");
    },
  });
}

export function useClearCart() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: () => customerCartService.clearCart(),
    onSuccess: () => {
      toast.success("Cart cleared");
      queryClient.invalidateQueries({ queryKey: CUSTOMER_CART_KEYS.cart() });
      queryClient.invalidateQueries({ queryKey: CUSTOMER_DASHBOARD_KEYS.summary() });
    },
    onError: (error) => {
      toast.error(getErrorMessage(error) || "Failed to clear cart");
    },
  });
}

export function useMerchantRedirect() {
  return useMutation({
    mutationFn: ({ offerId, source = "cart" }: { offerId: string; source?: string }) =>
      customerCartService.generateMerchantRedirect(offerId, source),
    onError: (error) => {
      toast.error(getErrorMessage(error) || "Unable to proceed to merchant at this time");
    },
  });
}
