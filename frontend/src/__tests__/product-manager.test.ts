import { describe, it, expect, beforeEach, vi, afterEach } from "vitest";
import { apiClient } from "@/services/api";
import { productManagerDashboardService } from "@/modules/product_manager/dashboard/dashboard.service";
import { productDiscoveryService } from "@/modules/product_manager/discovery/discovery.service";
import { pmProductService } from "@/modules/product_manager/products/product.service";
import { createProductFormSchema, editProductFormSchema } from "@/modules/product_manager/products/validators";
import { pricingService } from "@/modules/product_manager/pricing/pricing.service";
import { calculateDiscountSchema } from "@/modules/product_manager/pricing/validators";
import { pmOfferService } from "@/modules/product_manager/offers/offer.service";
import { createOfferFormSchema } from "@/modules/product_manager/offers/validators";
import { pmAffiliateService } from "@/modules/product_manager/affiliate/affiliate.service";
import { convertAffiliateSchema } from "@/modules/product_manager/affiliate/validators";
import { hasAllowedRole, getRoleDashboardPath, isStaffRole } from "@/lib/auth-helpers";

describe("Phase 5 Product Manager Test Suite (Mocked & Isolated API Integration)", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  // Test 1: Product Manager Dashboard Rendering
  it("1. PM dashboard rendering - fetches summary counts, recent activity, and pending reviews", async () => {
    const mockSummary = {
      products: { total: 20, active: 14, draft: 4, pendingApproval: 2, assignedToSmm: 5 },
      offers: { total: 35, active: 22, expired: 3, pendingApproval: 7 },
    };

    const getSpy = vi.spyOn(apiClient, "get").mockImplementation((url: string) => {
      if (url === "/product-manager/dashboard") {
        return Promise.resolve({ data: { success: true, data: mockSummary } } as any);
      }
      if (url.startsWith("/product-manager/dashboard/recent-activity")) {
        return Promise.resolve({
          data: {
            success: true,
            data: { recentProducts: [], recentOffers: [] },
          },
        } as any);
      }
      if (url === "/product-manager/dashboard/pending-reviews") {
        return Promise.resolve({
          data: {
            success: true,
            data: { pendingProducts: [], pendingOffers: [], totalPending: 9 },
          },
        } as any);
      }
      return Promise.reject(new Error("Not found"));
    });

    const summary = await productManagerDashboardService.getSummary();
    const activity = await productManagerDashboardService.getRecentActivity(10);
    const pending = await productManagerDashboardService.getPendingReviews();

    expect(getSpy).toHaveBeenCalledWith("/product-manager/dashboard");
    expect(summary.products.total).toBe(20);
    expect(summary.products.assignedToSmm).toBe(5);
    expect(summary.offers.pendingApproval).toBe(7);
    expect(pending.totalPending).toBe(9);
  });

  // Test 2: Product Discovery Search and Import
  it("2. Product discovery search and import - queries feed and imports external product to catalog", async () => {
    const mockDiscovered = [
      {
        externalId: "DISC-AMZ-001",
        merchantSlug: "amazon",
        merchantName: "Amazon India",
        title: "Sony WH-1000XM5",
        originalPrice: 34990,
        sellingPrice: 26990,
        discountPercentage: 22.86,
        currency: "INR",
        productUrl: "https://www.amazon.in/dp/B09XS7JWHH",
      },
    ];

    const getSpy = vi.spyOn(apiClient, "get").mockResolvedValue({
      data: { success: true, data: mockDiscovered },
    } as any);

    const postSpy = vi.spyOn(apiClient, "post").mockResolvedValue({
      data: {
        success: true,
        message: "Product successfully imported from discovery feed",
        data: {
          product: { id: "prod_new", name: "Sony WH-1000XM5", slug: "sony-wh-1000xm5", status: "DRAFT" },
          offer: { id: "off_new", title: "Sony WH-1000XM5", sellingPrice: 26990, status: "DRAFT" },
        },
      },
    } as any);

    const items = await productDiscoveryService.searchDiscovered({
      keyword: "Sony",
      category: "electronics",
      merchant: "amazon",
      limit: 20,
    });

    expect(getSpy).toHaveBeenCalledWith(
      "/product-manager/discovery?keyword=Sony&category=electronics&merchant=amazon&limit=20"
    );
    expect(items).toHaveLength(1);
    expect(items[0].externalId).toBe("DISC-AMZ-001");

    const importRes = await productDiscoveryService.importProduct("DISC-AMZ-001");
    expect(postSpy).toHaveBeenCalledWith("/product-manager/discovery/import", {
      externalId: "DISC-AMZ-001",
    });
    expect(importRes.product.status).toBe("DRAFT");
    expect(importRes.offer.status).toBe("DRAFT");
  });

  // Test 3: Product Discovery Empty State
  it("3. Product discovery empty state - handles empty results when no items match search", async () => {
    vi.spyOn(apiClient, "get").mockResolvedValue({
      data: { success: true, data: [] },
    } as any);

    const items = await productDiscoveryService.searchDiscovered({ keyword: "NonExistentBrand123" });
    expect(items).toEqual([]);
  });

  // Test 4: Product Listing & Pagination
  it("4. Product listing & pagination - serializes query parameters correctly", async () => {
    const mockPayload = {
      items: [
        {
          id: "prod_1",
          name: "Apple iPhone 15",
          slug: "apple-iphone-15",
          brand: "Apple",
          categoryId: "cat_mobile",
          mainImage: "https://example.com/iphone.jpg",
          status: "DRAFT",
          isAssignedToSmm: true,
          createdById: "pm_1",
          createdAt: "2026-01-01T00:00:00.000Z",
          updatedAt: "2026-01-01T00:00:00.000Z",
        },
      ],
      pagination: { page: 2, limit: 10, total: 11, totalPages: 2 },
    };

    const getSpy = vi.spyOn(apiClient, "get").mockResolvedValue({
      data: { success: true, data: mockPayload },
    } as any);

    const result = await pmProductService.listProducts({
      page: 2,
      limit: 10,
      categoryId: "cat_mobile",
      status: "DRAFT",
      search: "iphone",
      isAssignedToSmm: true,
    });

    expect(getSpy).toHaveBeenCalledWith(
      "/product-manager/products?page=2&limit=10&categoryId=cat_mobile&status=DRAFT&search=iphone&isAssignedToSmm=true"
    );
    expect(result.pagination.page).toBe(2);
    expect(result.items[0].isAssignedToSmm).toBe(true);
  });

  // Test 5: Product Create and Edit Form Validation
  it("5. Product create & edit form validation - enforces min name length and valid URLs", () => {
    // Valid product creation
    const valid = createProductFormSchema.safeParse({
      name: "Samsung Galaxy S24",
      slug: "samsung-galaxy-s24",
      brand: "Samsung",
      categoryId: "cat_phones",
      mainImage: "https://images.example.com/s24.jpg",
      description: "Flagship smartphone",
    });
    expect(valid.success).toBe(true);

    // Invalid product creation: name too short
    const invalidName = createProductFormSchema.safeParse({
      name: "S",
      categoryId: "cat_phones",
      mainImage: "https://images.example.com/s24.jpg",
    });
    expect(invalidName.success).toBe(false);

    // Invalid product creation: invalid URL
    const invalidUrl = createProductFormSchema.safeParse({
      name: "Samsung Galaxy S24",
      categoryId: "cat_phones",
      mainImage: "not-a-valid-url",
    });
    expect(invalidUrl.success).toBe(false);

    // Edit form validation
    const validEdit = editProductFormSchema.safeParse({
      name: "Samsung Galaxy S24 Ultra",
      categoryId: "cat_phones",
      mainImage: "https://images.example.com/s24-ultra.jpg",
      isAssignedToSmm: true,
    });
    expect(validEdit.success).toBe(true);
  });

  // Test 6: Product Soft Archive
  it("6. Product archive action - sends DELETE request to soft-archive product", async () => {
    const deleteSpy = vi.spyOn(apiClient, "delete").mockResolvedValue({
      data: {
        success: true,
        message: "Product archived successfully",
        data: { id: "prod_arch", name: "Archived Product", status: "ARCHIVED" },
      },
    } as any);

    const result = await pmProductService.archiveProduct("prod_arch");
    expect(deleteSpy).toHaveBeenCalledWith("/product-manager/products/prod_arch");
    expect(result.status).toBe("ARCHIVED");
  });

  // Test 7: Product SMM Assignment
  it("7. Product SMM assignment - sends PATCH request to update SMM assignment flag", async () => {
    const patchSpy = vi.spyOn(apiClient, "patch").mockResolvedValue({
      data: {
        success: true,
        message: "Product successfully assigned to Social Media Manager",
        data: { id: "prod_1", isAssignedToSmm: true },
      },
    } as any);

    const result = await pmProductService.assignToSmm("prod_1", true);
    expect(patchSpy).toHaveBeenCalledWith("/product-manager/products/prod_1/assign-smm", {
      isAssigned: true,
    });
    expect(result.isAssignedToSmm).toBe(true);
  });

  // Test 8: Pricing Discount Calculation
  it("8. Pricing calculation - validates numeric constraints and calculates savings via backend", async () => {
    // Validator checks: selling price cannot exceed original price
    const invalidCalc = calculateDiscountSchema.safeParse({
      originalPrice: 1000,
      sellingPrice: 1500,
    });
    expect(invalidCalc.success).toBe(false);

    const validCalc = calculateDiscountSchema.safeParse({
      originalPrice: 2000,
      sellingPrice: 1500,
    });
    expect(validCalc.success).toBe(true);

    const postSpy = vi.spyOn(apiClient, "post").mockResolvedValue({
      data: {
        success: true,
        data: {
          originalPrice: 2000,
          sellingPrice: 1500,
          discountPercentage: 25,
          savings: 500,
        },
      },
    } as any);

    const result = await pricingService.calculateDiscount(2000, 1500);
    expect(postSpy).toHaveBeenCalledWith("/product-manager/pricing/calculate", {
      originalPrice: 2000,
      sellingPrice: 1500,
    });
    expect(result.discountPercentage).toBe(25);
    expect(result.savings).toBe(500);
  });

  // Test 9: Pricing History & Update Flow
  it("9. Pricing history & update flow - retrieves historical price points and updates offer price", async () => {
    const mockHistory = [
      {
        id: "ph_1",
        productId: "prod_1",
        price: 1500,
        originalPrice: 2000,
        discountPercentage: 25,
        currency: "INR",
        recordedAt: "2026-02-01T00:00:00.000Z",
      },
    ];

    const getSpy = vi.spyOn(apiClient, "get").mockResolvedValue({
      data: { success: true, data: mockHistory },
    } as any);

    const patchSpy = vi.spyOn(apiClient, "patch").mockResolvedValue({
      data: { success: true, data: { id: "off_1", originalPrice: 2000, sellingPrice: 1400 } },
    } as any);

    const history = await pricingService.getPriceHistory("prod_1", 20);
    expect(getSpy).toHaveBeenCalledWith("/product-manager/pricing/history/prod_1?limit=20");
    expect(history).toHaveLength(1);

    await pricingService.updateOfferPrice("off_1", { originalPrice: 2000, sellingPrice: 1400 });
    expect(patchSpy).toHaveBeenCalledWith("/product-manager/offers/off_1", {
      originalPrice: 2000,
      sellingPrice: 1400,
    });
  });

  // Test 10: Offer Listing & Filtering
  it("10. Offer listing & filtering - queries offers by status and product", async () => {
    const getSpy = vi.spyOn(apiClient, "get").mockResolvedValue({
      data: {
        success: true,
        data: { items: [], pagination: { page: 1, limit: 10, total: 0, totalPages: 1 } },
      },
    } as any);

    await pmOfferService.listOffers({ status: "REJECTED", page: 1, limit: 10 });
    expect(getSpy).toHaveBeenCalledWith("/product-manager/offers?page=1&limit=10&status=REJECTED");

    await pmOfferService.listOffers({ productId: "prod_1", status: "PENDING_APPROVAL" });
    expect(getSpy).toHaveBeenCalledWith(
      "/product-manager/offers?productId=prod_1&status=PENDING_APPROVAL"
    );
  });

  // Test 11: Offer Creation Form Validation
  it("11. Offer creation validation - enforces title length, URL format, and price bounds", () => {
    const valid = createOfferFormSchema.safeParse({
      productId: "prod_1",
      merchantId: "merchant_amazon",
      title: "Amazon Super Freedom Deal",
      originalPrice: 2499,
      sellingPrice: 1799,
      currency: "INR",
      originalUrl: "https://www.amazon.in/dp/B00123",
      availability: "IN_STOCK",
      priceSource: "manual",
    });
    expect(valid.success).toBe(true);

    // Selling price > original price
    const invalidPrice = createOfferFormSchema.safeParse({
      productId: "prod_1",
      merchantId: "merchant_amazon",
      title: "Amazon Deal",
      originalPrice: 1000,
      sellingPrice: 1500,
      originalUrl: "https://www.amazon.in/dp/B00123",
    });
    expect(invalidPrice.success).toBe(false);

    // Invalid URL
    const invalidUrl = createOfferFormSchema.safeParse({
      productId: "prod_1",
      merchantId: "merchant_amazon",
      title: "Amazon Deal",
      originalPrice: 2000,
      sellingPrice: 1500,
      originalUrl: "invalid-url",
    });
    expect(invalidUrl.success).toBe(false);
  });

  // Test 11b: Offer creation rejection on invalid merchant ID
  it("11b. Merchant ID validation - rejects offer creation when merchant does not exist in backend", async () => {
    vi.spyOn(apiClient, "post").mockRejectedValue({
      response: {
        status: 400,
        data: {
          success: false,
          message: "Referenced merchant does not exist",
        },
      },
    });

    await expect(
      pmOfferService.createOffer({
        productId: "prod_1",
        merchantId: "invalid_nonexistent_merchant",
        title: "Deal with fake merchant",
        originalPrice: 2000,
        sellingPrice: 1500,
        originalUrl: "https://www.example.com",
      })
    ).rejects.toThrow();
  });

  // Test 12: Offer Submission for Admin Review (Exact Endpoint Verification)
  it("12. Offer submission for Admin approval - calls exact endpoint PATCH /product-manager/offers/:id/submit-approval", async () => {
    const patchSpy = vi.spyOn(apiClient, "patch").mockResolvedValue({
      data: {
        success: true,
        message: "Merchant offer submitted for Admin approval",
        data: { id: "off_submit_1", status: "PENDING_APPROVAL", rejectionReason: null },
      },
    } as any);

    const result = await pmOfferService.submitForApproval("off_submit_1");
    expect(patchSpy).toHaveBeenCalledWith(
      "/product-manager/offers/off_submit_1/submit-approval"
    );
    expect(result.status).toBe("PENDING_APPROVAL");
  });

  // Test 13: Offer Status Lifecycle Transitions (PAUSED & EXPIRED)
  it("13. Offer status update - Product Manager can pause or expire live offers", async () => {
    const patchSpy = vi.spyOn(apiClient, "patch").mockResolvedValue({
      data: {
        success: true,
        data: { id: "off_pause_1", status: "PAUSED" },
      },
    } as any);

    const paused = await pmOfferService.updateStatus("off_pause_1", "PAUSED");
    expect(patchSpy).toHaveBeenCalledWith("/product-manager/offers/off_pause_1/status", {
      status: "PAUSED",
    });
    expect(paused.status).toBe("PAUSED");

    patchSpy.mockResolvedValueOnce({
      data: {
        success: true,
        data: { id: "off_pause_1", status: "EXPIRED" },
      },
    } as any);

    const expired = await pmOfferService.updateStatus("off_pause_1", "EXPIRED");
    expect(patchSpy).toHaveBeenCalledWith("/product-manager/offers/off_pause_1/status", {
      status: "EXPIRED",
    });
    expect(expired.status).toBe("EXPIRED");
  });

  // Test 14: Rejected Offer & Rejection Reason Retrieval
  it("14. Rejected offer inspection - retrieves rejectionReason returned by Super Admin", async () => {
    const mockOfferDetail = {
      id: "off_rej_1",
      title: "Rejected Amazon Offer",
      status: "REJECTED",
      rejectionReason: "Original price is lower than market benchmark and coupon code is expired.",
      originalPrice: 1999,
      sellingPrice: 1499,
      discountPercentage: 25,
      currency: "INR",
      originalUrl: "https://www.amazon.in/dp/test",
      product: { id: "prod_1", name: "Test Product", slug: "test", mainImage: "", status: "APPROVED" },
      merchant: { id: "m_1", name: "Amazon", slug: "amazon" },
      priceHistories: [],
      affiliateLinks: [],
    };

    vi.spyOn(apiClient, "get").mockResolvedValue({
      data: { success: true, data: mockOfferDetail },
    } as any);

    const offer = await pmOfferService.getOfferById("off_rej_1");
    expect(offer.status).toBe("REJECTED");
    expect(offer.rejectionReason).toContain("Original price is lower than market benchmark");
  });

  // Test 15: Affiliate Deep Link Generator
  it("15. Affiliate link generation - calls backend affiliate conversion without constructing client URLs", async () => {
    const valid = convertAffiliateSchema.safeParse({
      originalUrl: "https://www.flipkart.com/apple-iphone-15/p/itm123",
      offerId: "off_123",
      subId1: "pm_test",
    });
    expect(valid.success).toBe(true);

    const postSpy = vi.spyOn(apiClient, "post").mockResolvedValue({
      data: {
        success: true,
        data: {
          id: "aff_link_1",
          offerId: "off_123",
          originalUrl: "https://www.flipkart.com/apple-iphone-15/p/itm123",
          affiliateUrl: "https://cuelinks.com/redirect?url=https%3A%2F%2Fflipkart.com...",
          provider: "CUELINKS",
          status: "ACTIVE",
          createdAt: "2026-02-01T00:00:00.000Z",
        },
      },
    } as any);

    const result = await pmAffiliateService.convertUrl({
      originalUrl: "https://www.flipkart.com/apple-iphone-15/p/itm123",
      offerId: "off_123",
      subId1: "pm_test",
    });

    expect(postSpy).toHaveBeenCalledWith("/product-manager/affiliate/convert", {
      originalUrl: "https://www.flipkart.com/apple-iphone-15/p/itm123",
      offerId: "off_123",
      subId1: "pm_test",
    });
    expect(result.provider).toBe("CUELINKS");
    expect(result.affiliateUrl).toContain("cuelinks.com");
  });

  // Test 16: Security & Role-Based Access Guards
  it("16. Role-based security guards - allows PRODUCT_MANAGER and blocks unauthorized roles", () => {
    const pmUser: any = {
      id: "u_pm",
      fullName: "PM Jane",
      email: "pm@aslicart.com",
      role: "PRODUCT_MANAGER",
    };

    const customerUser: any = {
      id: "u_cust",
      fullName: "Customer Bob",
      email: "bob@gmail.com",
      role: "CUSTOMER",
    };

    const adminUser: any = {
      id: "u_admin",
      fullName: "Super Admin",
      email: "admin@aslicart.com",
      role: "SUPER_ADMIN",
    };

    // Role verification for PM portal
    expect(hasAllowedRole(pmUser, ["PRODUCT_MANAGER", "SUPER_ADMIN"])).toBe(true);
    expect(hasAllowedRole(adminUser, ["PRODUCT_MANAGER", "SUPER_ADMIN"])).toBe(true);
    expect(hasAllowedRole(customerUser, ["PRODUCT_MANAGER", "SUPER_ADMIN"])).toBe(false);

    // Dashboard path mapping
    expect(getRoleDashboardPath("PRODUCT_MANAGER")).toBe("/product-manager/dashboard");
    expect(getRoleDashboardPath("CUSTOMER")).toBe("/customer/dashboard");
    expect(isStaffRole("PRODUCT_MANAGER")).toBe(true);
    expect(isStaffRole("CUSTOMER")).toBe(false);
  });

  // Test 17: Product Manager Cannot Approve or Publish Offers
  it("17. Critical RBAC guard - PM service does not provide approve or publish actions", () => {
    // pmOfferService must strictly only expose listOffers, getOfferById, createOffer, updateOffer, submitForApproval, updateStatus
    const serviceKeys = Object.keys(pmOfferService);
    expect(serviceKeys).not.toContain("approveOffer");
    expect(serviceKeys).not.toContain("publishOffer");
    expect(serviceKeys).toContain("submitForApproval");
    expect(serviceKeys).toContain("updateStatus");
  });
});

