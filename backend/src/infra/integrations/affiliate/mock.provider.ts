import { IAffiliateLinkProvider, ConvertedAffiliateLink } from './affiliate.interface.js';

export class MockAffiliateProvider implements IAffiliateLinkProvider {
  readonly name = 'MOCK_CUELINKS';

  isValidMerchantUrl(url: string): boolean {
    try {
      const parsed = new URL(url);
      return ['http:', 'https:'].includes(parsed.protocol);
    } catch {
      return false;
    }
  }

  async convertUrl(
    originalUrl: string,
    options?: { subId1?: string; subId2?: string }
  ): Promise<ConvertedAffiliateLink> {
    if (!this.isValidMerchantUrl(originalUrl)) {
      return {
        originalUrl,
        affiliateUrl: originalUrl,
        provider: this.name,
        status: 'FAILED',
      };
    }

    const redirectUrl = new URL('https://linksredirect.com/');
    redirectUrl.searchParams.set('cid', 'mock_affiliate_id');
    if (options?.subId1) redirectUrl.searchParams.set('subid', options.subId1);
    if (options?.subId2) redirectUrl.searchParams.set('subid2', options.subId2);
    redirectUrl.searchParams.set('url', originalUrl);

    return {
      originalUrl,
      affiliateUrl: redirectUrl.toString(),
      provider: this.name,
      subId1: options?.subId1,
      subId2: options?.subId2,
      status: 'ACTIVE',
    };
  }
}

