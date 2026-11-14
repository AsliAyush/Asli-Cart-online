import { apiClient } from "@/services/api";
import type { ApiResponse } from "@/types/api";
import type {
  AuthResult,
  AuthUser,
  AuthTokens,
  StaffLoginCredentials,
  CustomerLoginCredentials,
  CustomerRegisterPayload,
  BackendAdminAuthData,
  BackendCustomerAuthData,
  BackendMeData,
  UserRole,
} from "@/types/auth";
import {
  normalizeAdminUser,
  normalizeCustomerUser,
  normalizeMeUser,
} from "@/lib/auth-helpers";
import { useAuthStore } from "@/stores/auth-store";
import { ApiError } from "@/services/api/errors";

export class AuthService {
  /**
   * Staff login via POST /api/v1/admin/auth/login
   * Supports SUPER_ADMIN, PRODUCT_MANAGER, SOCIAL_MEDIA_MANAGER.
   */
  async staffLogin(credentials: StaffLoginCredentials): Promise<AuthResult> {
    const res = await apiClient.post<ApiResponse<BackendAdminAuthData>>(
      "/admin/auth/login",
      credentials
    );

    const data = res.data.data;
    if (!data?.accessToken || !data.user) {
      throw new ApiError("Invalid response format from staff authentication", 500);
    }

    // Double-check backend denied customer role
    if (data.user.roleName === "CUSTOMER") {
      throw new ApiError("Customers are not permitted to access staff portals.", 403);
    }

    const user = normalizeAdminUser(data.user);
    const tokens = {
      accessToken: data.accessToken,
      refreshToken: data.refreshToken,
    };

    useAuthStore.getState().setAuth(user, tokens.accessToken, tokens.refreshToken);
    return { user, tokens };
  }

  /**
   * Customer login via POST /api/v1/customer/auth/login
   */
  async customerLogin(credentials: CustomerLoginCredentials): Promise<AuthResult> {
    const res = await apiClient.post<ApiResponse<BackendCustomerAuthData>>(
      "/customer/auth/login",
      credentials
    );

    const data = res.data.data;
    if (!data?.accessToken || !data.user) {
      throw new ApiError("Invalid response format from customer authentication", 500);
    }

    const user = normalizeCustomerUser(data.user);
    const tokens = {
      accessToken: data.accessToken,
      refreshToken: data.refreshToken,
    };

    useAuthStore.getState().setAuth(user, tokens.accessToken, tokens.refreshToken);
    return { user, tokens };
  }

  /**
   * Customer registration via POST /api/v1/customer/auth/register
   * Does NOT pass role; the backend strictly enforces the CUSTOMER role.
   */
  async customerRegister(payload: CustomerRegisterPayload): Promise<AuthResult> {
    const res = await apiClient.post<ApiResponse<BackendCustomerAuthData>>(
      "/customer/auth/register",
      {
        fullName: payload.fullName.trim(),
        email: payload.email.trim().toLowerCase(),
        password: payload.password,
        phone: payload.phone?.trim() ? payload.phone.trim() : undefined,
      }
    );

    const data = res.data.data;
    if (!data?.accessToken || !data.user) {
      throw new ApiError("Invalid response format from registration", 500);
    }

    const user = normalizeCustomerUser(data.user);
    const tokens = {
      accessToken: data.accessToken,
      refreshToken: data.refreshToken,
    };

    useAuthStore.getState().setAuth(user, tokens.accessToken, tokens.refreshToken);
    return { user, tokens };
  }

  /**
   * Retrieves profile of current user.
   * If role is SUPER_ADMIN, /admin/auth/me is used.
   * If role is PRODUCT_MANAGER, SOCIAL_MEDIA_MANAGER, or CUSTOMER, /customer/auth/me
   * is used because it has no role filter and returns full user profile for any valid token.
   */
  async getCurrentUser(roleHint?: UserRole): Promise<AuthUser> {
    try {
      if (roleHint === "SUPER_ADMIN") {
        try {
          const res = await apiClient.get<ApiResponse<BackendMeData>>(
            "/admin/auth/me"
          );
          if (res.data.data) {
            return normalizeMeUser(res.data.data);
          }
        } catch (adminErr) {
          // If admin /me fails or returns 403, fallback to universal /customer/auth/me
        }
      }

      const res = await apiClient.get<ApiResponse<BackendMeData>>(
        "/customer/auth/me"
      );
      if (!res.data.data) {
        throw new ApiError("Failed to load user profile", 404);
      }
      return normalizeMeUser(res.data.data);
    } catch (err) {
      throw err;
    }
  }

  /**
   * Refreshes access token via either /admin/auth/refresh or /customer/auth/refresh.
   */
  async refreshTokens(isStaff = false): Promise<AuthTokens> {
    const endpoint = isStaff ? "/admin/auth/refresh" : "/customer/auth/refresh";
    const refreshToken = useAuthStore.getState().refreshToken;

    const res = await apiClient.post<
      ApiResponse<{ accessToken: string; refreshToken?: string }>
    >(endpoint, { refreshToken: refreshToken || undefined });

    const data = res.data.data;
    if (!data?.accessToken) {
      throw new ApiError("Refresh failed to return access token", 401);
    }

    const tokens: AuthTokens = {
      accessToken: data.accessToken,
      refreshToken: data.refreshToken || refreshToken || "",
    };

    useAuthStore.getState().setAccessToken(tokens.accessToken);
    return tokens;
  }

  /**
   * Logs out user from backend and clears local auth state.
   */
  async logout(): Promise<void> {
    const authState = useAuthStore.getState();
    const isStaff = authState.user?.role !== "CUSTOMER";
    const endpoint = isStaff ? "/admin/auth/logout" : "/customer/auth/logout";

    try {
      await apiClient.post(endpoint, {
        refreshToken: authState.refreshToken || undefined,
      });
    } catch {
      // Proceed with local cleanup even if network fails
    } finally {
      useAuthStore.getState().clearAuth();
    }
  }
}

export const authService = new AuthService();

