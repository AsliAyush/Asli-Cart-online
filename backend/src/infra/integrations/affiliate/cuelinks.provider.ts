import { IAffiliateLinkProvider, ConvertedAffiliateLink } from './affiliate.interface.js';

export class CuelinksAffiliateProvider implements IAffiliateLinkProvider {
  readonly name = 'CUELINKS';
  private publisherId: string;

  constructor(publisherId: string = process.env.CUELINKS_PUB_ID || '112233') {
    this.publisherId = publisherId;
  }

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

    // Cuelinks standard redirect format:
    // https://linksredirect.com/?cid=<publisher_id>&subid=<subId1>&subid2=<subId2>&url=<encoded_url>
    const redirectUrl = new URL('https://linksredirect.com/');
    redirectUrl.searchParams.set('cid', this.publisherId);
    if (options?.subId1) {
      redirectUrl.searchParams.set('subid', options.subId1);
    }
    if (options?.subId2) {
      redirectUrl.searchParams.set('subid2', options.subId2);
    }
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

