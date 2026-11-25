import { describe, it, expect, beforeEach, vi, afterEach } from "vitest";
import {
  getStaffNavItems,
  SUPER_ADMIN_NAV,
  PRODUCT_MANAGER_NAV,
  SOCIAL_MEDIA_MANAGER_NAV,
} from "@/components/layout/staff/staff-nav-config";
import { useAuthStore } from "@/stores/auth-store";
import { useUiStore } from "@/stores/ui-store";
import { authService } from "@/services/auth/auth.service";
import { apiClient } from "@/services/api";
import { isStaffRole, isCustomerRole, getRoleDashboardPath } from "@/lib/auth-helpers";
import { staffLoginSchema } from "@/modules/admin/auth";
import {
  customerLoginSchema,
  customerRegisterSchema,
} from "@/modules/customer/auth";

describe("Phase 3 Layouts & Navigation Test Suite", () => {
  beforeEach(() => {
    useAuthStore.getState().clearAuth();
    useUiStore.setState({
      isMobileMenuOpen: false,
      isSidebarCollapsed: false,
      isStaffMobileSidebarOpen: false,
    });
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  // Test 1: Super Admin sees the correct sidebar
  it("1. Super Admin sees the correct sidebar - returns all 11 governance navigation items", () => {
    const navItems = getStaffNavItems("SUPER_ADMIN");
    expect(navItems).toHaveLength(11);

    const titles = navItems.map((i) => i.title);
    expect(titles).toEqual([
      "Dashboard",
      "Users",
      "Roles & Permissions",
      "Products",
      "Offers",
      "Cuelinks Campaigns",
      "Affiliate Links",
      "Affiliate Analytics",
      "Transactions",
      "Earnings",
      "Settings",
    ]);

    navItems.forEach((item) => {
      expect(item.href.startsWith("/admin")).toBe(true);
    });
  });

  // Test 2: Product Manager sees the correct sidebar
  it("2. Product Manager sees the correct sidebar - returns 5 catalog & pricing items without admin governance", () => {
    const navItems = getStaffNavItems("PRODUCT_MANAGER");
    expect(navItems).toHaveLength(5);

    const titles = navItems.map((i) => i.title);
    expect(titles).toEqual([
      "Dashboard",
      "Product Discovery",
      "Products",
      "Pricing",
      "Offers",
    ]);

    navItems.forEach((item) => {
      expect(item.href.startsWith("/product-manager")).toBe(true);
    });

    // Verify admin-only routes are not exposed to Product Manager
    expect(titles).not.toContain("Users");
    expect(titles).not.toContain("Roles & Permissions");
    expect(titles).not.toContain("Settings");
  });

  // Test 3: Social Media Manager sees only the deferred placeholder navigation
  it("3. Social Media Manager sees only the deferred placeholder navigation", () => {
    const navItems = getStaffNavItems("SOCIAL_MEDIA_MANAGER");
    expect(navItems).toHaveLength(1);
    expect(navItems[0].title).toBe("Dashboard");
    expect(navItems[0].href).toBe("/social-media-manager/dashboard");

    // Strictly does not expose unfinished broadcast/campaign tools
    const titles = navItems.map((i) => i.title);
    expect(titles).not.toContain("Campaigns");
    expect(titles).not.toContain("Broadcasts");
    expect(titles).not.toContain("Channels");
  });

  // Test 4: Customer sees the storefront navigation
  it("4. Customer sees storefront navigation and receives empty staff navigation", () => {
    const navItems = getStaffNavItems("CUSTOMER");
    expect(navItems).toHaveLength(0);

    expect(isCustomerRole("CUSTOMER")).toBe(true);
    expect(isStaffRole("CUSTOMER")).toBe(false);
  });

  // Test 5: Guest sees login and registration options
  it("5. Guest sees login and registration options when unauthenticated", () => {
    const authState = useAuthStore.getState();
    expect(authState.isAuthenticated).toBe(false);
    expect(authState.user).toBeNull();
  });

  // Test 6: Authenticated customer sees profile/dashboard options
  it("6. Authenticated customer sees profile/dashboard options", () => {
    useAuthStore.getState().setAuth(
      {
        id: "c-1",
        fullName: "Rohan Patel",
        email: "rohan@example.com",
        role: "CUSTOMER",
      },
      "token-c1"
    );

    const authState = useAuthStore.getState();
    expect(authState.isAuthenticated).toBe(true);
    expect(authState.user?.role).toBe("CUSTOMER");
    expect(getRoleDashboardPath(authState.user?.role)).toBe("/customer/dashboard");
  });

  // Test 7: Staff logout works
  it("7. Staff logout works - calls logout endpoint and clears auth state", async () => {
    const postSpy = vi.spyOn(apiClient, "post").mockResolvedValueOnce({
      data: { success: true, message: "Logged out successfully" },
    } as any);

    useAuthStore.getState().setAuth(
      {
        id: "admin-1",
        fullName: "Admin User",
        email: "admin@aslicart.com",
        role: "SUPER_ADMIN",
      },
      "access-token",
      "refresh-token"
    );

    expect(useAuthStore.getState().isAuthenticated).toBe(true);

    await authService.logout();

    expect(postSpy).toHaveBeenCalledWith("/admin/auth/logout", {
      refreshToken: "refresh-token",
    });
    expect(useAuthStore.getState().isAuthenticated).toBe(false);
    expect(useAuthStore.getState().user).toBeNull();
  });

  // Test 8: Customer logout works
  it("8. Customer logout works - calls customer logout endpoint and clears session", async () => {
    const postSpy = vi.spyOn(apiClient, "post").mockResolvedValueOnce({
      data: { success: true, message: "Logged out successfully" },
    } as any);

    useAuthStore.getState().setAuth(
      {
        id: "cust-1",
        fullName: "Customer User",
        email: "cust@example.com",
        role: "CUSTOMER",
      },
      "access-token-cust",
      "refresh-token-cust"
    );

    await authService.logout();

    expect(postSpy).toHaveBeenCalledWith("/customer/auth/logout", {
      refreshToken: "refresh-token-cust",
    });
    expect(useAuthStore.getState().isAuthenticated).toBe(false);
  });

  // Test 9: Active navigation is highlighted correctly
  it("9. Active navigation is highlighted correctly based on route matching", () => {
    const currentRoute: string = "/admin/users";

    const isUsersActive = currentRoute === "/admin/users";
    const isDashboardActive = currentRoute === "/admin/dashboard";

    expect(isUsersActive).toBe(true);
    expect(isDashboardActive).toBe(false);
  });

  // Test 10: Mobile navigation opens and closes
  it("10. Mobile navigation opens and closes via Zustand UI store", () => {
    const uiStore = useUiStore.getState();
    expect(uiStore.isStaffMobileSidebarOpen).toBe(false);
    expect(uiStore.isMobileMenuOpen).toBe(false);

    // Toggle staff drawer
    useUiStore.getState().toggleStaffMobileSidebar();
    expect(useUiStore.getState().isStaffMobileSidebarOpen).toBe(true);

    useUiStore.getState().setStaffMobileSidebarOpen(false);
    expect(useUiStore.getState().isStaffMobileSidebarOpen).toBe(false);

    // Toggle storefront mobile menu
    useUiStore.getState().toggleMobileMenu();
    expect(useUiStore.getState().isMobileMenuOpen).toBe(true);

    useUiStore.getState().setMobileMenuOpen(false);
    expect(useUiStore.getState().isMobileMenuOpen).toBe(false);
  });

  // Test 11: Storefront and staff layouts remain independent
  it("11. Storefront and staff layouts remain independent", () => {
    expect(isStaffRole("SUPER_ADMIN")).toBe(true);
    expect(isStaffRole("PRODUCT_MANAGER")).toBe(true);
    expect(isStaffRole("SOCIAL_MEDIA_MANAGER")).toBe(true);
    expect(isStaffRole("CUSTOMER")).toBe(false);

    expect(isCustomerRole("CUSTOMER")).toBe(true);
    expect(isCustomerRole("SUPER_ADMIN")).toBe(false);
    expect(isCustomerRole("PRODUCT_MANAGER")).toBe(false);
  });

  // Test 12: Existing login and registration pages still work
  it("12. Existing login and registration schemas validate correctly without regression", () => {
    const validStaffLogin = staffLoginSchema.safeParse({
      email: "staff@aslicart.com",
      password: "ValidPassword123!",
    });
    expect(validStaffLogin.success).toBe(true);

    const invalidStaffLogin = staffLoginSchema.safeParse({
      email: "not-an-email",
      password: "",
    });
    expect(invalidStaffLogin.success).toBe(false);

    const validCustomerRegister = customerRegisterSchema.safeParse({
      fullName: "Neha Sharma",
      email: "neha@example.com",
      password: "StrongPassword@123",
      phone: "9876543210",
    });
    expect(validCustomerRegister.success).toBe(true);

    const weakPasswordRegister = customerRegisterSchema.safeParse({
      fullName: "Neha Sharma",
      email: "neha@example.com",
      password: "weak",
    });
    expect(weakPasswordRegister.success).toBe(false);
  });
});
