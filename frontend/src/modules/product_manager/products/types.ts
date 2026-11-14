import type { BackendPagination } from "@/types/api";

export interface PMProductListItem {
  id: string;
  name: string;
  slug: string;
  description?: string | null;
  brand?: string | null;
  categoryId: string;
  mainImage: string;
  additionalImages?: string[];
  specifications?: Record<string, any> | null;
  status: "DRAFT" | "PENDING_APPROVAL" | "APPROVED" | "REJECTED" | "ARCHIVED" | string;
  isAssignedToSmm: boolean;
  createdById: string;
  createdAt: string;
  updatedAt: string;
  category?: {
    id: string;
    name: string;
    slug: string;
  };
  createdBy?: {
    id: string;
    fullName: string;
    email: string;
  };
  _count?: {
    offers: number;
  };
}

export interface PMProductDetail extends PMProductListItem {
  category: {
    id: string;
    name: string;
    slug: string;
    description?: string | null;
  };
  offers: Array<{
    id: string;
    title: string;
    originalPrice: number | string;
    sellingPrice: number | string;
    discountPercentage: number | string;
    currency: string;
    status: string;
    availability: string;
    originalUrl: string;
    affiliateUrl?: string | null;
    priceVerifiedAt: string;
    merchant: {
      id: string;
      name: string;
      slug: string;
      logoUrl?: string | null;
    };
  }>;
  priceHistories: Array<{
    id: string;
    price: number | string;
    originalPrice?: number | string | null;
    discountPercentage?: number | string | null;
    recordedAt: string;
    source?: string | null;
  }>;
}

export interface ListPMProductsParams {
  page?: number;
  limit?: number;
  categoryId?: string;
  status?: string;
  brand?: string;
  search?: string;
  isAssignedToSmm?: boolean;
}

export interface CreateProductInput {
  name: string;
  slug?: string;
  description?: string;
  brand?: string;
  categoryId: string;
  mainImage: string;
  additionalImages?: string[];
  specifications?: Record<string, any>;
}

export interface UpdateProductInput {
  name?: string;
  description?: string;
  brand?: string;
  categoryId?: string;
  mainImage?: string;
  additionalImages?: string[];
  specifications?: Record<string, any>;
  isAssignedToSmm?: boolean;
}

export interface ProductCategorySummary {
  id: string;
  name: string;
  slug: string;
}

