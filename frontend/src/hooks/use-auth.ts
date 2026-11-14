"use client";

import { useAuthStore } from "@/stores/auth-store";
import { authService } from "@/services/auth";
import type {
  StaffLoginCredentials,
  CustomerLoginCredentials,
  CustomerRegisterPayload,
  UserRole,
} from "@/types/auth";
import { hasAllowedRole, getRoleDashboardPath, isStaffRole } from "@/lib/auth-helpers";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { getErrorMessage } from "@/services/api/errors";

export function useAuth() {
  const router = useRouter();
  const {
    user,
    accessToken,
    isAuthenticated,
    isLoading,
    isInitialized,
    setLoading,
    clearAuth,
  } = useAuthStore();

  const handleStaffLogin = async (
    credentials: StaffLoginCredentials,
    returnUrl?: string | null
  ) => {
    try {
      setLoading(true);
      const { user: loggedInUser } = await authService.staffLogin(credentials);
      toast.success(`Welcome back, ${loggedInUser.fullName}!`);

      if (returnUrl) {
        router.push(returnUrl);
      } else {
        router.push(getRoleDashboardPath(loggedInUser.role));
      }
      return loggedInUser;
    } catch (err: unknown) {
      const message = getErrorMessage(err);
      toast.error(message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const handleCustomerLogin = async (
    credentials: CustomerLoginCredentials,
    returnUrl?: string | null
  ) => {
    try {
      setLoading(true);
      const { user: loggedInUser } = await authService.customerLogin(credentials);
      toast.success(`Welcome back, ${loggedInUser.fullName}!`);

      if (returnUrl) {
        router.push(returnUrl);
      } else {
        router.push("/customer/dashboard");
      }
      return loggedInUser;
    } catch (err: unknown) {
      const message = getErrorMessage(err);
      toast.error(message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const handleCustomerRegister = async (
    payload: CustomerRegisterPayload,
    returnUrl?: string | null
  ) => {
    try {
      setLoading(true);
      const { user: registeredUser } = await authService.customerRegister(payload);
      toast.success("Account created successfully! Welcome to Asli Cart.");

      if (returnUrl) {
        router.push(returnUrl);
      } else {
        router.push("/customer/dashboard");
      }
      return registeredUser;
    } catch (err: unknown) {
      const message = getErrorMessage(err);
      toast.error(message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async (redirectTo = "/") => {
    try {
      setLoading(true);
      await authService.logout();
      toast.info("Logged out successfully");
      router.push(redirectTo);
    } catch {
      clearAuth();
      router.push(redirectTo);
    } finally {
      setLoading(false);
    }
  };

  return {
    user,
    accessToken,
    isAuthenticated,
    isLoading,
    isInitialized,
    role: user?.role,
    isStaff: isStaffRole(user?.role),
    staffLogin: handleStaffLogin,
    customerLogin: handleCustomerLogin,
    customerRegister: handleCustomerRegister,
    logout: handleLogout,
    hasRole: (roles: UserRole | UserRole[]) =>
      hasAllowedRole(user, Array.isArray(roles) ? roles : [roles]),
  };
}

