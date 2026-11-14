import { describe, it, expect, beforeEach, vi, afterEach } from "vitest";
import { apiClient } from "@/services/api";
import {
  customerCatalogService,
  customerOffersService,
  customerCartService,
  customerWishlistService,
  customerProfileService,
  customerDashboardService,
} from "@/modules/customer/services";
import {
  updateCustomerProfileSchema,
  changeCustomerPasswordSchema,
} from "@/modules/customer/validators";
import { authService } from "@/services/auth";
import { hasAllowedRole, isStaffRole, getRoleDashboardPath } from "@/lib/auth-helpers";

describe("Phase 6 Customer Storefront & E-Commerce Test Suite", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  // Test 1: Homepage data loading (Featured deals, newest products, categories)
  it("1. Homepage data loading - fetches top discount deals and newest catalog additions", async () => {
    const mockProducts = [
      {
        id: "prod-1",
        name: "Apple MacBook Air M3",
        slug: "apple-macbook-air-m3",
        brand: "Apple",
        mainImage: "https://example.com/macbook.jpg",
        category: { id: "cat-1", name: "Laptops", slug: "laptops" },
        bestPrice: 104990,
        originalPrice: 134900,
        discountPercentage: 22,
        merchantName: "Amazon India",
        merchantLogo: "https://example.com/amazon.png",
        totalOffers: 3,
        createdAt: new Date().toISOString(),
      },
    ];

    const getSpy = vi.spyOn(apiClient, "get").mockResolvedValue({
      data: {
        success: true,
        data: {
          items: mockProducts,
          pagination: { page: 1, limit: 8, total: 1, totalPages: 1 },
        },
      },
    } as any);

    const deals = await customerCatalogService.listProducts({
      sort: "discount_desc",
      limit: 8,
    });

    expect(getSpy).toHaveBeenCalledWith("/customer/products", {
      params: { sort: "discount_desc", limit: 8 },
    });
    expect(deals.items).toHaveLength(1);
    expect(deals.items[0].name).toBe("Apple MacBook Air M3");
    expect(deals.items[0].bestPrice).toBe(104990);
    expect(deals.items[0].merchantName).toBe("Amazon India");
    expect(deals.items[0].discountPercentage).toBe(22);
  });

  // Test 2: Product listing and server-side pagination
  it("2. Product listing and pagination - handles page numbers and limit offsets", async () => {
    const getSpy = vi.spyOn(apiClient, "get").mockResolvedValue({
      data: {
        success: true,
        data: {
          items: [
            { id: "p1", name: "Product 1", bestPrice: 1000, discountPercentage: 10 },
            { id: "p2", name: "Product 2", bestPrice: 2000, discountPercentage: 15 },
          ],
          pagination: { page: 2, limit: 2, total: 10, totalPages: 5 },
        },
      },
    } as any);

    const result = await customerCatalogService.listProducts({ page: 2, limit: 2 });
    expect(getSpy).toHaveBeenCalledWith("/customer/products", {
      params: { page: 2, limit: 2 },
    });
    expect(result.pagination.page).toBe(2);
    expect(result.pagination.totalPages).toBe(5);
    expect(result.items).toHaveLength(2);
  });

  // Test 3: Product search and filtering
  it("3. Product search and filters - passes search keywords, category, price, and discount parameters", async () => {
    const getSpy = vi.spyOn(apiClient, "get").mockResolvedValue({
      data: {
        success: true,
        data: {
          items: [],
          pagination: { page: 1, limit: 16, total: 0, totalPages: 1 },
        },
      },
    } as any);

    await customerCatalogService.listProducts({
      search: "Sony Headphones",
      category: "audio",
      minPrice: 5000,
      maxPrice: 30000,
      minDiscount: 20,
      sort: "price_asc",
    });

    expect(getSpy).toHaveBeenCalledWith("/customer/products", {
      params: {
        search: "Sony Headphones",
        category: "audio",
        minPrice: 5000,
        maxPrice: 30000,
        minDiscount: 20,
        sort: "price_asc",
      },
    });
  });

  // Test 4: Quick search endpoint
  it("4. Quick search endpoint - queries /customer/products/search with q parameter", async () => {
    const getSpy = vi.spyOn(apiClient, "get").mockResolvedValue({
      data: {
        success: true,
        data: {
          items: [{ id: "p-sony", name: "Sony WH-1000XM5" }],
          pagination: { page: 1, limit: 20, total: 1, totalPages: 1 },
        },
      },
    } as any);

    const res = await customerCatalogService.searchProducts("Sony", 1, 20);
    expect(getSpy).toHaveBeenCalledWith("/customer/products/search", {
      params: { q: "Sony", page: 1, limit: 20 },
    });
    expect(res.items[0].name).toBe("Sony WH-1000XM5");
  });

  // Test 5: Product detail loading with multi-merchant offers
  it("5. Product detail loading - loads specifications and multiple merchant offers", async () => {
    const mockDetails = {
      id: "prod-100",
      name: "Samsung Galaxy S24 Ultra",
      slug: "samsung-galaxy-s24-ultra",
      brand: "Samsung",
      mainImage: "https://example.com/s24.jpg",
      additionalImages: ["https://example.com/s24-back.jpg"],
      specifications: { RAM: "12GB", Storage: "256GB" },
      category: { id: "cat-phone", name: "Smartphones", slug: "smartphones" },
      bestPrice: 109999,
      maxDiscount: 18,
      offers: [
        {
          id: "off-amz",
          merchant: { id: "m-1", name: "Amazon India", slug: "amazon", websiteUrl: "https://amazon.in" },
          title: "S24 Ultra with Bank Discount",
          originalPrice: 134999,
          sellingPrice: 109999,
          discountPercentage: 18,
          currency: "INR",
          couponCode: "HDFC10K",
          availability: "IN_STOCK",
          priceVerifiedAt: new Date().toISOString(),
        },
        {
          id: "off-fk",
          merchant: { id: "m-2", name: "Flipkart", slug: "flipkart", websiteUrl: "https://flipkart.com" },
          title: "S24 Ultra Standard Deal",
          originalPrice: 134999,
          sellingPrice: 114999,
          discountPercentage: 15,
          currency: "INR",
          couponCode: null,
          availability: "IN_STOCK",
          priceVerifiedAt: new Date().toISOString(),
        },
      ],
      createdAt: new Date().toISOString(),
    };

    const getSpy = vi.spyOn(apiClient, "get").mockResolvedValue({
      data: { success: true, data: mockDetails },
    } as any);

    const product = await customerCatalogService.getProductDetails("samsung-galaxy-s24-ultra");
    expect(getSpy).toHaveBeenCalledWith("/customer/products/samsung-galaxy-s24-ultra");
    expect(product.offers).toHaveLength(2);
    expect(product.offers[0].merchant.name).toBe("Amazon India");
    expect(product.offers[1].merchant.name).toBe("Flipkart");
    expect(product.offers[0].couponCode).toBe("HDFC10K");
  });

  // Test 6: Category listing
  it("6. Category listing - returns active categories with published product count", async () => {
    const mockCategories = [
      { id: "c1", name: "Laptops", slug: "laptops", description: "Portable computing", _count: { products: 12 } },
      { id: "c2", name: "Audio", slug: "audio", description: "Headphones & speakers", _count: { products: 8 } },
    ];

    const getSpy = vi.spyOn(apiClient, "get").mockResolvedValue({
      data: { success: true, data: mockCategories },
    } as any);

    const categories = await customerCatalogService.getCategories();
    expect(getSpy).toHaveBeenCalledWith("/customer/products/categories");
    expect(categories).toHaveLength(2);
    expect(categories[0]._count.products).toBe(12);
  });

  // Test 7: Multi-merchant offer comparison endpoint
  it("7. Compare offers endpoint - returns all published merchant offers sorted by price or discount", async () => {
    const mockCompare = {
      product: { id: "p1", name: "OnePlus 12", slug: "oneplus-12" },
      totalOffers: 2,
      offers: [
        {
          id: "o1",
          merchant: { id: "m1", name: "Amazon" },
          sellingPrice: 59999,
          discountPercentage: 15,
        },
        {
          id: "o2",
          merchant: { id: "m2", name: "OnePlus Store" },
          sellingPrice: 64999,
          discountPercentage: 10,
        },
      ],
    };

    const getSpy = vi.spyOn(apiClient, "get").mockResolvedValue({
      data: { success: true, data: mockCompare },
    } as any);

    const comparison = await customerOffersService.compareOffers("p1", "price_asc");
    expect(getSpy).toHaveBeenCalledWith("/customer/offers/compare/p1", {
      params: { sort: "price_asc" },
    });
    expect(comparison.totalOffers).toBe(2);
    expect(comparison.offers[0].sellingPrice).toBe(59999);
  });

  // Test 8: Offer details endpoint
  it("8. Offer details endpoint - fetches single verified merchant offer", async () => {
    const mockOffer = {
      id: "off-500",
      title: "Special Festival Discount",
      product: { id: "p1", name: "MacBook Air", brand: "Apple", status: "PUBLISHED" },
      merchant: { id: "m1", name: "Tata CLiQ", websiteUrl: "https://tatacliq.com" },
      originalPrice: 114900,
      sellingPrice: 89990,
      savings: 24910,
      discountPercentage: 22,
      currency: "INR",
      couponCode: "FESTIVAL2024",
      availability: "IN_STOCK",
      priceVerifiedAt: new Date().toISOString(),
    };

    const getSpy = vi.spyOn(apiClient, "get").mockResolvedValue({
      data: { success: true, data: mockOffer },
    } as any);

    const offer = await customerOffersService.getOfferById("off-500");
    expect(getSpy).toHaveBeenCalledWith("/customer/offers/off-500");
    expect(offer.merchant.name).toBe("Tata CLiQ");
    expect(offer.savings).toBe(24910);
    expect(offer.couponCode).toBe("FESTIVAL2024");
  });

  // Test 9: Customer authentication & registration integration
  it("9. Customer authentication - login and registration strictly enforce CUSTOMER role", async () => {
    const postSpy = vi.spyOn(apiClient, "post").mockResolvedValue({
      data: {
        success: true,
        message: "Customer signed in successfully",
        data: {
          accessToken: "jwt_customer_token",
          refreshToken: "jwt_customer_refresh",
          user: {
            id: "cust-1",
            fullName: "Aarav Sharma",
            email: "aarav@example.com",
            phone: "9876543210",
            roleName: "CUSTOMER",
          },
        },
      },
    } as any);

    const authResult = await authService.customerLogin({
      email: "aarav@example.com",
      password: "Password123!",
    });

    expect(postSpy).toHaveBeenCalledWith("/customer/auth/login", {
      email: "aarav@example.com",
      password: "Password123!",
    });
    expect(authResult.user.role).toBe("CUSTOMER");
    expect(isStaffRole(authResult.user.role)).toBe(false);
  });

  // Test 10: Customer profile fetching and updating
  it("10. Customer profile - fetches and updates profile fields safely", async () => {
    const mockProfile = {
      id: "u-1",
      fullName: "Priya Patel",
      email: "priya@example.com",
      phone: "9123456789",
      avatarUrl: null,
      role: "CUSTOMER",
      isActive: true,
      emailVerified: true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    const getSpy = vi.spyOn(apiClient, "get").mockResolvedValue({
      data: { success: true, data: mockProfile },
    } as any);

    const patchSpy = vi.spyOn(apiClient, "patch").mockResolvedValue({
      data: {
        success: true,
        data: { ...mockProfile, fullName: "Priya Sharma" },
      },
    } as any);

    const profile = await customerProfileService.getProfile();
    expect(getSpy).toHaveBeenCalledWith("/customer/profile");
    expect(profile.fullName).toBe("Priya Patel");

    const updated = await customerProfileService.updateProfile({
      fullName: "Priya Sharma",
    });
    expect(patchSpy).toHaveBeenCalledWith("/customer/profile", {
      fullName: "Priya Sharma",
    });
    expect(updated.fullName).toBe("Priya Sharma");
  });

  // Test 11: Customer profile form validator schemas
  it("11. Profile & password schemas - enforce validation rules", () => {
    // Valid profile
    const validProfile = updateCustomerProfileSchema.safeParse({
      fullName: "Rahul Verma",
      phone: "9876543210",
    });
    expect(validProfile.success).toBe(true);

    // Invalid phone length (< 10 digits)
    const invalidPhone = updateCustomerProfileSchema.safeParse({
      fullName: "Rahul Verma",
      phone: "12345",
    });
    expect(invalidPhone.success).toBe(false);

    // Password schema: Mismatch
    const mismatch = changeCustomerPasswordSchema.safeParse({
      currentPassword: "OldPassword1!",
      newPassword: "NewPassword1!",
      confirmPassword: "DifferentPassword2@",
    });
    expect(mismatch.success).toBe(false);

    // Password schema: Valid matching
    const matching = changeCustomerPasswordSchema.safeParse({
      currentPassword: "OldPassword1!",
      newPassword: "NewPassword1@",
      confirmPassword: "NewPassword1@",
    });
    expect(matching.success).toBe(true);
  });

  // Test 12: Cart addition
  it("12. Cart addition - adds merchant offer to customer cart", async () => {
    const postSpy = vi.spyOn(apiClient, "post").mockResolvedValue({
      data: {
        success: true,
        message: "Offer added to cart",
        data: { id: "item-1", quantity: 1 },
      },
    } as any);

    const result = await customerCartService.addItem("off-123", 1);
    expect(postSpy).toHaveBeenCalledWith("/customer/cart/items", {
      offerId: "off-123",
      quantity: 1,
    });
    expect(result.id).toBe("item-1");
  });

  // Test 13: Cart item quantity modification and removal
  it("13. Cart item modification - updates quantity and removes item", async () => {
    const patchSpy = vi.spyOn(apiClient, "patch").mockResolvedValue({
      data: { success: true, data: { id: "item-1", quantity: 3 } },
    } as any);

    const deleteSpy = vi.spyOn(apiClient, "delete").mockResolvedValue({
      data: { success: true, message: "Item removed" },
    } as any);

    const updated = await customerCartService.updateQuantity("item-1", 3);
    expect(patchSpy).toHaveBeenCalledWith("/customer/cart/items/item-1", { quantity: 3 });
    expect(updated.quantity).toBe(3);

    await customerCartService.removeItem("item-1");
    expect(deleteSpy).toHaveBeenCalledWith("/customer/cart/items/item-1");
  });

  // Test 14: Multi-merchant cart grouping (Central Business Rule)
  it("14. Multi-merchant cart grouping - partitions items by merchant for independent checkout", async () => {
    const mockCart = {
      cartId: "cart-1",
      itemsCount: 3,
      subtotal: 75000,
      currency: "INR",
      merchantGroups: [
        {
          merchant: { id: "m-amz", name: "Amazon India", slug: "amazon" },
          groupSubtotal: 50000,
          items: [
            {
              itemId: "i1",
              offerId: "o1",
              title: "Headphones",
              currentSellingPrice: 20000,
              quantity: 1,
              isEligible: true,
              hasPriceChanged: false,
            },
            {
              itemId: "i2",
              offerId: "o2",
              title: "Smartwatch",
              currentSellingPrice: 30000,
              quantity: 1,
              isEligible: true,
              hasPriceChanged: false,
            },
          ],
        },
        {
          merchant: { id: "m-fk", name: "Flipkart", slug: "flipkart" },
          groupSubtotal: 25000,
          items: [
            {
              itemId: "i3",
              offerId: "o3",
              title: "Tablet",
              currentSellingPrice: 25000,
              quantity: 1,
              isEligible: true,
              hasPriceChanged: false,
            },
          ],
        },
      ],
      items: [],
    };

    const getSpy = vi.spyOn(apiClient, "get").mockResolvedValue({
      data: { success: true, data: mockCart },
    } as any);

    const cart = await customerCartService.getCart();
    expect(getSpy).toHaveBeenCalledWith("/customer/cart");
    expect(cart.merchantGroups).toHaveLength(2);
    expect(cart.merchantGroups[0].merchant.name).toBe("Amazon India");
    expect(cart.merchantGroups[0].items).toHaveLength(2);
    expect(cart.merchantGroups[0].groupSubtotal).toBe(50000);
    expect(cart.merchantGroups[1].merchant.name).toBe("Flipkart");
    expect(cart.merchantGroups[1].items).toHaveLength(1);
    expect(cart.merchantGroups[1].groupSubtotal).toBe(25000);
  });

  // Test 15: Stale offer and price change detection in cart
  it("15. Stale offer handling - cart marks expired and price-changed items clearly", async () => {
    const mockCart = {
      cartId: "cart-stale",
      itemsCount: 2,
      subtotal: 10000,
      currency: "INR",
      merchantGroups: [
        {
          merchant: { id: "m1", name: "Croma" },
          groupSubtotal: 10000,
          items: [
            {
              itemId: "i-changed",
              offerId: "o-changed",
              snapshotPrice: 9000,
              currentSellingPrice: 10000,
              hasPriceChanged: true,
              priceDifference: 1000,
              isEligible: true,
              isExpired: false,
            },
            {
              itemId: "i-expired",
              offerId: "o-expired",
              snapshotPrice: 5000,
              currentSellingPrice: 5000,
              hasPriceChanged: false,
              priceDifference: 0,
              isEligible: false,
              isExpired: true,
            },
          ],
        },
      ],
      items: [],
    };

    vi.spyOn(apiClient, "get").mockResolvedValue({
      data: { success: true, data: mockCart },
    } as any);

    const cart = await customerCartService.getCart();
    const group = cart.merchantGroups[0];
    expect(group.items[0].hasPriceChanged).toBe(true);
    expect(group.items[0].priceDifference).toBe(1000);
    expect(group.items[1].isEligible).toBe(false);
    expect(group.items[1].isExpired).toBe(true);
  });

  // Test 16: Merchant redirect & affiliate tracking
  it("16. Merchant redirect - requests backend affiliate link with click reference attribution", async () => {
    const mockRedirect = {
      clickReference: "clk_1731320000_abcd12",
      redirectPath: "/api/v1/customer/redirect/clk_1731320000_abcd12",
      merchant: { id: "m-amz", name: "Amazon India", websiteUrl: "https://amazon.in" },
      product: { id: "p1", name: "Sony Headphones" },
      offer: { id: "off-amz", title: "Sony WH-1000XM5 Deal", sellingPrice: 24990 },
      destinationUrl: "https://amazon.in/dp/B09XS7JWHH?tag=aslicart-21",
    };

    const postSpy = vi.spyOn(apiClient, "post").mockResolvedValue({
      data: {
        success: true,
        message: "Merchant redirect resolved",
        data: mockRedirect,
      },
    } as any);

    const redirect = await customerCartService.generateMerchantRedirect("off-amz", "cart");
    expect(postSpy).toHaveBeenCalledWith("/customer/cart/merchant-redirect", {
      offerId: "off-amz",
      source: "cart",
    });
    expect(redirect.clickReference).toBe("clk_1731320000_abcd12");
    expect(redirect.destinationUrl).toContain("amazon.in");
    expect(redirect.destinationUrl).toContain("tag=aslicart-21");
  });

  // Test 17: Wishlist addition and removal
  it("17. Wishlist management - adds product to wishlist and removes item", async () => {
    const postSpy = vi.spyOn(apiClient, "post").mockResolvedValue({
      data: {
        success: true,
        message: "Product added to wishlist",
        data: { message: "Product added to wishlist", item: { itemId: "w-1", productId: "p-1", name: "iPad" } },
      },
    } as any);

    const deleteSpy = vi.spyOn(apiClient, "delete").mockResolvedValue({
      data: { success: true, message: "Item removed from wishlist" },
    } as any);

    const added = await customerWishlistService.addItem("p-1");
    expect(postSpy).toHaveBeenCalledWith("/customer/wishlist/items", { productId: "p-1" });
    expect(added.item.productId).toBe("p-1");

    await customerWishlistService.removeItem("w-1");
    expect(deleteSpy).toHaveBeenCalledWith("/customer/wishlist/items/w-1");
  });

  // Test 18: Customer dashboard summary
  it("18. Customer dashboard - fetches summary statistics, recent activity, and top discounts", async () => {
    const mockSummary = {
      stats: { totalCartItems: 4, totalWishlistItems: 6 },
      recentCartItems: [
        {
          itemId: "i1",
          quantity: 1,
          title: "MacBook Deal",
          productName: "MacBook Air",
          merchantName: "Amazon",
          sellingPrice: 104990,
          addedAt: new Date().toISOString(),
        },
      ],
      recommendedDeals: [
        {
          offerId: "o-rec",
          title: "50% off Headphones",
          productName: "Sony WH-CH720N",
          brand: "Sony",
          merchantName: "Flipkart",
          originalPrice: 14990,
          sellingPrice: 7490,
          discountPercentage: 50,
        },
      ],
    };

    const getSpy = vi.spyOn(apiClient, "get").mockResolvedValue({
      data: { success: true, data: mockSummary },
    } as any);

    const summary = await customerDashboardService.getSummary();
    expect(getSpy).toHaveBeenCalledWith("/customer/dashboard/summary");
    expect(summary.stats.totalCartItems).toBe(4);
    expect(summary.stats.totalWishlistItems).toBe(6);
    expect(summary.recommendedDeals[0].discountPercentage).toBe(50);
  });

  // Test 19: RBAC & Guest Access Restrictions
  it("19. RBAC & Guest access - customer cannot access staff portals and guest cannot access customer dashboard", () => {
    const customerUser = { id: "c1", fullName: "User", email: "user@test.com", role: "CUSTOMER" as const };
    const adminUser = { id: "a1", fullName: "Admin", email: "admin@test.com", role: "SUPER_ADMIN" as const };

    // CUSTOMER role check
    expect(hasAllowedRole(customerUser, ["CUSTOMER"])).toBe(true);
    expect(hasAllowedRole(customerUser, ["SUPER_ADMIN", "PRODUCT_MANAGER"])).toBe(false);
    expect(isStaffRole("CUSTOMER")).toBe(false);

    // Staff roles
    expect(hasAllowedRole(adminUser, ["SUPER_ADMIN"])).toBe(true);
    expect(hasAllowedRole(adminUser, ["CUSTOMER"])).toBe(false);
    expect(isStaffRole("SUPER_ADMIN")).toBe(true);
    expect(isStaffRole("PRODUCT_MANAGER")).toBe(true);
    expect(isStaffRole("SOCIAL_MEDIA_MANAGER")).toBe(true);

    // Dashboard path resolution
    expect(getRoleDashboardPath("CUSTOMER")).toBe("/customer/dashboard");
    expect(getRoleDashboardPath("SUPER_ADMIN")).toBe("/admin/dashboard");
    expect(getRoleDashboardPath("PRODUCT_MANAGER")).toBe("/product-manager/dashboard");

    // Null/undefined (Guest)
    expect(hasAllowedRole(null, ["CUSTOMER"])).toBe(false);
  });
});
