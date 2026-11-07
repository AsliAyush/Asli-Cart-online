export interface ConvertedAffiliateLink {
  originalUrl: string;
  affiliateUrl: string;
  provider: string;
  subId1?: string;
  subId2?: string;
  status: 'ACTIVE' | 'FAILED' | 'PENDING';
}

export interface IAffiliateLinkProvider {
  readonly name: string;
  convertUrl(originalUrl: string, options?: { subId1?: string; subId2?: string }): Promise<ConvertedAffiliateLink>;
  isValidMerchantUrl(url: string): boolean;
}

