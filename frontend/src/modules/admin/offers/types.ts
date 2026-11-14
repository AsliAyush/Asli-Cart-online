/**
 * Asli Cart Super Admin Offer Management Types
 */

export type OfferStatus =
  | "DRAFT"
  | "PENDING_APPROVAL"
  | "APPROVED"
  | "PUBLISHED"
  | "REJECTED"
  | "PAUSED"
  | "EXPIRED";

export interface OfferProductSummary {
  id: string;
  name: string;
  slug: string;
  mainImage: string;
}

export interface OfferMerchantSummary {
  id: string;
  name: string;
  slug: string;
  logoUrl: string | null;
}

export interface OfferCreatorSummary {
  id: string;
  fullName: string;
  email: string;
}

export interface OfferAffiliateLink {
  id: string;
  originalUrl: string;
  affiliateUrl: string;
  provider: string;
  status: "ACTIVE" | "PENDING" | "FAILED";
  createdAt: string;
}

export interface OfferPriceHistory {
  id: string;
  price: number | string;
  originalPrice: number | string;
  discountPercentage: number | string;
  recordedAt: string;
  source: string;
}

export interface AdminOfferListItem {
  id: string;
  productId: string;
  merchantId: string;
  title: string;
  originalPrice: number | string;
  sellingPrice: number | string;
  discountPercentage: number | string;
  currency: string;
  couponCode: string | null;
  originalUrl: string;
  affiliateUrl: string | null;
  availability: "IN_STOCK" | "OUT_OF_STOCK" | "PRE_ORDER";
  status: OfferStatus;
  priceVerifiedAt: string;
  priceSource: string;
  rejectionReason: string | null;
  startDate: string | null;
  endDate: string | null;
  createdById: string;
  createdAt: string;
  updatedAt: string;
  product: OfferProductSummary;
  merchant: OfferMerchantSummary;
  createdBy: OfferCreatorSummary;
}

export interface AdminOfferDetail extends AdminOfferListItem {
  priceHistories?: OfferPriceHistory[];
  affiliateLinks?: OfferAffiliateLink[];
}

export interface ListOffersParams {
  page?: number;
  limit?: number;
  productId?: string;
  merchantId?: string;
  status?: string;
  search?: string;
}

