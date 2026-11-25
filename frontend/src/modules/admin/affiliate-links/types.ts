export type ConversionStatus = 'PENDING' | 'CONVERTED' | 'NOT_AFFILIATED' | 'FAILED';

export interface AffiliateOfferItem {
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
  conversionStatus: ConversionStatus;
  isAffiliated: boolean;
  lastConvertedAt?: string | null;
  conversionError?: string | null;
  availability: string;
  status: string;
  priceVerifiedAt: string;
  priceSource: string;
  createdAt: string;
  updatedAt: string;
  product?: {
    id: string;
    name: string;
    sku?: string | null;
    brand?: string | null;
    mainImage?: string | null;
  } | null;
  merchant?: {
    id: string;
    name: string;
    domain?: string | null;
    logoUrl?: string | null;
  } | null;
  affiliateLinks?: Array<{
    id: string;
    provider: string;
    affiliateUrl: string;
    shortUrl?: string | null;
    campaignId?: number | null;
    lastVerifiedAt?: string | null;
  }>;
}

export interface AffiliateLinksFilterParams {
  page?: number;
  limit?: number;
  conversionStatus?: string;
  isAffiliated?: boolean | string;
  search?: string;
  merchantId?: string;
}

export interface RetryConversionResponse {
  offerId: string;
  conversionStatus: ConversionStatus;
  isAffiliated: boolean;
  affiliateUrl?: string | null;
  conversionError?: string | null;
  message: string;
}
