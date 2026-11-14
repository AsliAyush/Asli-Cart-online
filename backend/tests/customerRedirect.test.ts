import { describe, it, expect, beforeEach, vi } from 'vitest';
import request from 'supertest';
import { createApp } from '../src/app.js';
import { setupTestEnvironment } from './testHelper.js';

let app: any;
let store: any;
let customerToken: string;
let customerId: string;

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

describe('Customer Outbound Redirect & Click Tracking Module', () => {
  let clickRef: string;
  let targetAffiliateUrl: string;

  beforeEach(async () => {
    const env = await setupTestEnvironment();
    store = env.store;
    customerToken = env.customerToken;
    customerId = env.customer.id;
    app = createApp();

    targetAffiliateUrl = 'https://linksredirect.com/?cid=mock&subid=123&url=https%3A%2F%2Fwww.flipkart.com%2Fitem';
    clickRef = 'clk_test_valid_reference_123';

    store.products.push({
      id: 'prod-redirect-1',
      name: 'Puma Running Shoes',
      slug: 'puma-running-shoes',
      categoryId: 'cat-fashion',
      mainImage: 'https://example.com/puma.jpg',
      status: 'PUBLISHED',
      createdById: 'admin-1',
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    store.offers.push({
      id: 'offer-redirect-1',
      productId: 'prod-redirect-1',
      merchantId: 'merch-flipkart',
      title: 'Puma Shoes Flipkart Deal',
      originalPrice: 4999,
      sellingPrice: 2499,
      discountPercentage: 50,
      currency: 'INR',
      originalUrl: 'https://www.flipkart.com/puma-shoes',
      affiliateUrl: targetAffiliateUrl,
      availability: 'IN_STOCK',
      status: 'PUBLISHED',
      createdById: 'admin-1',
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    store.affiliateClicks.push({
      id: 'clk-id-1',
      customerId: 'cust-1',
      offerId: 'offer-redirect-1',
      productId: 'prod-redirect-1',
      merchantId: 'merch-flipkart',
      clickReference: clickRef,
      source: 'cart',
      clickedAt: new Date(),
    });
  });

  it('GET /api/v1/customer/redirect/:clickReference - should redirect HTTP 302 to trusted merchant URL', async () => {
    const res = await request(app).get(`/api/v1/customer/redirect/${clickRef}`);

    expect(res.status).toBe(302);
    expect(res.header.location).toBe(targetAffiliateUrl);
  });

  it('GET /api/v1/customer/redirect/:clickReference?format=json - should return destination JSON for API clients', async () => {
    const res = await request(app).get(`/api/v1/customer/redirect/${clickRef}?format=json`);

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.destinationUrl).toBe(targetAffiliateUrl);
    expect(res.body.data.merchantName).toBe('Flipkart');
  });

  it('GET /api/v1/customer/redirect/:clickReference - should reject invalid or non-existent click references', async () => {
    const res = await request(app).get('/api/v1/customer/redirect/invalid_non_existent_ref');
    expect(res.status).toBe(404);
  });

  it('POST /api/v1/customer/cart/merchant-redirect - should reject unpublished offers (DRAFT, PENDING_APPROVAL)', async () => {
    // Seed draft offer
    store.offers.push({
      id: 'offer-draft-redirect',
      productId: 'prod-redirect-1',
      merchantId: 'merch-flipkart',
      title: 'Unpublished Draft Offer',
      originalPrice: 4999,
      sellingPrice: 2499,
      discountPercentage: 50,
      currency: 'INR',
      originalUrl: 'https://www.flipkart.com/puma-shoes',
      availability: 'IN_STOCK',
      status: 'DRAFT',
      createdById: 'admin-1',
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    const res = await request(app)
      .post('/api/v1/customer/cart/merchant-redirect')
      .set('Authorization', `Bearer ${customerToken}`)
      .send({ offerId: 'offer-draft-redirect' });

    expect(res.status).toBe(400);
    expect(res.body.message).toContain('no longer available');
  });

  it('POST /api/v1/customer/cart/merchant-redirect - should reject expired offers', async () => {
    // Seed expired offer with past endDate
    const pastDate = new Date(Date.now() - 24 * 60 * 60 * 1000); // 1 day ago
    store.offers.push({
      id: 'offer-expired-redirect',
      productId: 'prod-redirect-1',
      merchantId: 'merch-flipkart',
      title: 'Expired Offer',
      originalPrice: 4999,
      sellingPrice: 2499,
      discountPercentage: 50,
      currency: 'INR',
      originalUrl: 'https://www.flipkart.com/puma-shoes',
      availability: 'IN_STOCK',
      status: 'PUBLISHED',
      endDate: pastDate,
      createdById: 'admin-1',
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    const res = await request(app)
      .post('/api/v1/customer/cart/merchant-redirect')
      .set('Authorization', `Bearer ${customerToken}`)
      .send({ offerId: 'offer-expired-redirect' });

    expect(res.status).toBe(400);
    expect(res.body.message).toContain('expired');
  });

  it('POST /api/v1/customer/cart/merchant-redirect - should reject non-existent offer ID', async () => {
    const res = await request(app)
      .post('/api/v1/customer/cart/merchant-redirect')
      .set('Authorization', `Bearer ${customerToken}`)
      .send({ offerId: 'non-existent-offer-99999' });

    expect(res.status).toBe(404);
    expect(res.body.message).toContain('not found');
  });

  it('Security: Open Redirect Protection - ignores client-provided destination URLs and strictly redirects to database-stored merchant URL', async () => {
    const res = await request(app)
      .post('/api/v1/customer/cart/merchant-redirect')
      .set('Authorization', `Bearer ${customerToken}`)
      .send({
        offerId: 'offer-redirect-1',
        destinationUrl: 'https://attacker-controlled-phishing.com/steal-creds',
        redirectUrl: 'https://evil.com',
      } as any);

    expect(res.status).toBe(200);
    // Verified: destinationUrl is strictly from the database, completely ignoring client-provided malicious targets
    expect(res.body.data.destinationUrl).toBe(targetAffiliateUrl);
    expect(res.body.data.destinationUrl).not.toContain('attacker-controlled-phishing.com');
    expect(res.body.data.destinationUrl).not.toContain('evil.com');
  });

  it('Privacy: Affiliate Attribution Privacy - ensures customer ID and PII are never exposed in external affiliate destination URLs', async () => {
    const res = await request(app)
      .post('/api/v1/customer/cart/merchant-redirect')
      .set('Authorization', `Bearer ${customerToken}`)
      .send({ offerId: 'offer-redirect-1' });

    expect(res.status).toBe(200);
    const destUrl = res.body.data.destinationUrl;

    // Customer internal ID must NOT appear in external URL
    expect(destUrl).not.toContain(customerId);
    expect(destUrl).not.toContain('cust-1');

    // Only opaque clickReference is used for attribution
    expect(res.body.data.clickReference).toBeDefined();

    // Verify click record attribution stored privately on backend
    const clickRecord = store.affiliateClicks.find(
      (c: any) => c.clickReference === res.body.data.clickReference
    );
    expect(clickRecord).toBeDefined();
    expect(clickRecord.customerId).toBe(customerId);
  });
});

