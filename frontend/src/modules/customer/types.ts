/**
 * Customer Module Domain Types
 *
 * Types for public catalog browsing, multi-merchant offer comparisons,
 * shopping cart, wishlist, customer dashboard, profile, and affiliate redirects.
 */

export interface CustomerProductItem {
  id: string;
  name: string;
  slug: string;
  brand: string | null;
  mainImage: string | null;
  category: {
    id: string;
    name: string;
    slug: string;
  } | null;
  bestPrice: number | null;
  originalPrice: number | null;
  discountPercentage: number;
  merchantName: string | null;
  merchantLogo: string | null;
  totalOffers: number;
  createdAt: string;
}

export interface CustomerProductOffer {
  id: string;
  merchant: {
    id: string;
    name: string;
    slug: string;
    logoUrl: string | null;
    websiteUrl: string;
  };
  title: string;
  originalPrice: number;
  sellingPrice: number;
  discountPercentage: number;
  currency: string;
  couponCode: string | null;
  availability: "IN_STOCK" | "OUT_OF_STOCK" | string;
  priceVerifiedAt: string | null;
  endDate: string | null;
}

export interface CustomerProductDetails {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  brand: string | null;
  mainImage: string | null;
  additionalImages: string[];
  specifications: Record<string, any> | null;
  category: {
    id: string;
    name: string;
    slug: string;
  } | null;
  bestPrice: number | null;
  maxDiscount: number;
  offers: CustomerProductOffer[];
  createdAt: string;
}

export interface CustomerCategoryItem {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  _count: {
    products: number;
  };
}

export interface ListCustomerProductsParams {
  page?: number;
  limit?: number;
  search?: string;
  brand?: string;
  category?: string;
  merchant?: string;
  minPrice?: number;
  maxPrice?: number;
  minDiscount?: number;
  sort?: "newest" | "price_asc" | "price_desc" | "discount_desc";
}

export interface CompareOffersResponse {
  product: {
    id: string;
    name: string;
    slug: string;
    brand: string | null;
    mainImage: string | null;
  };
  totalOffers: number;
  offers: Array<{
    id: string;
    merchant: {
      id: string;
      name: string;
      slug: string;
      logoUrl: string | null;
      websiteUrl: string;
    };
    title: string;
    originalPrice: number;
    sellingPrice: number;
    savings: number;
    discountPercentage: number;
    currency: string;
    couponCode: string | null;
    availability: string;
    priceVerifiedAt: string | null;
    endDate: string | null;
  }>;
}

export interface CustomerOfferDetails {
  id: string;
  title: string;
  product: {
    id: string;
    name: string;
    slug: string;
    mainImage: string | null;
    brand: string | null;
    status: string;
  };
  merchant: {
    id: string;
    name: string;
    slug: string;
    logoUrl: string | null;
    websiteUrl: string;
  };
  originalPrice: number;
  sellingPrice: number;
  savings: number;
  discountPercentage: number;
  currency: string;
  couponCode: string | null;
  availability: string;
  priceVerifiedAt: string | null;
  startDate: string | null;
  endDate: string | null;
}

export interface CustomerCartItem {
  itemId: string;
  quantity: number;
  offerId: string;
  title: string;
  product: {
    id: string;
    name: string;
    slug: string;
    mainImage: string | null;
  };
  merchant: {
    id: string;
    name: string;
    slug: string;
    logoUrl: string | null;
  };
  snapshotPrice: number;
  currentSellingPrice: number;
  originalPrice: number;
  discountPercentage: number;
  currency: string;
  couponCode: string | null;
  isEligible: boolean;
  isExpired: boolean;
  hasPriceChanged: boolean;
  priceDifference: number;
  itemSubtotal: number;
  createdAt: string;
}

export interface CartMerchantGroup {
  merchant: {
    id: string;
    name: string;
    slug: string;
    logoUrl: string | null;
    websiteUrl?: string;
  };
  items: CustomerCartItem[];
  groupSubtotal: number;
}

export interface CustomerCartResponse {
  cartId: string;
  itemsCount: number;
  subtotal: number;
  currency: string;
  merchantGroups: CartMerchantGroup[];
  items: CustomerCartItem[];
}

export interface MerchantRedirectResponse {
  clickReference: string;
  redirectPath: string;
  merchant: {
    id: string;
    name: string;
    slug: string;
    websiteUrl: string;
  };
  product: {
    id: string;
    name: string;
  };
  offer: {
    id: string;
    title: string;
    sellingPrice: number;
  };
  destinationUrl: string;
}

export interface CustomerWishlistItem {
  itemId: string;
  productId: string;
  name: string;
  slug: string;
  brand: string | null;
  mainImage: string | null;
  category: {
    id: string;
    name: string;
    slug: string;
  } | null;
  isAvailable: boolean;
  bestPrice: number | null;
  originalPrice: number | null;
  discountPercentage: number;
  merchantName: string | null;
  totalOffers: number;
  savedAt: string;
}

export interface CustomerWishlistResponse {
  wishlistId: string;
  itemsCount: number;
  items: CustomerWishlistItem[];
}

export interface CustomerDashboardSummary {
  stats: {
    totalCartItems: number;
    totalWishlistItems: number;
  };
  recentCartItems: Array<{
    itemId: string;
    quantity: number;
    title: string;
    productName: string;
    mainImage: string | null;
    merchantName: string;
    sellingPrice: number;
    addedAt: string;
  }>;
  recommendedDeals: Array<{
    offerId: string;
    title: string;
    productName: string;
    brand: string | null;
    mainImage: string | null;
    merchantName: string;
    originalPrice: number;
    sellingPrice: number;
    discountPercentage: number;
  }>;
}

export interface CustomerProfile {
  id: string;
  fullName: string;
  email: string;
  phone: string | null;
  avatarUrl: string | null;
  role: string;
  isActive: boolean;
  emailVerified: boolean;
  createdAt: string;
  updatedAt: string;
}

