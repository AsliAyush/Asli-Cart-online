export interface ProductManagerSummary {
  products: {
    total: number;
    active: number;
    draft: number;
    pendingApproval: number;
    assignedToSmm: number;
  };
  offers: {
    total: number;
    active: number;
    expired: number;
    pendingApproval: number;
  };
}

export interface RecentProductItem {
  id: string;
  name: string;
  slug: string;
  brand?: string | null;
  status: string;
  mainImage: string;
  createdAt: string;
  category?: {
    id: string;
    name: string;
    slug: string;
  };
  _count?: {
    offers: number;
  };
}

export interface RecentOfferItem {
  id: string;
  title: string;
  originalPrice: number | string;
  sellingPrice: number | string;
  discountPercentage: number | string;
  currency: string;
  status: string;
  rejectionReason?: string | null;
  createdAt: string;
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
}

export interface RecentActivityData {
  recentProducts: RecentProductItem[];
  recentOffers: RecentOfferItem[];
}

export interface PendingReviewsData {
  pendingProducts: RecentProductItem[];
  pendingOffers: RecentOfferItem[];
  totalPending: number;
}

