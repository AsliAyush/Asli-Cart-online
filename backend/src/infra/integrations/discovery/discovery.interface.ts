export interface DiscoveredItem {
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
}

export interface IProductDiscoveryProvider {
  readonly name: string;
  searchDiscovered(params: {
    keyword?: string;
    category?: string;
    merchant?: string;
    limit?: number;
  }): Promise<DiscoveredItem[]>;
  getDiscoveredById(externalId: string): Promise<DiscoveredItem | null>;
}

