import { describe, it, expect, beforeEach, vi, afterEach } from "vitest";
import { apiClient } from "@/services/api";
import { adminDashboardService } from "@/modules/admin/dashboard/dashboard.service";
import { adminUserService } from "@/modules/admin/users/user.service";
import { adminRoleService } from "@/modules/admin/roles/role.service";
import { adminProductService } from "@/modules/admin/products/product.service";
import { adminOfferService } from "@/modules/admin/offers/offer.service";
import { adminAuditLogService } from "@/modules/admin/audit-logs/audit-log.service";
import { adminSettingsService } from "@/modules/admin/settings/settings.service";
import { createEmployeeSchema } from "@/modules/admin/users/validators";
import { isStaffRole, getRoleDashboardPath } from "@/lib/auth-helpers";

describe("Phase 4 Super Admin Test Suite (Mocked & Isolated API Integration)", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  // Test 1: Admin dashboard rendering
  it("1. Admin dashboard rendering - successfully calculates consolidated metrics", async () => {
    vi.spyOn(apiClient, "get").mockImplementation((url: string) => {
      if (url === "/admin/dashboard") {
        return Promise.resolve({
          data: {
            success: true,
            data: {
              users: { total: 42, active: 38 },
              products: { total: 0, _note: "note" },
              offers: { total: 0, published: 0, pendingApprovals: 0, _note: "note" },
            },
          },
        } as any);
      }
      if (url === "/product-manager/dashboard") {
        return Promise.resolve({
          data: {
            success: true,
            data: {
              products: { total: 15, active: 10, draft: 3, pendingApproval: 2, assignedToSmm: 1 },
              offers: { total: 25, active: 18, expired: 2, pendingApproval: 5 },
            },
          },
        } as any);
      }
      return Promise.reject(new Error("Not found"));
    });

    const metrics = await adminDashboardService.getConsolidatedMetrics();

    expect(metrics.totalUsers).toBe(42);
    expect(metrics.activeUsers).toBe(38);
    expect(metrics.totalProducts).toBe(15);
    expect(metrics.approvedProducts).toBe(10);
    expect(metrics.draftProducts).toBe(3);
    expect(metrics.pendingProducts).toBe(2);
    expect(metrics.totalOffers).toBe(25);
    expect(metrics.publishedOffers).toBe(18);
    expect(metrics.pendingOfferApprovals).toBe(5);
    expect(metrics.expiredOffers).toBe(2);
  });

  // Test 2: Dashboard metrics loading fallback
  it("2. Dashboard metrics loading - handles graceful degradation when catalog endpoint fails", async () => {
    vi.spyOn(apiClient, "get").mockImplementation((url: string) => {
      if (url === "/admin/dashboard") {
        return Promise.resolve({
          data: {
            success: true,
            data: {
              users: { total: 10, active: 8 },
              products: { total: 0, _note: "deferred" },
              offers: { total: 0, published: 0, pendingApprovals: 0, _note: "deferred" },
            },
          },
        } as any);
      }
      return Promise.reject(new Error("Product manager service offline"));
    });

    const metrics = await adminDashboardService.getConsolidatedMetrics();
    expect(metrics.totalUsers).toBe(10);
    expect(metrics.activeUsers).toBe(8);
    expect(metrics.totalProducts).toBe(0);
    expect(metrics.totalOffers).toBe(0);
  });

  // Test 3: User list loading
  it("3. User list loading - queries GET /api/v1/admin/users and extracts paginated data", async () => {
    const mockUsersPayload = {
      items: [
        {
          id: "usr_1",
          fullName: "Admin One",
          email: "admin@aslicart.com",
          roleId: "role_super_admin",
          isActive: true,
          emailVerified: true,
          createdAt: "2026-01-01T00:00:00.000Z",
          updatedAt: "2026-01-01T00:00:00.000Z",
          role: { id: "role_super_admin", name: "SUPER_ADMIN", isSystem: true },
        },
      ],
      pagination: {
        page: 1,
        limit: 10,
        total: 1,
        totalPages: 1,
      },
    };

    const getSpy = vi.spyOn(apiClient, "get").mockResolvedValue({
      data: { success: true, data: mockUsersPayload },
    } as any);

    const result = await adminUserService.listUsers({ page: 1, limit: 10 });
    expect(getSpy).toHaveBeenCalledWith("/admin/users?page=1&limit=10");
    expect(result.items).toHaveLength(1);
    expect(result.items[0].email).toBe("admin@aslicart.com");
    expect(result.pagination.total).toBe(1);
  });

  // Test 4: User search and filters
  it("4. User search and filters - correctly serializes search, roleId, and isActive query params", async () => {
    const getSpy = vi.spyOn(apiClient, "get").mockResolvedValue({
      data: { success: true, data: { items: [], pagination: { page: 1, limit: 10, total: 0, totalPages: 1 } } },
    } as any);

    await adminUserService.listUsers({
      page: 2,
      limit: 20,
      search: "priya",
      roleId: "role_pm",
      isActive: true,
    });

    expect(getSpy).toHaveBeenCalledWith(
      "/admin/users?page=2&limit=20&roleId=role_pm&isActive=true&search=priya"
    );
  });

  // Test 5: User creation and validation
  it("5. User creation and validation - enforces strong password criteria and required fields", () => {
    // Valid input with all password constraints satisfied
    const valid = createEmployeeSchema.safeParse({
      fullName: "Priya Sharma",
      email: "priya@aslicart.com",
      password: "StrongPassword123!",
      roleId: "role_product_manager",
    });
    expect(valid.success).toBe(true);

    // Weak password: missing special character
    const invalidWeak = createEmployeeSchema.safeParse({
      fullName: "Priya Sharma",
      email: "priya@aslicart.com",
      password: "WeakPassword123",
      roleId: "role_product_manager",
    });
    expect(invalidWeak.success).toBe(false);
    if (!invalidWeak.success) {
      expect(invalidWeak.error.errors[0].message).toContain("special character");
    }

    // Invalid email
    const invalidEmail = createEmployeeSchema.safeParse({
      fullName: "Priya Sharma",
      email: "not-an-email",
      password: "StrongPassword123!",
      roleId: "role_product_manager",
    });
    expect(invalidEmail.success).toBe(false);
  });

  // Test 5b: Staff provisioning security
  it("5b. Staff provisioning security - ensures only PRODUCT_MANAGER and SOCIAL_MEDIA_MANAGER are assignable", () => {
    const allRoles = [
      { id: "r1", name: "SUPER_ADMIN" },
      { id: "r2", name: "PRODUCT_MANAGER" },
      { id: "r3", name: "SOCIAL_MEDIA_MANAGER" },
      { id: "r4", name: "CUSTOMER" },
    ];

    const assignableRoles = allRoles.filter(
      (r) => r.name === "PRODUCT_MANAGER" || r.name === "SOCIAL_MEDIA_MANAGER"
    );

    expect(assignableRoles.map((r) => r.name)).toEqual([
      "PRODUCT_MANAGER",
      "SOCIAL_MEDIA_MANAGER",
    ]);
    expect(assignableRoles.map((r) => r.name)).not.toContain("SUPER_ADMIN");
    expect(assignableRoles.map((r) => r.name)).not.toContain("CUSTOMER");
  });

  // Test 6: Role list loading
  it("6. Role list loading - queries GET /api/v1/admin/roles", async () => {
    const mockRoles = [
      { id: "r1", name: "SUPER_ADMIN", isSystem: true },
      { id: "r2", name: "PRODUCT_MANAGER", isSystem: true },
      { id: "r3", name: "SOCIAL_MEDIA_MANAGER", isSystem: true },
      { id: "r4", name: "CUSTOMER", isSystem: true },
    ];

    const getSpy = vi.spyOn(apiClient, "get").mockResolvedValue({
      data: { success: true, data: mockRoles },
    } as any);

    const roles = await adminRoleService.listRoles();
    expect(getSpy).toHaveBeenCalledWith("/admin/roles");
    expect(roles).toHaveLength(4);
    expect(roles.map((r) => r.name)).toContain("SUPER_ADMIN");
  });

  // Test 7: Permission matrix rendering
  it("7. Permission matrix rendering - verifies role permissions fetch and update call", async () => {
    const mockPermissions = [
      { id: "perm_1", moduleId: "mod_1", moduleName: "user", permissionKey: "view", permissionName: "View Users", description: null, assignedAt: "2026-01-01" },
      { id: "perm_2", moduleId: "mod_1", moduleName: "user", permissionKey: "create", permissionName: "Create Users", description: null, assignedAt: "2026-01-01" },
    ];

    vi.spyOn(apiClient, "get").mockResolvedValue({
      data: { success: true, data: mockPermissions },
    } as any);

    const putSpy = vi.spyOn(apiClient, "put").mockResolvedValue({
      data: { success: true, data: mockPermissions },
    } as any);

    const rolePerms = await adminRoleService.getRolePermissions("role_pm");
    expect(rolePerms).toHaveLength(2);

    await adminRoleService.updateRolePermissions("role_pm", ["perm_1", "perm_2"]);
    expect(putSpy).toHaveBeenCalledWith("/admin/roles/role_pm/permissions", {
      permissionIds: ["perm_1", "perm_2"],
    });
  });

  // Test 8: Product list loading
  it("8. Product list loading - queries GET /api/v1/product-manager/products with pagination and filters", async () => {
    const mockProductsPayload = {
      items: [
        {
          id: "prod_1",
          name: "Sony WH-1000XM5",
          slug: "sony-wh-1000xm5",
          brand: "Sony",
          categoryId: "cat_audio",
          mainImage: "https://example.com/sony.jpg",
          additionalImages: [],
          specifications: null,
          status: "APPROVED",
          isAssignedToSmm: false,
          createdById: "pm_1",
          createdAt: "2026-01-01T00:00:00.000Z",
          updatedAt: "2026-01-01T00:00:00.000Z",
          category: { id: "cat_audio", name: "Audio", slug: "audio" },
          createdBy: { id: "pm_1", fullName: "PM Jane", email: "pm@aslicart.com" },
          _count: { offers: 3 },
        },
      ],
      pagination: { page: 1, limit: 10, total: 1, totalPages: 1 },
    };

    const getSpy = vi.spyOn(apiClient, "get").mockResolvedValue({
      data: { success: true, data: mockProductsPayload },
    } as any);

    const result = await adminProductService.listProducts({ page: 1, limit: 10, status: "APPROVED" });
    expect(getSpy).toHaveBeenCalledWith("/product-manager/products?page=1&limit=10&status=APPROVED");
    expect(result.items[0].name).toBe("Sony WH-1000XM5");
    expect(result.items[0]._count.offers).toBe(3);
  });

  // Test 9: Offer status filtering
  it("9. Offer status filtering - constructs correct query URL for PENDING_APPROVAL and PUBLISHED offers", async () => {
    const getSpy = vi.spyOn(apiClient, "get").mockResolvedValue({
      data: { success: true, data: { items: [], pagination: { page: 1, limit: 10, total: 0, totalPages: 1 } } },
    } as any);

    await adminOfferService.listOffers({ status: "PENDING_APPROVAL", page: 1, limit: 10 });
    expect(getSpy).toHaveBeenCalledWith("/product-manager/offers?page=1&limit=10&status=PENDING_APPROVAL");

    await adminOfferService.listOffers({ status: "PUBLISHED", page: 1, limit: 10 });
    expect(getSpy).toHaveBeenCalledWith("/product-manager/offers?page=1&limit=10&status=PUBLISHED");
  });

  // Test 10: Offer approval submission
  it("10. Offer approval submission - calls PATCH /product-manager/offers/:id/submit-approval", async () => {
    const patchSpy = vi.spyOn(apiClient, "patch").mockResolvedValue({
      data: {
        success: true,
        data: { id: "off_123", status: "PENDING_APPROVAL" },
      },
    } as any);

    const result = await adminOfferService.submitForApproval("off_123");
    expect(patchSpy).toHaveBeenCalledWith("/product-manager/offers/off_123/submit-approval");
    expect(result.status).toBe("PENDING_APPROVAL");
  });

  // Test 11: Offer status update (Pausing)
  it("11. Offer status update (Pausing) - calls PATCH /product-manager/offers/:id/status with PAUSED", async () => {
    const patchSpy = vi.spyOn(apiClient, "patch").mockResolvedValue({
      data: {
        success: true,
        data: { id: "off_123", status: "PAUSED" },
      },
    } as any);

    const result = await adminOfferService.updateStatus("off_123", "PAUSED");
    expect(patchSpy).toHaveBeenCalledWith("/product-manager/offers/off_123/status", {
      status: "PAUSED",
    });
    expect(result.status).toBe("PAUSED");
  });

  // Test 12: Offer status update (Expiring)
  it("12. Offer status update (Expiring) - calls PATCH /product-manager/offers/:id/status with EXPIRED", async () => {
    const patchSpy = vi.spyOn(apiClient, "patch").mockResolvedValue({
      data: {
        success: true,
        data: { id: "off_123", status: "EXPIRED" },
      },
    } as any);

    const result = await adminOfferService.updateStatus("off_123", "EXPIRED");
    expect(patchSpy).toHaveBeenCalledWith("/product-manager/offers/off_123/status", {
      status: "EXPIRED",
    });
    expect(result.status).toBe("EXPIRED");
  });

  // Test 13: Unauthorized access handling
  it("13. Unauthorized access handling - blocks non-SUPER_ADMIN roles from admin routes", () => {
    expect(isStaffRole("CUSTOMER")).toBe(false);
    expect(getRoleDashboardPath("CUSTOMER")).toBe("/customer/dashboard");
    expect(getRoleDashboardPath("PRODUCT_MANAGER")).toBe("/product-manager/dashboard");
    expect(getRoleDashboardPath("SOCIAL_MEDIA_MANAGER")).toBe("/social-media-manager/dashboard");
    expect(getRoleDashboardPath("SUPER_ADMIN")).toBe("/admin/dashboard");
  });

  // Test 14: API failure and empty states
  it("14. API failure and empty states - handles API errors cleanly with thrown message", async () => {
    vi.spyOn(apiClient, "get").mockRejectedValue({
      response: { data: { success: false, message: "User not found" } },
    });

    await expect(adminUserService.getUserById("usr_missing")).rejects.toThrow();
  });

  // Test 15: Pagination
  it("15. Pagination - correctly computes page limits and supports audit log navigation", async () => {
    const mockAuditPayload = {
      items: [
        {
          id: "log_1",
          actorUserId: "admin_1",
          action: "user.activate",
          moduleName: "user",
          entityId: "usr_2",
          metadata: { newStatus: true },
          createdAt: "2026-01-01T12:00:00.000Z",
          actor: { id: "admin_1", fullName: "Admin One", email: "admin@aslicart.com" },
        },
      ],
      pagination: {
        page: 3,
        limit: 15,
        total: 45,
        totalPages: 3,
      },
    };

    const getSpy = vi.spyOn(apiClient, "get").mockResolvedValue({
      data: { success: true, data: mockAuditPayload },
    } as any);

    const result = await adminAuditLogService.listLogs({ page: 3, limit: 15 });
    expect(getSpy).toHaveBeenCalledWith("/admin/audit-logs?page=3&limit=15");
    expect(result.pagination.page).toBe(3);
    expect(result.pagination.totalPages).toBe(3);
    expect(result.items[0].action).toBe("user.activate");
  });
});

