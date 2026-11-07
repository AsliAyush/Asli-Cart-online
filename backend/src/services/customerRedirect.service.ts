import { affiliateClickRepository, AffiliateClickRepository } from '../repositories/affiliateClick.repository.js';
import { AppError } from '../utils/appError.js';

export class CustomerRedirectService {
  constructor(
    private clickRepo: AffiliateClickRepository = affiliateClickRepository
  ) {}

  async resolveRedirect(clickReference: string) {
    if (!clickReference) {
      throw AppError.badRequest('Click reference is required');
    }

    const click = await this.clickRepo.findByClickReference(clickReference);
    if (!click) {
      throw AppError.notFound('Invalid or expired redirect reference');
    }

    const offer = click.offer;
    const affiliateLink = offer.affiliateLinks && offer.affiliateLinks.length > 0
      ? offer.affiliateLinks[0]
      : null;

    // Resolve trusted destination URL exclusively from database
    const destinationUrl = affiliateLink
      ? affiliateLink.affiliateUrl
      : (offer.affiliateUrl || offer.originalUrl);

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

