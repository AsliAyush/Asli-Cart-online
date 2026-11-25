import { affiliateClickRepository, AffiliateClickRepository } from '../repositories/affiliateClick.repository.js';
import { AppError } from '../utils/appError.js';

export class CustomerRedirectService {
  constructor(
    private clickRepo: AffiliateClickRepository = affiliateClickRepository
  ) { }

  async resolveRedirect(clickReference: string) {
    if (!clickReference) {
      throw AppError.badRequest('Click reference is required');
    }

    const click = await this.clickRepo.findByClickReference(clickReference);
    if (!click) {
      throw AppError.notFound('Invalid or expired redirect reference');
    }

    const offer = click.offer;
    if (!offer) {
      throw AppError.notFound('Associated offer not found');
    }

    // Only allow redirection for published and active offers
    if (offer.status !== 'PUBLISHED') {
      throw AppError.badRequest('Offer is not active or published');
    }

    if (offer.endDate && new Date(offer.endDate) < new Date()) {
      throw AppError.badRequest('Offer has expired');
    }

    const affiliateLink = offer.affiliateLinks && offer.affiliateLinks.length > 0
      ? offer.affiliateLinks[0]
      : null;

    const isValidHttpUrl = (url?: string | null): boolean => {
      if (!url || typeof url !== 'string' || !url.trim()) return false;
      try {
        const parsed = new URL(url.trim());
        return ['http:', 'https:'].includes(parsed.protocol);
      } catch {
        return false;
      }
    };

    // Resolve trusted destination URL exclusively from database
    // Genuinely unaffiliated offers (isAffiliated === false) must strictly use originalUrl, never a Cuelinks tracking URL.
    // Converted or preserved affiliated offers (isAffiliated === true) use the stored affiliateUrl if valid.
    // Missing or invalid affiliateUrls fall back gracefully to originalUrl.
    let destinationUrl: string | null = null;
    if (offer.isAffiliated === false) {
      destinationUrl = offer.originalUrl;
    } else if (isValidHttpUrl(offer.affiliateUrl)) {
      destinationUrl = offer.affiliateUrl;
    } else if (affiliateLink && isValidHttpUrl(affiliateLink.affiliateUrl)) {
      destinationUrl = affiliateLink.affiliateUrl;
    } else if (offer.originalUrl) {
      destinationUrl = offer.originalUrl;
    }

    if (!destinationUrl) {
      throw AppError.notFound('Merchant redirect URL not configured for this offer');
    }

    return {
      destinationUrl,
      merchantName: offer.merchant.name,
      productName: click.product.name,
      clickedAt: click.clickedAt,
    };
  }
}

export const customerRedirectService = new CustomerRedirectService();

