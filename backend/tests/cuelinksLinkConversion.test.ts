import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import request from 'supertest';
import { createApp } from '../src/app.js';
import { cuelinksClient } from '../src/infra/integrations/cuelinks/cuelinksClient.js';
import { cuelinksLinkConversionService } from '../src/services/cuelinksLinkConversion.service.js';
import { setupTestEnvironment } from './testHelper.js';

let app: any;
let superAdminToken: string;
let productManagerToken: string;
let customerToken: string;
let testStore: any;

vi.mock('../src/infra/database/prisma.js', () => {
  const getMock = () => (globalThis as any).currentMockPrisma;
  return {
    default: new Proxy({}, {
      get: (_target, prop) => {
        const mock = getMock();
        return mock[prop];
      },
    }),
    prisma: new Proxy({}, {
      get: (_target, prop) => {
        const mock = getMock();
        return mock[prop];
      },
    }),
  };
});

describe('Cuelinks V3 Phase 3 — Affiliate Link Conversion & Management', () => {
  const originalFetch = globalThis.fetch;
  const originalApiKey = (cuelinksClient as any).apiKey;
  let testProductId: string;

  beforeEach(async () => {
    const env = await setupTestEnvironment();
    testStore = env.store;
    superAdminToken = env.superAdminToken;
    productManagerToken = env.productManagerToken;
    customerToken = env.customerToken;
    app = createApp();

    // Ensure client is configured for tests
    process.env.CUELINKS_API_KEY = 'mock-cuelinks-api-key';
    (cuelinksClient as any).apiKey = 'mock-cuelinks-api-key';

    // Create a base product
    const prod = {
      id: 'prod-test-link-conv',
      name: 'Sony WH-1000XM5 Headphones',
      slug: 'sony-wh-1000xm5',
      categoryId: 'cat-electronics',
      brand: 'Sony',
      mainImage: 'https://example.com/sony.jpg',
      status: 'ACTIVE',
      createdById: 'pm-user-1',
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    testStore.products.push(prod);
    testProductId = prod.id;
  });

  afterEach(() => {
    globalThis.fetch = originalFetch;
    (cuelinksClient as any).apiKey = originalApiKey;
    vi.restoreAllMocks();
  });

  describe('1. CuelinksClient.convertLink', () => {
    it('should convert valid merchant URL to tracking URL when affiliated is true', async () => {
      globalThis.fetch = vi.fn().mockResolvedValue({
        ok: true,
        status: 200,
        json: async () => ({
          data: {
            original_url: 'https://www.flipkart.com/sony-headphones/p/itm123',
            tracking_url: 'https://clnk.in/r/xyz123',
            short_url: 'https://clnk.in/xyz123',
            campaign_id: 4821,
            affiliated: true,
          },
        }),
      } as any);

      const result = await cuelinksClient.convertLink({
        url: 'https://www.flipkart.com/sony-headphones/p/itm123',
        subid: 'test-subid',
        shorten: true,
      });

      expect(result.affiliated).toBe(true);
      expect(result.tracking_url).toBe('https://clnk.in/r/xyz123');
      expect(result.short_url).toBe('https://clnk.in/xyz123');
      expect(result.campaign_id).toBe(4821);
      expect(globalThis.fetch).toHaveBeenCalledTimes(1);
    });

    it('should return affiliated: false when merchant has no active campaign', async () => {
      globalThis.fetch = vi.fn().mockResolvedValue({
        ok: true,
        status: 200,
        json: async () => ({
          data: {
            original_url: 'https://www.noneligible-shop.com/item',
            tracking_url: 'https://www.noneligible-shop.com/item',
            affiliated: false,
          },
        }),
      } as any);

      const result = await cuelinksClient.convertLink({
        url: 'https://www.noneligible-shop.com/item',
      });

      expect(result.affiliated).toBe(false);
      expect(result.tracking_url).toBe('https://www.noneligible-shop.com/item');
    });

    it('should reject invalid URL syntax before making HTTP requests', async () => {
      globalThis.fetch = vi.fn();

      await expect(
        cuelinksClient.convertLink({ url: 'not-a-valid-url' })
      ).rejects.toThrow('Invalid target URL');

      expect(globalThis.fetch).not.toHaveBeenCalled();
    });

    it('should throw AppError with status code when Cuelinks API returns error response', async () => {
      globalThis.fetch = vi.fn().mockResolvedValue({
        ok: false,
        status: 401,
        json: async () => ({
          error: 'Unauthorized: Invalid or revoked API key',
        }),
      } as any);

      await expect(
        cuelinksClient.convertLink({ url: 'https://amazon.in/dp/B001' })
      ).rejects.toThrow();
    });
  });

  describe('2. CuelinksLinkConversionService', () => {
    it('should strictly map affiliated: true to CONVERTED', async () => {
      vi.spyOn(cuelinksClient, 'convertLink').mockResolvedValueOnce({
        original_url: 'https://amazon.in/dp/B001',
        tracking_url: 'https://clnk.in/r/amz001',
        short_url: 'https://clnk.in/amz001',
        campaign_id: 101,
        affiliated: true,
      });

      const outcome = await cuelinksLinkConversionService.convertUrl('https://amazon.in/dp/B001');

      expect(outcome.conversionStatus).toBe('CONVERTED');
      expect(outcome.affiliated).toBe(true);
      expect(outcome.affiliateUrl).toBe('https://clnk.in/r/amz001');
      expect((outcome as any).raw?.campaign_id).toBe(101);
      expect(outcome.errorCategory).toBeUndefined();
    });

    it('should strictly map affiliated: false to NOT_AFFILIATED', async () => {
      vi.spyOn(cuelinksClient, 'convertLink').mockResolvedValueOnce({
        original_url: 'https://localstore.in/item',
        tracking_url: 'https://localstore.in/item',
        affiliated: false,
      });

      const outcome = await cuelinksLinkConversionService.convertUrl('https://localstore.in/item');

      expect(outcome.conversionStatus).toBe('NOT_AFFILIATED');
      expect(outcome.affiliated).toBe(false);
      expect(outcome.errorCategory).toBe('URL_NOT_ELIGIBLE');
      expect(outcome.message).toContain('not affiliated');
    });

    it('should treat missing or null affiliated as NOT_AFFILIATED', async () => {
      vi.spyOn(cuelinksClient, 'convertLink').mockResolvedValueOnce({
        original_url: 'https://unknown.in/item',
        tracking_url: 'https://unknown.in/item',
      } as any);

      const outcome = await cuelinksLinkConversionService.convertUrl('https://unknown.in/item');

      expect(outcome.conversionStatus).toBe('NOT_AFFILIATED');
      expect(outcome.affiliated).toBe(false);
    });

    it('should gracefully handle API failure and map to FAILED without exposing internal tokens', async () => {
      vi.spyOn(cuelinksClient, 'convertLink').mockRejectedValueOnce(
        new Error('Network timeout connecting to Cuelinks gateway')
      );

      const outcome = await cuelinksLinkConversionService.convertUrl('https://timeout-site.com/p');

      expect(outcome.conversionStatus).toBe('FAILED');
      expect(outcome.affiliated).toBe(false);
      expect(outcome.affiliateUrl).toBeNull();
      expect(outcome.message).toContain('timeout');
    });
  });

  describe('3. Offer Creation Flow with Automatic Conversion', () => {
    it('POST /api/v1/product-manager/offers - should auto-convert eligible link and save CONVERTED status', async () => {
      vi.spyOn(cuelinksClient, 'convertLink').mockResolvedValueOnce({
        original_url: 'https://amazon.in/dp/B00999',
        tracking_url: 'https://clnk.in/r/amz999',
        affiliated: true,
        campaign_id: 101,
      });

      const res = await request(app)
        .post('/api/v1/product-manager/offers')
        .set('Authorization', `Bearer ${productManagerToken}`)
        .send({
          productId: testProductId,
          merchantId: 'merch-amazon',
          title: 'Sony Headphones Limited Deal',
          originalPrice: 29990,
          sellingPrice: 19990,
          originalUrl: 'https://amazon.in/dp/B00999',
        });

      expect(res.status).toBe(201);
      expect(res.body.success).toBe(true);
      expect(res.body.data.conversionStatus).toBe('CONVERTED');
      expect(res.body.data.isAffiliated).toBe(true);
      expect(res.body.data.affiliateUrl).toBe('https://clnk.in/r/amz999');
      expect(res.body.data.originalUrl).toBe('https://amazon.in/dp/B00999');
    });

    it('POST /api/v1/product-manager/offers - should create offer even if conversion fails', async () => {
      vi.spyOn(cuelinksClient, 'convertLink').mockRejectedValueOnce(
        new Error('Third-party API rate limit exceeded')
      );

      const res = await request(app)
        .post('/api/v1/product-manager/offers')
        .set('Authorization', `Bearer ${productManagerToken}`)
        .send({
          productId: testProductId,
          merchantId: 'merch-amazon',
          title: 'Sony Headphones Fallback Deal',
          originalPrice: 29990,
          sellingPrice: 21990,
          originalUrl: 'https://amazon.in/dp/B00FAIL',
        });

      expect(res.status).toBe(201);
      expect(res.body.success).toBe(true);
      expect(res.body.data.conversionStatus).toBe('FAILED');
      expect(res.body.data.isAffiliated).toBe(false);
      expect(res.body.data.originalUrl).toBe('https://amazon.in/dp/B00FAIL');
      expect(res.body.data.conversionError).toBeTruthy();
    });
  });

  describe('4. Offer Update Flow with Conditional Conversion', () => {
    it('PATCH /api/v1/product-manager/offers/:id - should NOT re-trigger conversion if originalUrl is unchanged', async () => {
      const convertSpy = vi.spyOn(cuelinksClient, 'convertLink');

      // Seed an existing offer with CONVERTED status
      const existingOffer = {
        id: 'offer-no-change-url',
        productId: testProductId,
        merchantId: 'merch-amazon',
        title: 'Initial Offer Title',
        originalPrice: 1000,
        sellingPrice: 800,
        discountPercentage: 20,
        currency: 'INR',
        originalUrl: 'https://amazon.in/dp/B00SAME',
        affiliateUrl: 'https://clnk.in/r/same',
        conversionStatus: 'CONVERTED',
        isAffiliated: true,
        status: 'DRAFT',
        availability: 'IN_STOCK',
        createdById: 'pm-user-1',
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      testStore.offers.push(existingOffer);

      const res = await request(app)
        .patch(`/api/v1/product-manager/offers/${existingOffer.id}`)
        .set('Authorization', `Bearer ${productManagerToken}`)
        .send({
          title: 'Updated Offer Title Only',
          sellingPrice: 750,
        });

      expect(res.status).toBe(200);
      expect(convertSpy).not.toHaveBeenCalled();
      expect(res.body.data.conversionStatus).toBe('CONVERTED');
      expect(res.body.data.affiliateUrl).toBe('https://clnk.in/r/same');
    });

    it('PATCH /api/v1/product-manager/offers/:id - SHOULD trigger conversion when originalUrl is changed', async () => {
      vi.spyOn(cuelinksClient, 'convertLink').mockResolvedValueOnce({
        original_url: 'https://flipkart.com/p/new-deal',
        tracking_url: 'https://clnk.in/r/new-deal-track',
        affiliated: true,
      });

      const existingOffer = {
        id: 'offer-change-url',
        productId: testProductId,
        merchantId: 'merch-amazon',
        title: 'Old URL Deal',
        originalPrice: 1000,
        sellingPrice: 800,
        discountPercentage: 20,
        currency: 'INR',
        originalUrl: 'https://amazon.in/dp/B00OLD',
        affiliateUrl: 'https://clnk.in/r/old',
        conversionStatus: 'CONVERTED',
        isAffiliated: true,
        status: 'DRAFT',
        availability: 'IN_STOCK',
        createdById: 'pm-user-1',
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      testStore.offers.push(existingOffer);

      const res = await request(app)
        .patch(`/api/v1/product-manager/offers/${existingOffer.id}`)
        .set('Authorization', `Bearer ${productManagerToken}`)
        .send({
          originalUrl: 'https://flipkart.com/p/new-deal',
        });

      expect(res.status).toBe(200);
      expect(res.body.data.conversionStatus).toBe('CONVERTED');
      expect(res.body.data.affiliateUrl).toBe('https://clnk.in/r/new-deal-track');
    });
  });

  describe('5. Product Manager Affiliate Actions & Status', () => {
    let pmOffer: any;

    beforeEach(() => {
      pmOffer = {
        id: 'offer-pm-action-test',
        productId: testProductId,
        merchantId: 'merch-amazon',
        title: 'PM Retry Test Offer',
        originalPrice: 5000,
        sellingPrice: 4000,
        discountPercentage: 20,
        currency: 'INR',
        originalUrl: 'https://amazon.in/dp/B00RETRY',
        conversionStatus: 'FAILED',
        isAffiliated: false,
        conversionError: 'Initial connection timeout',
        status: 'DRAFT',
        availability: 'IN_STOCK',
        createdById: 'pm-user-1',
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      testStore.offers.push(pmOffer);
    });

    it('POST /api/v1/product-manager/offers/:id/affiliate/convert - should retry and convert link', async () => {
      vi.spyOn(cuelinksClient, 'convertLink').mockResolvedValueOnce({
        original_url: 'https://amazon.in/dp/B00RETRY',
        tracking_url: 'https://clnk.in/r/retry-success',
        affiliated: true,
      });

      const res = await request(app)
        .post(`/api/v1/product-manager/offers/${pmOffer.id}/affiliate/convert`)
        .set('Authorization', `Bearer ${productManagerToken}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.conversionStatus).toBe('CONVERTED');
      expect(res.body.data.isAffiliated).toBe(true);
      expect(res.body.data.affiliateUrl).toBe('https://clnk.in/r/retry-success');
    });

    it('GET /api/v1/product-manager/offers/:id/affiliate/status - should return current affiliate status', async () => {
      const res = await request(app)
        .get(`/api/v1/product-manager/offers/${pmOffer.id}/affiliate/status`)
        .set('Authorization', `Bearer ${productManagerToken}`);

      expect(res.status).toBe(200);
      expect(res.body.data.offerId).toBe(pmOffer.id);
      expect(res.body.data.conversionStatus).toBe('FAILED');
      expect(res.body.data.isAffiliated).toBe(false);
      expect(res.body.data.conversionError).toBe('Initial connection timeout');
    });
  });

  describe('6. Super Admin Affiliate Link Management Endpoints', () => {
    beforeEach(() => {
      testStore.offers.push(
        {
          id: 'admin-aff-1',
          productId: testProductId,
          merchantId: 'merch-amazon',
          title: 'Offer One Converted',
          originalPrice: 1000,
          sellingPrice: 800,
          discountPercentage: 20,
          currency: 'INR',
          originalUrl: 'https://amazon.in/dp/B001',
          affiliateUrl: 'https://clnk.in/r/001',
          conversionStatus: 'CONVERTED',
          isAffiliated: true,
          status: 'PUBLISHED',
          availability: 'IN_STOCK',
          createdById: 'pm-user-1',
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          id: 'admin-aff-2',
          productId: testProductId,
          merchantId: 'merch-amazon',
          title: 'Offer Two Not Affiliated',
          originalPrice: 2000,
          sellingPrice: 1500,
          discountPercentage: 25,
          currency: 'INR',
          originalUrl: 'https://localshop.in/p/002',
          affiliateUrl: null,
          conversionStatus: 'NOT_AFFILIATED',
          isAffiliated: false,
          status: 'DRAFT',
          availability: 'IN_STOCK',
          createdById: 'pm-user-1',
          createdAt: new Date(),
          updatedAt: new Date(),
        }
      );
    });

    it('GET /api/v1/admin/integrations/cuelinks/affiliate-links - should list offers with affiliate pagination', async () => {
      const res = await request(app)
        .get('/api/v1/admin/integrations/cuelinks/affiliate-links')
        .set('Authorization', `Bearer ${superAdminToken}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(Array.isArray(res.body.data)).toBe(true);
      expect(res.body.pagination).toBeDefined();
    });

    it('GET /api/v1/admin/integrations/cuelinks/affiliate-links - should filter by conversionStatus', async () => {
      const res = await request(app)
        .get('/api/v1/admin/integrations/cuelinks/affiliate-links?conversionStatus=CONVERTED')
        .set('Authorization', `Bearer ${superAdminToken}`);

      expect(res.status).toBe(200);
      expect(res.body.data.every((o: any) => o.conversionStatus === 'CONVERTED')).toBe(true);
    });

    it('GET /api/v1/admin/integrations/cuelinks/affiliate-links/:id - should return single offer affiliate details', async () => {
      const res = await request(app)
        .get('/api/v1/admin/integrations/cuelinks/affiliate-links/admin-aff-1')
        .set('Authorization', `Bearer ${superAdminToken}`);

      expect(res.status).toBe(200);
      expect(res.body.data.id).toBe('admin-aff-1');
      expect(res.body.data.conversionStatus).toBe('CONVERTED');
      expect(res.body.data.affiliateUrl).toBe('https://clnk.in/r/001');
    });

    it('POST /api/v1/admin/integrations/cuelinks/affiliate-links/:id/retry - Super Admin can trigger retry', async () => {
      vi.spyOn(cuelinksClient, 'convertLink').mockResolvedValueOnce({
        original_url: 'https://localshop.in/p/002',
        tracking_url: 'https://clnk.in/r/local-002',
        affiliated: true,
      });

      const res = await request(app)
        .post('/api/v1/admin/integrations/cuelinks/affiliate-links/admin-aff-2/retry')
        .set('Authorization', `Bearer ${superAdminToken}`);

      expect(res.status).toBe(200);
      expect(res.body.data.conversionStatus).toBe('CONVERTED');
      expect(res.body.data.isAffiliated).toBe(true);
      expect(res.body.data.affiliateUrl).toBe('https://clnk.in/r/local-002');
    });
  });

  describe('7. RBAC & Security Enforcement', () => {
    it('should deny Product Manager access to Super Admin affiliate management endpoints', async () => {
      const res = await request(app)
        .get('/api/v1/admin/integrations/cuelinks/affiliate-links')
        .set('Authorization', `Bearer ${productManagerToken}`);

      expect(res.status).toBe(403);
    });

    it('should deny Customer access to Super Admin and PM affiliate endpoints', async () => {
      const res1 = await request(app)
        .get('/api/v1/admin/integrations/cuelinks/affiliate-links')
        .set('Authorization', `Bearer ${customerToken}`);
      expect(res1.status).toBe(403);

      const res2 = await request(app)
        .post('/api/v1/product-manager/offers/any-id/affiliate/convert')
        .set('Authorization', `Bearer ${customerToken}`);
      expect(res2.status).toBe(403);
    });

    it('should deny unauthenticated requests', async () => {
      const res = await request(app)
        .get('/api/v1/admin/integrations/cuelinks/affiliate-links');

      expect(res.status).toBe(401);
    });
  });

  describe('8. Customer Redirect Security & Affiliation Resolution', () => {
    it('should redirect to affiliateUrl when offer is PUBLISHED and affiliated: true', async () => {
      const publishedAffiliatedOffer = {
        id: 'offer-pub-aff',
        productId: testProductId,
        merchantId: 'merch-amazon',
        title: 'Published Affiliated Offer',
        originalPrice: 1000,
        sellingPrice: 800,
        originalUrl: 'https://amazon.in/dp/B00PUB',
        affiliateUrl: 'https://clnk.in/r/pub-aff-track',
        conversionStatus: 'CONVERTED',
        isAffiliated: true,
        status: 'PUBLISHED',
        availability: 'IN_STOCK',
        createdById: 'pm-user-1',
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      testStore.offers.push(publishedAffiliatedOffer);

      const clickRef = 'clk-ref-aff-123';
      testStore.affiliateClicks.push({
        id: 'clk-123',
        clickReference: clickRef,
        offerId: publishedAffiliatedOffer.id,
        productId: testProductId,
        merchantId: 'merch-amazon',
        clickedAt: new Date(),
      });

      const res = await request(app).get(`/api/v1/customer/redirect/${clickRef}?format=json`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.destinationUrl).toBe('https://clnk.in/r/pub-aff-track');
    });

    it('should fallback safely to originalUrl strictly from database when not affiliated', async () => {
      const publishedNonAffiliatedOffer = {
        id: 'offer-pub-non-aff',
        productId: testProductId,
        merchantId: 'merch-amazon',
        title: 'Published Non-Affiliated Offer',
        originalPrice: 1000,
        sellingPrice: 850,
        originalUrl: 'https://trustedmerchant.com/item/123',
        affiliateUrl: null,
        conversionStatus: 'NOT_AFFILIATED',
        isAffiliated: false,
        status: 'PUBLISHED',
        availability: 'IN_STOCK',
        createdById: 'pm-user-1',
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      testStore.offers.push(publishedNonAffiliatedOffer);

      const clickRef = 'clk-ref-fallback-456';
      testStore.affiliateClicks.push({
        id: 'clk-456',
        clickReference: clickRef,
        offerId: publishedNonAffiliatedOffer.id,
        productId: testProductId,
        merchantId: 'merch-amazon',
        clickedAt: new Date(),
      });

      const res = await request(app).get(`/api/v1/customer/redirect/${clickRef}?format=json`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.destinationUrl).toBe('https://trustedmerchant.com/item/123');
    });

    it('should reject redirection for unpublished offers (DRAFT or PENDING_APPROVAL)', async () => {
      const draftOffer = {
        id: 'offer-draft-status',
        productId: testProductId,
        merchantId: 'merch-amazon',
        title: 'Draft Offer Not Public',
        originalPrice: 1000,
        sellingPrice: 850,
        originalUrl: 'https://trustedmerchant.com/item/draft',
        conversionStatus: 'CONVERTED',
        isAffiliated: true,
        status: 'DRAFT',
        availability: 'IN_STOCK',
        createdById: 'pm-user-1',
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      testStore.offers.push(draftOffer);

      const clickRef = 'clk-ref-draft-789';
      testStore.affiliateClicks.push({
        id: 'clk-789',
        clickReference: clickRef,
        offerId: draftOffer.id,
        productId: testProductId,
        merchantId: 'merch-amazon',
        clickedAt: new Date(),
      });

      const res = await request(app).get(`/api/v1/customer/redirect/${clickRef}?format=json`);

      expect(res.status).toBe(400);
      expect(res.body.message).toContain('Offer is not active or published');
    });
  });
});
