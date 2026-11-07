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

describe('Customer Merchant Offer Comparison Module', () => {
  let productId: string;
  let offerAmazonId: string;
  let offerFlipkartId: string;

  beforeEach(async () => {
    const env = await setupTestEnvironment();
    store = env.store;
    app = createApp();

    productId = 'prod-compare-1';
    store.products.push({
      id: productId,
      name: 'Apple iPad Air M2 11-inch',
      slug: 'apple-ipad-air-m2',
      brand: 'Apple',
      categoryId: 'cat-electronics',
      mainImage: 'https://example.com/ipad.jpg',
      status: 'PUBLISHED',
      createdById: 'admin-1',
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    // Offer 1: Amazon
    offerAmazonId = 'offer-ipad-amazon';
    store.offers.push({
      id: offerAmazonId,
      productId,
      merchantId: 'merch-amazon',
      title: 'iPad Air M2 Amazon Deal',
      originalPrice: 59900,
      sellingPrice: 54900,
      discountPercentage: 8.35,
      currency: 'INR',
      originalUrl: 'https://www.amazon.in/dp/B0D1234567',
      availability: 'IN_STOCK',
      status: 'PUBLISHED',
      createdById: 'admin-1',
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    // Offer 2: Flipkart (Cheaper)
    offerFlipkartId = 'offer-ipad-flipkart';
    store.offers.push({
      id: offerFlipkartId,
      productId,
      merchantId: 'merch-flipkart',
      title: 'iPad Air M2 Flipkart Special Price',
      originalPrice: 59900,
      sellingPrice: 52990,
      discountPercentage: 11.54,
      currency: 'INR',
      originalUrl: 'https://www.flipkart.com/apple-ipad-air/p/12345',
      availability: 'IN_STOCK',
      status: 'PUBLISHED',
      createdById: 'admin-1',
      createdAt: new Date(),
      updatedAt: new Date(),
    });
  });

  it('GET /api/v1/customer/offers/compare/:productId - should compare multi-merchant offers for a product', async () => {
    const res = await request(app).get(`/api/v1/customer/offers/compare/${productId}?sort=price_asc`);

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.product).toBeDefined();
    expect(res.body.data.totalOffers).toBe(2);
    expect(res.body.data.offers).toBeInstanceOf(Array);

    // Sorted by price ascending: Flipkart (52,990) should be first
    const firstOffer = res.body.data.offers[0];
    const secondOffer = res.body.data.offers[1];
    expect(firstOffer.sellingPrice).toBeLessThanOrEqual(secondOffer.sellingPrice);
    expect(firstOffer.merchant.name).toBeDefined();
    expect(firstOffer.savings).toBeGreaterThan(0);
  });

  it('GET /api/v1/customer/offers/:id - should get single offer details', async () => {
    const res = await request(app).get(`/api/v1/customer/offers/${offerAmazonId}`);

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.id).toBe(offerAmazonId);
    expect(res.body.data.title).toContain('iPad Air M2 Amazon Deal');
    expect(res.body.data.sellingPrice).toBe(54900);
    expect(res.body.data.originalPrice).toBe(59900);
    expect(res.body.data.savings).toBe(5000);
  });
});

