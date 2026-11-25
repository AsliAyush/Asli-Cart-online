import { describe, it, expect, vi, beforeEach } from 'vitest';
import { CustomerRedirectService } from '../src/services/customerRedirect.service.js';
import { AffiliateClickRepository } from '../src/repositories/affiliateClick.repository.js';
import { AppError } from '../src/utils/appError.js';

describe('Affiliate Redirect Fallback & URL Integrity (Cases A - E)', () => {
  let redirectService: CustomerRedirectService;
  let mockClickRepo: AffiliateClickRepository;

  beforeEach(() => {
    mockClickRepo = {
      findByClickReference: vi.fn(),
      create: vi.fn(),
      findMany: vi.fn(),
      count: vi.fn(),
      getClickStats: vi.fn(),
    } as unknown as AffiliateClickRepository;

    redirectService = new CustomerRedirectService(mockClickRepo);
  });

  const createMockClick = (offerOverrides: Record<string, any> = {}) => ({
    id: 'clk_123',
    clickReference: 'ref_abc123',
    clickedAt: new Date(),
    product: { id: 'prod_1', name: 'Sony Headphones' },
    offer: {
      id: 'offer_1',
      status: 'PUBLISHED',
      originalUrl: 'https://merchant.com/product/sony-headphones',
      affiliateUrl: 'https://linksredirect.com/?cid=123&subid=prod_1',
      isAffiliated: true,
      conversionStatus: 'CONVERTED',
      endDate: null,
      merchant: { id: 'm_1', name: 'Croma', slug: 'croma' },
      affiliateLinks: [],
      ...offerOverrides,
    },
  });

  it('Case A: CONVERTED, isAffiliated=true, valid affiliateUrl uses affiliateUrl', async () => {
    const mockClick = createMockClick({
      isAffiliated: true,
      conversionStatus: 'CONVERTED',
      affiliateUrl: 'https://linksredirect.com/?cid=123&subid=prod_1',
    });
    vi.spyOn(mockClickRepo, 'findByClickReference').mockResolvedValue(mockClick as any);

    const result = await redirectService.resolveRedirect('ref_abc123');

    expect(result.destinationUrl).toBe('https://linksredirect.com/?cid=123&subid=prod_1');
    expect(result.merchantName).toBe('Croma');
    expect(result.productName).toBe('Sony Headphones');
  });

  it('Case B: FAILED reconversion, isAffiliated=true, previously preserved affiliateUrl continues to be used', async () => {
    const mockClick = createMockClick({
      isAffiliated: true,
      conversionStatus: 'FAILED',
      affiliateUrl: 'https://linksredirect.com/?cid=123&subid=prod_1&preserved=true',
    });
    vi.spyOn(mockClickRepo, 'findByClickReference').mockResolvedValue(mockClick as any);

    const result = await redirectService.resolveRedirect('ref_abc123');

    expect(result.destinationUrl).toBe('https://linksredirect.com/?cid=123&subid=prod_1&preserved=true');
  });

  it('Case C: NOT_AFFILIATED, isAffiliated=false strictly uses originalUrl', async () => {
    const mockClick = createMockClick({
      isAffiliated: false,
      conversionStatus: 'NOT_AFFILIATED',
      // Even if an old tracking URL was somehow in affiliateUrl, isAffiliated=false must strictly ignore it
      affiliateUrl: 'https://linksredirect.com/?cid=123&stale=true',
      originalUrl: 'https://merchant.com/product/sony-headphones',
    });
    vi.spyOn(mockClickRepo, 'findByClickReference').mockResolvedValue(mockClick as any);

    const result = await redirectService.resolveRedirect('ref_abc123');

    expect(result.destinationUrl).toBe('https://merchant.com/product/sony-headphones');
    expect(result.destinationUrl).not.toContain('linksredirect.com');
  });

  it('Case D1: Missing affiliateUrl (null/empty) falls back to originalUrl for eligible offer', async () => {
    const mockClick = createMockClick({
      isAffiliated: true,
      conversionStatus: 'PENDING',
      affiliateUrl: null,
      originalUrl: 'https://merchant.com/product/sony-headphones',
    });
    vi.spyOn(mockClickRepo, 'findByClickReference').mockResolvedValue(mockClick as any);

    const result = await redirectService.resolveRedirect('ref_abc123');

    expect(result.destinationUrl).toBe('https://merchant.com/product/sony-headphones');
  });

  it('Case D2: Malformed or non-http affiliateUrl falls back to originalUrl for eligible offer', async () => {
    const mockClick = createMockClick({
      isAffiliated: true,
      conversionStatus: 'CONVERTED',
      affiliateUrl: 'javascript:alert(1)', // Malicious / invalid URL scheme
      originalUrl: 'https://merchant.com/product/sony-headphones',
    });
    vi.spyOn(mockClickRepo, 'findByClickReference').mockResolvedValue(mockClick as any);

    const result = await redirectService.resolveRedirect('ref_abc123');

    expect(result.destinationUrl).toBe('https://merchant.com/product/sony-headphones');
  });

  it('Case E1: Unpublished offer (e.g. DRAFT) rejects redirect with 400 Bad Request', async () => {
    const mockClick = createMockClick({
      status: 'DRAFT',
    });
    vi.spyOn(mockClickRepo, 'findByClickReference').mockResolvedValue(mockClick as any);

    await expect(redirectService.resolveRedirect('ref_abc123')).rejects.toThrow(
      'Offer is not active or published'
    );
  });

  it('Case E2: Expired offer rejects redirect with 400 Bad Request', async () => {
    const mockClick = createMockClick({
      status: 'PUBLISHED',
      endDate: new Date(Date.now() - 3600000), // 1 hour ago
    });
    vi.spyOn(mockClickRepo, 'findByClickReference').mockResolvedValue(mockClick as any);

    await expect(redirectService.resolveRedirect('ref_abc123')).rejects.toThrow(
      'Offer has expired'
    );
  });
});
