import type { BackendPagination } from "@/types/api";

export interface PMOfferListItem {
  id: string;
  productId: string;
  merchantId: string;
  title: string;
  originalPrice: number | string;
  sellingPrice: number | string;
  discountPercentage: number | string;
  currency: string;
  couponCode?: string | null;
  originalUrl: string;
  affiliateUrl?: string | null;
  affiliateProvider?: string | null;
  conversionStatus?: 'PENDING' | 'CONVERTED' | 'NOT_AFFILIATED' | 'FAILED' | string;
  isAffiliated?: boolean;
  lastConvertedAt?: string | null;
  conversionError?: string | null;
  availability: "IN_STOCK" | "OUT_OF_STOCK" | "PRE_ORDER" | string;
  status:
    | "DRAFT"
    | "PENDING_APPROVAL"
    | "APPROVED"
    | "PUBLISHED"
    | "REJECTED"
    | "PAUSED"
    | "EXPIRED"
    | string;
  priceVerifiedAt: string;
  priceSource: string;
  rejectionReason?: string | null;
  startDate?: string | null;
  endDate?: string | null;
  createdById: string;
  createdAt: string;
  updatedAt: string;
  product?: {
    id: string;
    name: string;
    slug: string;
    mainImage?: string;
  };
  merchant?: {
    id: string;
    name: string;
    slug: string;
    logoUrl?: string | null;
  };
  createdBy?: {
    id: string;
    fullName: string;
    email: string;
  };
}

export interface PMOfferDetail extends PMOfferListItem {
  product: {
    id: string;
    name: string;
    slug: string;
    mainImage: string;
    brand?: string | null;
    status: string;
  };
  merchant: {
    id: string;
    name: string;
    slug: string;
    logoUrl?: string | null;
  };
  priceHistories: Array<{
    id: string;
    price: number | string;
    originalPrice?: number | string | null;
    discountPercentage?: number | string | null;
    recordedAt: string;
    source?: string | null;
  }>;
  affiliateLinks: Array<{
    id: string;
    affiliateUrl: string;
    originalUrl: string;
    provider: string;
    status: string;
    createdAt: string;
  }>;
}

export interface ListPMOffersParams {
  page?: number;
  limit?: number;
  productId?: string;
  merchantId?: string;
  status?: string;
  search?: string;
}

export interface CreateOfferInput {
  productId: string;
  merchantId: string;
  title: string;
  originalPrice: number;
  sellingPrice: number;
  currency?: string;
  couponCode?: string;
  originalUrl: string;
  availability?: "IN_STOCK" | "OUT_OF_STOCK" | "PRE_ORDER";
  startDate?: string;
  endDate?: string;
  priceSource?: string;
}

export interface UpdateOfferInput {
  title?: string;
  originalPrice?: number;
  sellingPrice?: number;
  currency?: string;
  couponCode?: string;
  originalUrl?: string;
  availability?: "IN_STOCK" | "OUT_OF_STOCK" | "PRE_ORDER";
  startDate?: string;
  endDate?: string;
}

