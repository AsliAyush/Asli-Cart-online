import { describe, it, expect, beforeEach, vi, afterEach } from "vitest";
import { authService } from "@/services/auth/auth.service";
import { apiClient } from "@/services/api";
import { useAuthStore, getSavedSession } from "@/stores/auth-store";
import {
  getRoleDashboardPath,
  hasAllowedRole,
  isStaffRole,
  isCustomerRole,
  normalizeAdminUser,
  normalizeCustomerUser,
  normalizeMeUser,
} from "@/lib/auth-helpers";
import { ApiError } from "@/services/api/errors";
import type { AuthUser } from "@/types/auth";

describe("Phase 2 Authentication & Authorization Test Suite", () => {
  beforeEach(() => {
    // Reset Zustand store
    useAuthStore.getState().clearAuth();
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  // Test 1: Successful Super Admin login
  it("1. Successful Super Admin login - authenticates and sets store state", async () => {
    const mockAdminResponse = {
      data: {
        success: true,
        message: "Admin authentication successful",
        data: {
          user: {
            id: "admin-uuid-1",
            email: "admin@aslicart.com",
            fullName: "Super Admin User",
            roleId: "role-super-admin",
            roleName: "SUPER_ADMIN",
          },
          accessToken: "mock-super-admin-access-token",
          refreshToken: "mock-super-admin-refresh-token",
        },
      },
    };

    vi.spyOn(apiClient, "post").mockResolvedValueOnce(mockAdminResponse as any);

    const result = await authService.staffLogin({
      email: "admin@aslicart.com",
      password: "SuperAdmin@2026!",
    });

    expect(result.user.role).toBe("SUPER_ADMIN");
    expect(result.user.email).toBe("admin@aslicart.com");
    expect(result.tokens.accessToken).toBe("mock-super-admin-access-token");

    const storeState = useAuthStore.getState();
    expect(storeState.isAuthenticated).toBe(true);
    expect(storeState.user?.role).toBe("SUPER_ADMIN");
    expect(storeState.accessToken).toBe("mock-super-admin-access-token");
  });

  // Test 2: Successful Product Manager login
  it("2. Successful Product Manager login - authenticates with PRODUCT_MANAGER role", async () => {
    const mockPmResponse = {
      data: {
        success: true,
        message: "Admin authentication successful",
        data: {
          user: {
            id: "pm-uuid-2",
            email: "pm@aslicart.com",
            fullName: "Product Manager Test",
            roleId: "role-pm",
            roleName: "PRODUCT_MANAGER",
          },
          accessToken: "mock-pm-access-token",
          refreshToken: "mock-pm-refresh-token",
        },
      },
    };

    vi.spyOn(apiClient, "post").mockResolvedValueOnce(mockPmResponse as any);

    const result = await authService.staffLogin({
      email: "pm@aslicart.com",
      password: "ProductManager@2026!",
    });

    expect(result.user.role).toBe("PRODUCT_MANAGER");
    expect(result.user.fullName).toBe("Product Manager Test");

    const storeState = useAuthStore.getState();
    expect(storeState.isAuthenticated).toBe(true);
    expect(storeState.user?.role).toBe("PRODUCT_MANAGER");
  });

  // Test 3: Successful Customer login
  it("3. Successful Customer login - authenticates with CUSTOMER role", async () => {
    const mockCustomerResponse = {
      data: {
        success: true,
        message: "Login successful",
        data: {
          user: {
            id: "cust-uuid-3",
            fullName: "Anand Verma",
            email: "anand@example.com",
            phone: "9876543210",
            role: "CUSTOMER",
            createdAt: "2026-01-01T00:00:00.000Z",
          },
          accessToken: "mock-customer-access-token",
          refreshToken: "mock-customer-refresh-token",
        },
      },
    };

    vi.spyOn(apiClient, "post").mockResolvedValueOnce(mockCustomerResponse as any);

    const result = await authService.customerLogin({
      email: "anand@example.com",
      password: "CustomerPass@123",
    });

    expect(result.user.role).toBe("CUSTOMER");
    expect(result.user.email).toBe("anand@example.com");

    const storeState = useAuthStore.getState();
    expect(storeState.isAuthenticated).toBe(true);
    expect(storeState.user?.role).toBe("CUSTOMER");
  });

  // Test 4: Customer registration
  it("4. Customer registration - strictly omits role and establishes customer session", async () => {
    const postSpy = vi.spyOn(apiClient, "post").mockResolvedValueOnce({
      data: {
        success: true,
        message: "Customer registered successfully",
        data: {
          user: {
            id: "new-cust-uuid",
            fullName: "Priya Sharma",
            email: "priya@example.com",
            phone: "9988776655",
            role: "CUSTOMER",
            createdAt: "2026-01-02T00:00:00.000Z",
          },
          accessToken: "mock-registered-access-token",
          refreshToken: "mock-registered-refresh-token",
        },
      },
    } as any);

    const result = await authService.customerRegister({
      fullName: "Priya Sharma",
      email: "priya@example.com",
      password: "PriyaPassword@2026",
      phone: "9988776655",
    });

    // Verify payload sent to backend strictly does NOT include any role property
    expect(postSpy).toHaveBeenCalledWith("/customer/auth/register", {
      fullName: "Priya Sharma",
      email: "priya@example.com",
      password: "PriyaPassword@2026",
      phone: "9988776655",
    });
    expect((postSpy.mock.calls[0][1] as any).role).toBeUndefined();

    expect(result.user.role).toBe("CUSTOMER");
    expect(useAuthStore.getState().isAuthenticated).toBe(true);
  });

  // Test 5: Incorrect password handling
  it("5. Incorrect password handling - normalizes 401 error into ApiError", async () => {
    vi.spyOn(apiClient, "post").mockRejectedValueOnce(
      new ApiError("Invalid email or password", 401, undefined, false)
    );

    await expect(
      authService.staffLogin({
        email: "admin@aslicart.com",
        password: "WrongPassword123",
      })
    ).rejects.toThrow("Invalid email or password");

    expect(useAuthStore.getState().isAuthenticated).toBe(false);
  });

  // Test 6: Role-based redirects
  it("6. Role-based redirects - maps each role to its authorized path", () => {
    expect(getRoleDashboardPath("SUPER_ADMIN")).toBe("/admin/dashboard");
    expect(getRoleDashboardPath("PRODUCT_MANAGER")).toBe("/product-manager/dashboard");
    expect(getRoleDashboardPath("SOCIAL_MEDIA_MANAGER")).toBe("/social-media-manager/dashboard");
    expect(getRoleDashboardPath("CUSTOMER")).toBe("/customer/dashboard");
    expect(getRoleDashboardPath(null)).toBe("/");
  });

  // Test 7: Unauthorized route access
  it("7. Unauthorized route access - validates permission checks", () => {
    const customerUser: AuthUser = {
      id: "u-1",
      fullName: "Test Customer",
      email: "cust@test.com",
      role: "CUSTOMER",
    };

    const adminUser: AuthUser = {
      id: "u-2",
      fullName: "Test Admin",
      email: "admin@test.com",
      role: "SUPER_ADMIN",
    };

    expect(hasAllowedRole(customerUser, ["SUPER_ADMIN"])).toBe(false);
    expect(hasAllowedRole(customerUser, ["PRODUCT_MANAGER"])).toBe(false);
    expect(hasAllowedRole(customerUser, ["CUSTOMER"])).toBe(true);

    expect(hasAllowedRole(adminUser, ["SUPER_ADMIN"])).toBe(true);
    expect(hasAllowedRole(adminUser, ["CUSTOMER"])).toBe(false);
  });

  // Test 8: Customer attempting to access staff routes
  it("8. Customer attempting to access staff routes - rejected by staffLogin guard", async () => {
    // If backend returns a user with role CUSTOMER on staff login (e.g. backend anomaly or bypass)
    vi.spyOn(apiClient, "post").mockResolvedValueOnce({
      data: {
        success: true,
        message: "Login successful",
        data: {
          user: {
            id: "fake-admin",
            email: "cust@aslicart.com",
            fullName: "Sneaky Customer",
            roleId: "r-cust",
            roleName: "CUSTOMER",
          },
          accessToken: "token",
          refreshToken: "refresh",
        },
      },
    } as any);

    await expect(
      authService.staffLogin({
        email: "cust@aslicart.com",
        password: "Password@123",
      })
    ).rejects.toThrow("Customers are not permitted to access staff portals.");

    expect(useAuthStore.getState().isAuthenticated).toBe(false);
  });

  // Test 9: Staff attempting to access customer-only routes
  it("9. Staff attempting to access customer-only routes - identified correctly", () => {
    const pmUser: AuthUser = {
      id: "pm-1",
      fullName: "Product Mgr",
      email: "pm@aslicart.com",
      role: "PRODUCT_MANAGER",
    };

    expect(isStaffRole(pmUser.role)).toBe(true);
    expect(isCustomerRole(pmUser.role)).toBe(false);
    expect(hasAllowedRole(pmUser, ["CUSTOMER"])).toBe(false);
  });

  // Test 10: Logout
  it("10. Logout - notifies backend and clears all local authentication state", async () => {
    const postSpy = vi.spyOn(apiClient, "post").mockResolvedValueOnce({
      data: { success: true, message: "Logged out successfully" },
    } as any);

    // Seed state as logged in
    useAuthStore.getState().setAuth(
      {
        id: "admin-1",
        fullName: "Super Admin",
        email: "admin@aslicart.com",
        role: "SUPER_ADMIN",
      },
      "active-access-token",
      "active-refresh-token"
    );

    expect(useAuthStore.getState().isAuthenticated).toBe(true);

    await authService.logout();

    expect(postSpy).toHaveBeenCalledWith("/admin/auth/logout", {
      refreshToken: "active-refresh-token",
    });

    const clearedState = useAuthStore.getState();
    expect(clearedState.isAuthenticated).toBe(false);
    expect(clearedState.user).toBeNull();
    expect(clearedState.accessToken).toBeNull();
  });

  // Test 11: Token expiration and refresh behavior
  it("11. Token expiration and refresh behavior - rotates tokens and updates store", async () => {
    useAuthStore.getState().setAuth(
      {
        id: "admin-1",
        fullName: "Super Admin",
        email: "admin@aslicart.com",
        role: "SUPER_ADMIN",
      },
      "expired-access-token",
      "valid-refresh-token"
    );

    const refreshSpy = vi.spyOn(apiClient, "post").mockResolvedValueOnce({
      data: {
        success: true,
        message: "Token refreshed successfully",
        data: {
          accessToken: "brand-new-access-token",
          refreshToken: "brand-new-refresh-token",
        },
      },
    } as any);

    const tokens = await authService.refreshTokens(true);

    expect(refreshSpy).toHaveBeenCalledWith("/admin/auth/refresh", {
      refreshToken: "valid-refresh-token",
    });
    expect(tokens.accessToken).toBe("brand-new-access-token");
    expect(useAuthStore.getState().accessToken).toBe("brand-new-access-token");
  });

  // Test 12: Session restoration after page reload
  it("12. Session restoration after page reload - retrieves fresh user profile", async () => {
    const meSpy = vi.spyOn(apiClient, "get").mockResolvedValueOnce({
      data: {
        success: true,
        message: "Admin details retrieved successfully",
        data: {
          id: "admin-1",
          fullName: "Restored Super Admin",
          email: "admin@aslicart.com",
          roleId: "role-super-admin",
          roleName: "SUPER_ADMIN",
          isActive: true,
          emailVerified: true,
        },
      },
    } as any);

    const user = await authService.getCurrentUser("SUPER_ADMIN");

    expect(meSpy).toHaveBeenCalledWith("/admin/auth/me");
    expect(user.fullName).toBe("Restored Super Admin");
    expect(user.role).toBe("SUPER_ADMIN");
  });
});

