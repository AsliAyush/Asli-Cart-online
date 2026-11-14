import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import {
  customerProfileService,
  type UpdateProfilePayload,
  type ChangePasswordPayload,
} from "../services/profile.service";
import { useAuth } from "@/hooks/use-auth";
import { useAuthStore } from "@/stores/auth-store";
import { getErrorMessage } from "@/services/api/errors";

export const CUSTOMER_PROFILE_KEYS = {
  all: ["customer-profile"] as const,
  profile: () => [...CUSTOMER_PROFILE_KEYS.all, "details"] as const,
};

export function useCustomerProfile() {
  const { isAuthenticated, user } = useAuth();
  const isCustomer = isAuthenticated && user?.role === "CUSTOMER";

  return useQuery({
    queryKey: CUSTOMER_PROFILE_KEYS.profile(),
    queryFn: () => customerProfileService.getProfile(),
    enabled: isCustomer,
    staleTime: 5 * 60 * 1000,
  });
}

export function useUpdateCustomerProfile() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: UpdateProfilePayload) =>
      customerProfileService.updateProfile(payload),
    onSuccess: (updated) => {
      toast.success("Profile updated successfully");
      queryClient.invalidateQueries({ queryKey: CUSTOMER_PROFILE_KEYS.profile() });

      // Synchronize auth store user details if full name or phone changed
      const state = useAuthStore.getState();
      if (state.user && state.accessToken) {
        state.setAuth(
          {
            ...state.user,
            fullName: updated.fullName,
            phone: updated.phone || undefined,
          },
          state.accessToken,
          state.refreshToken
        );
      }
    },
    onError: (error) => {
      toast.error(getErrorMessage(error) || "Failed to update profile");
    },
  });
}

export function useChangeCustomerPassword() {
  return useMutation({
    mutationFn: (payload: ChangePasswordPayload) =>
      customerProfileService.changePassword(payload),
    onSuccess: () => {
      toast.success("Password changed successfully. Please sign in with your new credentials.");
      useAuthStore.getState().clearAuth();
      if (typeof window !== "undefined") {
        window.location.href = "/customer/login";
      }
    },
    onError: (error) => {
      toast.error(getErrorMessage(error) || "Failed to change password");
    },
  });
}
