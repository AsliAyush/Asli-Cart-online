/**
 * Asli Cart Super Admin Product Oversight Types
 */

export interface ProductCategorySummary {
  id: string;
  name: string;
  slug: string;
  description?: string | null;
  _count?: {
    products: number;
  };
}

export interface ProductCreatorSummary {
  id: string;
  fullName: string;
  email: string;
}

export interface AdminProductListItem {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  brand: string | null;
  categoryId: string;
  mainImage: string;
  additionalImages: string[];
  specifications: Record<string, any> | null;
  status: "DRAFT" | "PENDING_APPROVAL" | "APPROVED" | "REJECTED" | "ARCHIVED";
  isAssignedToSmm: boolean;
  createdById: string;
  createdAt: string;
  updatedAt: string;
  category: ProductCategorySummary;
  createdBy: ProductCreatorSummary;
  _count: {
    offers: number;
  };
}

export interface ProductMerchantOffer {
  id: string;
  title: string;
  originalPrice: number | string;
  sellingPrice: number | string;
  discountPercentage: number | string;
  currency: string;
  status: string;
  merchant: {
    id: string;
    name: string;
    slug: string;
    logoUrl: string | null;
  };
}

export interface ProductPriceHistory {
  id: string;
  price: number | string;
  originalPrice: number | string;
  discountPercentage: number | string;
  recordedAt: string;
  source: string;
}

export interface AdminProductDetail extends AdminProductListItem {
  offers: ProductMerchantOffer[];
  priceHistories: ProductPriceHistory[];
}

export interface ListProductsParams {
  page?: number;
  limit?: number;
  categoryId?: string;
  status?: string;
  brand?: string;
  search?: string;
}

