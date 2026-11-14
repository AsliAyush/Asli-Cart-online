export interface PriceCalculationResult {
  originalPrice: number;
  sellingPrice: number;
  discountPercentage: number;
  savings: number;
}

export interface PriceHistoryItem {
  id: string;
  productId: string;
  offerId?: string | null;
  price: number | string;
  originalPrice?: number | string | null;
  discountPercentage?: number | string | null;
  currency: string;
  source?: string | null;
  recordedAt: string;
}

export interface OfferPricingItem {
  id: string;
  title: string;
  originalPrice: number | string;
  sellingPrice: number | string;
  discountPercentage: number | string;
  currency: string;
  status: string;
  availability: string;
  priceVerifiedAt: string;
  priceSource: string;
  originalUrl: string;
  product?: {
    id: string;
    name: string;
    slug: string;
  };
  merchant?: {
    id: string;
    name: string;
    slug: string;
  };
}

