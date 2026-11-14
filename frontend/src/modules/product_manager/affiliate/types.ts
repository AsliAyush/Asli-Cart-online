export interface AffiliateLinkItem {
  id: string;
  offerId?: string | null;
  originalUrl: string;
  affiliateUrl: string;
  provider: string;
  subId1?: string | null;
  subId2?: string | null;
  status: string;
  createdById: string;
  createdAt: string;
}

export interface ConvertAffiliateInput {
  originalUrl: string;
  offerId?: string;
  subId1?: string;
  subId2?: string;
}

export interface ListAffiliateLinksParams {
  page?: number;
  limit?: number;
  offerId?: string;
  provider?: string;
  status?: string;
}

