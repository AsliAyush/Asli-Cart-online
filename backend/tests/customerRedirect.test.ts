import { describe, it, expect, beforeEach, vi } from 'vitest';
import request from 'supertest';
import { createApp } from '../src/app.js';
import { setupTestEnvironment } from './testHelper.js';

let app: any;
let store: any;

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
});

