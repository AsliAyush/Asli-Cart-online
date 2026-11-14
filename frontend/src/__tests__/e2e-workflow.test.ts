import { describe, it, expect, beforeEach, vi, afterEach } from "vitest";
import { apiClient } from "@/services/api";
import { adminUserService } from "@/modules/admin/users/user.service";
import { adminOfferService } from "@/modules/admin/offers/offer.service";
import { createEmployeeSchema } from "@/modules/admin/users/validators";
import { productDiscoveryService } from "@/modules/product_manager/discovery/discovery.service";
import { pmProductService } from "@/modules/product_manager/products/product.service";
import { pmOfferService } from "@/modules/product_manager/offers/offer.service";
import { createOfferFormSchema } from "@/modules/product_manager/offers/validators";
import {
  customerCatalogService,
  customerCartService,
  customerWishlistService,
  customerProfileService,
} from "@/modules/customer/services";
import { authService } from "@/services/auth";
import { useAuthStore } from "@/stores/auth-store";
import { isStaffRole, hasAllowedRole, getRoleDashboardPath } from "@/lib/auth-helpers";

describe("Phase 7 End-to-End Business Workflows (Frontend Integration Test Suite)", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  // ==========================================
  // WORKFLOW 1: Super Admin creates staff
  // ==========================================
  it("Workflow 1: Super Admin provisions staff with strict role guards and permission checks", async () => {
    // 1a. Staff role validation check: Only staff roles are valid
    expect(isStaffRole("PRODUCT_MANAGER")).toBe(true);
    expect(isStaffRole("SOCIAL_MEDIA_MANAGER")).toBe(true);
    expect(isStaffRole("CUSTOMER")).toBe(false);
    expect(isStaffRole(null)).toBe(false);
    expect(isStaffRole(undefined)).toBe(false);

    // 1b. Validate form schema prevents missing or invalid fields
    const invalidForm = createEmployeeSchema.safeParse({
      fullName: "",
      email: "invalid-email",
      password: "123",
      roleId: "",
    });
    expect(invalidForm.success).toBe(false);

    const validForm = createEmployeeSchema.safeParse({
      fullName: "Pooja PM Lead",
      email: "pooja.pm@aslicart.com",
      password: "Password123!",
      roleId: "role-pm-uuid",
    });
    expect(validForm.success).toBe(true);

    // 1c. Mock API call to create staff
    const postSpy = vi.spyOn(apiClient, "post").mockResolvedValue({
      data: {
        success: true,
        data: {
          id: "staff-101",
          fullName: "Pooja PM Lead",
          email: "pooja.pm@aslicart.com",
          role: { id: "role-pm-uuid", name: "PRODUCT_MANAGER" },
          isActive: true,
        },
      },
    } as any);

    const created = await adminUserService.createEmployee({
      fullName: "Pooja PM Lead",
      email: "pooja.pm@aslicart.com",
      password: "Password123!",
      roleId: "role-pm-uuid",
    });

    expect(postSpy).toHaveBeenCalledWith("/admin/users", {
      fullName: "Pooja PM Lead",
      email: "pooja.pm@aslicart.com",
      password: "Password123!",
      roleId: "role-pm-uuid",
    });
    expect(created.id).toBe("staff-101");
    expect(created.role?.name).toBe("PRODUCT_MANAGER");
    expect(getRoleDashboardPath("PRODUCT_MANAGER")).toBe("/product-manager/dashboard");
  });

  // ==========================================
  // WORKFLOW 2: Product Manager discovers & creates a catalog product
  // ==========================================
  it("Workflow 2: Product Manager discovers deals and registers new catalog product", async () => {
    // 2a. PM discovers external deals with mock/demo transparency
    const getSpy = vi.spyOn(apiClient, "get").mockResolvedValue({
      data: {
        success: true,
        data: [
          {
            externalId: "disc-1",
            title: "Apple iPhone 15 128GB",
            merchantSlug: "amazon",
            merchantName: "Amazon India",
            originalPrice: 79900,
            sellingPrice: 69900,
            discountPercentage: 12.5,
            currency: "INR",
            productUrl: "https://amazon.in/dp/B0CHX1W1XY",
          },
        ],
      },
    } as any);

    const discoveryResult = await productDiscoveryService.searchDiscovered({ keyword: "iPhone" });
    expect(getSpy).toHaveBeenCalledWith(expect.stringContaining("/product-manager/discovery"));
    expect(discoveryResult[0].merchantName).toBe("Amazon India");
    expect(discoveryResult[0].sellingPrice).toBe(69900);

    // 2b. PM creates a product in catalog (starts as DRAFT)
    const postSpy = vi.spyOn(apiClient, "post").mockResolvedValue({
      data: {
        success: true,
        data: {
          id: "prod-iphone-15",
          name: "Apple iPhone 15 128GB Blue",
          slug: "apple-iphone-15-128gb-blue",
          categoryId: "cat-mobiles",
          brand: "Apple",
          status: "DRAFT",
          createdAt: new Date().toISOString(),
        },
      },
    } as any);

    const createdProduct = await pmProductService.createProduct({
      name: "Apple iPhone 15 128GB Blue",
      categoryId: "cat-mobiles",
      brand: "Apple",
      mainImage: "https://example.com/iphone15.jpg",
      description: "Latest Apple smartphone with Dynamic Island",
    });

    expect(postSpy).toHaveBeenCalledWith("/product-manager/products", expect.any(Object));
    expect(createdProduct.status).toBe("DRAFT");
  });

  // ==========================================
  // WORKFLOW 3: Product Manager creates offer & submits for approval
  // ==========================================
  it("Workflow 3: Product Manager creates offer and submits for approval", async () => {
    // 3a. Form validation: selling price cannot exceed original price
    const invalidPricing = createOfferFormSchema.safeParse({
      productId: "prod-iphone-15",
      merchantId: "merch-amazon",
      title: "Invalid Pricing Offer",
      originalPrice: 50000,
      sellingPrice: 70000, // Invalid: selling > original
      originalUrl: "https://amazon.in/dp/example",
      availability: "IN_STOCK",
    });
    expect(invalidPricing.success).toBe(false);

    // 3b. Create valid offer in DRAFT status
    const postSpy = vi.spyOn(apiClient, "post").mockResolvedValue({
      data: {
        success: true,
        data: {
          id: "off-iphone-amazon",
          productId: "prod-iphone-15",
          merchantId: "merch-amazon",
          title: "iPhone 15 Fest Offer",
          originalPrice: 79900,
          sellingPrice: 69900,
          discountPercentage: 12.5,
          status: "DRAFT",
        },
      },
    } as any);

    const createdOffer = await pmOfferService.createOffer({
      productId: "prod-iphone-15",
      merchantId: "merch-amazon",
      title: "iPhone 15 Fest Offer",
      originalPrice: 79900,
      sellingPrice: 69900,
      originalUrl: "https://amazon.in/dp/B0CHX1W1XY",
      availability: "IN_STOCK",
    });

    expect(createdOffer.status).toBe("DRAFT");

    // 3c. PM submits offer for approval -> PENDING_APPROVAL
    const patchSpy = vi.spyOn(apiClient, "patch").mockResolvedValue({
      data: {
        success: true,
        data: {
          id: "off-iphone-amazon",
          status: "PENDING_APPROVAL",
        },
      },
    } as any);

    const submitted = await pmOfferService.submitForApproval("off-iphone-amazon");
    expect(patchSpy).toHaveBeenCalledWith("/product-manager/offers/off-iphone-amazon/submit-approval");
    expect(submitted.status).toBe("PENDING_APPROVAL");
  });

  // ==========================================
  // WORKFLOW 4: Super Admin reviews, rejects/approves & publishes
  // ==========================================
  it("Workflow 4: Super Admin reviews offer, requires rejection reason, approves and publishes", async () => {
    // 4a. Super Admin rejects offer with mandatory reason
    const patchSpy = vi.spyOn(apiClient, "patch").mockResolvedValueOnce({
      data: {
        success: true,
        data: {
          id: "off-iphone-amazon",
          status: "REJECTED",
          rejectionReason: "Price discrepancy with merchant live page",
        },
      },
    } as any);

    const rejected = await adminOfferService.rejectOffer(
      "off-iphone-amazon",
      "Price discrepancy with merchant live page"
    );
    expect(patchSpy).toHaveBeenCalledWith("/admin/offers/off-iphone-amazon/reject", {
      reason: "Price discrepancy with merchant live page",
    });
    expect(rejected.status).toBe("REJECTED");

    // 4b. Super Admin approves offer
    patchSpy.mockResolvedValueOnce({
      data: {
        success: true,
        data: {
          id: "off-iphone-amazon",
          status: "APPROVED",
        },
      },
    } as any);

    const approved = await adminOfferService.approveOffer("off-iphone-amazon");
    expect(patchSpy).toHaveBeenCalledWith("/admin/offers/off-iphone-amazon/approve");
    expect(approved.status).toBe("APPROVED");

    // 4c. Super Admin publishes approved offer
    patchSpy.mockResolvedValueOnce({
      data: {
        success: true,
        data: {
          id: "off-iphone-amazon",
          status: "PUBLISHED",
        },
      },
    } as any);

    const published = await adminOfferService.publishOffer("off-iphone-amazon");
    expect(patchSpy).toHaveBeenCalledWith("/admin/offers/off-iphone-amazon/publish");
    expect(published.status).toBe("PUBLISHED");
  });

  // ==========================================
  // WORKFLOW 5: Customer discovers products & compares multi-merchant offers
  // ==========================================
  it("Workflow 5: Customer discovers products and compares multi-merchant offers", async () => {
    // 5a. Customer searches catalog
    const getSpy = vi.spyOn(apiClient, "get").mockResolvedValueOnce({
      data: {
        success: true,
        data: {
          items: [
            {
              id: "prod-iphone-15",
              name: "Apple iPhone 15 128GB Blue",
              bestPrice: 68999,
              originalPrice: 79900,
              discountPercentage: 13.6,
              totalOffers: 2,
            },
          ],
          pagination: { page: 1, limit: 20, total: 1, totalPages: 1 },
        },
      },
    } as any);

    const searchResult = await customerCatalogService.listProducts({ search: "iPhone" });
    expect(searchResult.items).toHaveLength(1);
    expect(searchResult.items[0].bestPrice).toBe(68999);

    // 5b. Customer opens product details and compares multi-merchant offers
    getSpy.mockResolvedValueOnce({
      data: {
        success: true,
        data: {
          id: "prod-iphone-15",
          name: "Apple iPhone 15 128GB Blue",
          offers: [
            {
              id: "off-iphone-amazon",
              merchant: { id: "merch-amazon", name: "Amazon India" },
              sellingPrice: 69900,
              originalPrice: 79900,
              discountPercentage: 12.5,
            },
            {
              id: "off-galaxy-flipkart",
              merchant: { id: "merch-flipkart", name: "Flipkart" },
              sellingPrice: 68999,
              originalPrice: 79900,
              discountPercentage: 13.6,
            },
          ],
        },
      },
    } as any);

    const productDetails = await customerCatalogService.getProductDetails("prod-iphone-15");
    expect(productDetails.offers).toHaveLength(2);
    expect(productDetails.offers[0].merchant.name).toBe("Amazon India");
    expect(productDetails.offers[1].merchant.name).toBe("Flipkart");
  });

  // ==========================================
  // WORKFLOW 6: Multi-merchant cart with retailer grouping
  // ==========================================
  it("Workflow 6: Multi-merchant cart groups items by retailer with independent checkout", async () => {
    // 6a. Add Amazon offer to cart
    const postSpy = vi.spyOn(apiClient, "post").mockResolvedValueOnce({
      data: { success: true, data: { id: "ci-1", offerId: "off-iphone-amazon", quantity: 1 } },
    } as any);

    await customerCartService.addItem("off-iphone-amazon", 1);
    expect(postSpy).toHaveBeenCalledWith("/customer/cart/items", {
      offerId: "off-iphone-amazon",
      quantity: 1,
    });

    // 6b. Add Flipkart offer to cart
    postSpy.mockResolvedValueOnce({
      data: { success: true, data: { id: "ci-2", offerId: "off-galaxy-flipkart", quantity: 2 } },
    } as any);

    await customerCartService.addItem("off-galaxy-flipkart", 2);

    // 6c. Fetch cart: verify retailer grouping
    const getSpy = vi.spyOn(apiClient, "get").mockResolvedValueOnce({
      data: {
        success: true,
        data: {
          itemsCount: 3,
          totalEstimatedAmount: 207898,
          merchantGroups: [
            {
              merchant: { id: "merch-amazon", name: "Amazon India" },
              items: [{ itemId: "ci-1", title: "iPhone 15 Fest Offer", quantity: 1, sellingPrice: 69900 }],
              groupSubtotal: 69900,
            },
            {
              merchant: { id: "merch-flipkart", name: "Flipkart" },
              items: [{ itemId: "ci-2", title: "iPhone 15 Flipkart Deal", quantity: 2, sellingPrice: 68999 }],
              groupSubtotal: 137998,
            },
          ],
        },
      },
    } as any);

    const cart = await customerCartService.getCart();
    expect(cart.merchantGroups).toHaveLength(2);
    expect(cart.merchantGroups[0].merchant.name).toBe("Amazon India");
    expect(cart.merchantGroups[1].merchant.name).toBe("Flipkart");
    expect(cart.merchantGroups[0].groupSubtotal).toBe(69900);
    expect(cart.merchantGroups[1].groupSubtotal).toBe(137998);

    // 6d. Update quantity and delete item
    const patchSpy = vi.spyOn(apiClient, "patch").mockResolvedValueOnce({
      data: { success: true, data: { id: "ci-2", quantity: 1 } },
    } as any);

    await customerCartService.updateQuantity("ci-2", 1);
    expect(patchSpy).toHaveBeenCalledWith("/customer/cart/items/ci-2", { quantity: 1 });

    const deleteSpy = vi.spyOn(apiClient, "delete").mockResolvedValueOnce({
      data: { success: true, message: "Item removed" },
    } as any);

    await customerCartService.removeItem("ci-2");
    expect(deleteSpy).toHaveBeenCalledWith("/customer/cart/items/ci-2");
  });

  // ==========================================
  // WORKFLOW 7: Affiliate redirect and click tracking
  // ==========================================
  it("Workflow 7: Outbound affiliate redirect tracks click and returns destination URL", async () => {
    // 7a. Customer triggers merchant redirect from cart
    const postSpy = vi.spyOn(apiClient, "post").mockResolvedValueOnce({
      data: {
        success: true,
        data: {
          clickReference: "clk_ref_998877",
          destinationUrl: "https://cuelinks.test/amz-iphone?subId1=clk_ref_998877",
          merchantName: "Amazon India",
        },
      },
    } as any);

    const redirectInfo = await customerCartService.generateMerchantRedirect("off-iphone-amazon", "cart");
    expect(postSpy).toHaveBeenCalledWith("/customer/cart/merchant-redirect", {
      offerId: "off-iphone-amazon",
      source: "cart",
    });
    expect(redirectInfo.clickReference).toBe("clk_ref_998877");
    expect(redirectInfo.destinationUrl).toContain("cuelinks.test");
  });

  // ==========================================
  // WORKFLOW 8: Customer wishlist, profile & session revocation
  // ==========================================
  it("Workflow 8: Customer wishlist management, profile updates, and session termination", async () => {
    // 8a. Add to wishlist
    const postSpy = vi.spyOn(apiClient, "post").mockResolvedValueOnce({
      data: {
        success: true,
        data: {
          message: "Product added to wishlist",
          item: { itemId: "wl-1", productId: "prod-iphone-15", name: "Apple iPhone 15" },
        },
      },
    } as any);

    const result = await customerWishlistService.addItem("prod-iphone-15");
    expect(postSpy).toHaveBeenCalledWith("/customer/wishlist/items", { productId: "prod-iphone-15" });
    expect(result.item.productId).toBe("prod-iphone-15");

    // 8b. Get wishlist items
    const getSpy = vi.spyOn(apiClient, "get").mockResolvedValueOnce({
      data: {
        success: true,
        data: {
          wishlistId: "wl-user-1",
          itemsCount: 1,
          items: [{ itemId: "wl-1", product: { id: "prod-iphone-15", name: "Apple iPhone 15" } }],
        },
      },
    } as any);

    const wishlist = await customerWishlistService.getWishlist();
    expect(wishlist.items).toHaveLength(1);

    // 8c. Remove from wishlist
    const deleteSpy = vi.spyOn(apiClient, "delete").mockResolvedValueOnce({
      data: { success: true, message: "Item removed from wishlist" },
    } as any);

    await customerWishlistService.removeItem("wl-1");
    expect(deleteSpy).toHaveBeenCalledWith("/customer/wishlist/items/wl-1");

    // 8d. Change customer password (revoking sessions)
    const patchSpy = vi.spyOn(apiClient, "patch").mockResolvedValueOnce({
      data: { success: true, message: "Password changed successfully" },
    } as any);

    await customerProfileService.changePassword({
      currentPassword: "OldPassword123!",
      newPassword: "NewSecurePassword456!",
    });
    expect(patchSpy).toHaveBeenCalledWith("/customer/profile/change-password", {
      currentPassword: "OldPassword123!",
      newPassword: "NewSecurePassword456!",
    });

    // 8e. Customer logout clears auth store and tokens
    useAuthStore.getState().setAuth(
      { id: "cust-1", email: "cust@aslicart.com", fullName: "Customer", role: "CUSTOMER" },
      "dummy-access-token",
      "dummy-refresh-token"
    );

    postSpy.mockResolvedValueOnce({
      data: { success: true, message: "Logged out successfully" },
    } as any);

    await authService.logout();
    expect(postSpy).toHaveBeenCalledWith("/customer/auth/logout", {
      refreshToken: "dummy-refresh-token",
    });
    expect(useAuthStore.getState().isAuthenticated).toBe(false);
  });
});
