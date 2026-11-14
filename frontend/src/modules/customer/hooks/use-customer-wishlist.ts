import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { customerWishlistService } from "../services";
import { useAuth } from "@/hooks/use-auth";
import { getErrorMessage } from "@/services/api/errors";
import { CUSTOMER_DASHBOARD_KEYS } from "./use-customer-dashboard";

export const CUSTOMER_WISHLIST_KEYS = {
  all: ["customer-wishlist"] as const,
  wishlist: () => [...CUSTOMER_WISHLIST_KEYS.all, "list"] as const,
};

export function useCustomerWishlist() {
  const { isAuthenticated, user } = useAuth();
  const isCustomer = isAuthenticated && user?.role === "CUSTOMER";

  return useQuery({
    queryKey: CUSTOMER_WISHLIST_KEYS.wishlist(),
    queryFn: () => customerWishlistService.getWishlist(),
    enabled: isCustomer,
    staleTime: 60 * 1000,
  });
}

export function useAddToWishlist() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (productId: string) => customerWishlistService.addItem(productId),
    onSuccess: () => {
      toast.success("Saved to your wishlist");
      queryClient.invalidateQueries({ queryKey: CUSTOMER_WISHLIST_KEYS.wishlist() });
      queryClient.invalidateQueries({ queryKey: CUSTOMER_DASHBOARD_KEYS.summary() });
    },
    onError: (error) => {
      toast.error(getErrorMessage(error) || "Failed to add to wishlist");
    },
  });
}

export function useRemoveFromWishlist() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (itemId: string) => customerWishlistService.removeItem(itemId),
    onSuccess: () => {
      toast.success("Removed from wishlist");
      queryClient.invalidateQueries({ queryKey: CUSTOMER_WISHLIST_KEYS.wishlist() });
      queryClient.invalidateQueries({ queryKey: CUSTOMER_DASHBOARD_KEYS.summary() });
    },
    onError: (error) => {
      toast.error(getErrorMessage(error) || "Failed to remove from wishlist");
    },
  });
}
