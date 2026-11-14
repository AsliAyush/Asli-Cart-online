export interface DiscoveredProductItem {
  externalId: string;
  merchantSlug: string;
  merchantName: string;
  title: string;
  brand?: string;
  category?: string;
  originalPrice: number;
  sellingPrice: number;
  discountPercentage: number;
  currency: string;
  imageUrl?: string;
  productUrl: string;
  specifications?: Record<string, any>;
  imported?: boolean;
  isDemo?: boolean;
}

export interface SearchDiscoveryParams {
  keyword?: string;
  category?: string;
  merchant?: string;
  limit?: number;
}

export interface ImportProductResponse {
  product: {
    id: string;
    name: string;
    slug: string;
    status: string;
    brand?: string | null;
  };
  offer: {
    id: string;
    title: string;
    sellingPrice: number;
    status: string;
  };
  message: string;
}

