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

describe('Customer Public Product Browsing Module', () => {
  let publishedProdId: string;
  let draftProdId: string;

  beforeEach(async () => {
    const env = await setupTestEnvironment();
    store = env.store;
    app = createApp();

    // 1. Seed a PUBLISHED product
    publishedProdId = 'prod-published-1';
    store.products.push({
      id: publishedProdId,
      name: 'Sony WH-1000XM5 Noise Cancelling Headphones',
      slug: 'sony-wh-1000xm5-headphones',
      description: 'Industry leading noise cancelling headphones',
      brand: 'Sony',
      categoryId: 'cat-electronics',
      mainImage: 'https://example.com/sony.jpg',
      additionalImages: [],
      specifications: { color: 'Black' },
      status: 'PUBLISHED',
      isAssignedToSmm: false,
      createdById: 'admin-1',
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    // 2. Attach a PUBLISHED active offer to the published product
    store.offers.push({
      id: 'offer-sony-amazon',
      productId: publishedProdId,
      merchantId: 'merch-amazon',
      title: 'Sony WH-1000XM5 Amazon Deal',
      originalPrice: 29990,
      sellingPrice: 24990,
      discountPercentage: 16.67,
      currency: 'INR',
      originalUrl: 'https://www.amazon.in/dp/B09XS7JWHH',
      affiliateUrl: 'https://linksredirect.com/?cid=mock&url=https%3A%2F%2Fwww.amazon.in%2Fdp%2FB09XS7JWHH',
      availability: 'IN_STOCK',
      status: 'PUBLISHED',
      priceVerifiedAt: new Date(),
      createdById: 'admin-1',
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    // 3. Seed a DRAFT product (must remain hidden from public)
    draftProdId = 'prod-draft-secret';
    store.products.push({
      id: draftProdId,
      name: 'Unreleased Secret Prototype Phone',
      slug: 'secret-prototype-phone',
      brand: 'SecretBrand',
      categoryId: 'cat-mobiles',
      mainImage: 'https://example.com/secret.jpg',
      status: 'DRAFT',
      createdById: 'admin-1',
      createdAt: new Date(),
      updatedAt: new Date(),
    });
  });

  it('GET /api/v1/customer/products - should list published products with best offer price', async () => {
    const res = await request(app).get('/api/v1/customer/products?page=1&limit=10');

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.items).toBeInstanceOf(Array);
    expect(res.body.data.items.length).toBeGreaterThanOrEqual(1);

    const sony = res.body.data.items.find((i: any) => i.id === publishedProdId);
    expect(sony).toBeDefined();
    expect(sony.bestPrice).toBe(24990);
    expect(sony.originalPrice).toBe(29990);

    // DRAFT products must NOT appear in public catalog
    const draft = res.body.data.items.find((i: any) => i.id === draftProdId);
    expect(draft).toBeUndefined();
  });

  it('GET /api/v1/customer/products/search - should search products by keyword', async () => {
    const res = await request(app).get('/api/v1/customer/products/search?q=Sony');

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.items.length).toBeGreaterThanOrEqual(1);
    expect(res.body.data.items[0].name).toContain('Sony');
  });

  it('GET /api/v1/customer/products/categories - should list categories with product counts', async () => {
    const res = await request(app).get('/api/v1/customer/products/categories');

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data).toBeInstanceOf(Array);
    expect(res.body.data.length).toBeGreaterThanOrEqual(1);
    expect(res.body.data[0].slug).toBeDefined();
  });

  it('GET /api/v1/customer/products/:id - should return single product details with active offers', async () => {
    const res = await request(app).get(`/api/v1/customer/products/${publishedProdId}`);

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.id).toBe(publishedProdId);
    expect(res.body.data.name).toContain('Sony WH-1000XM5');
    expect(res.body.data.offers).toBeInstanceOf(Array);
    expect(res.body.data.offers.length).toBeGreaterThanOrEqual(1);
    expect(res.body.data.offers[0].sellingPrice).toBe(24990);
  });

  it('GET /api/v1/customer/products/:id - should return 404 for draft or unavailable products', async () => {
    const res = await request(app).get(`/api/v1/customer/products/${draftProdId}`);
    expect(res.status).toBe(404);
  });
});

