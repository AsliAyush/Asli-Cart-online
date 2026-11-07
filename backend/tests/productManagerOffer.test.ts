import { describe, it, expect, beforeEach, vi } from 'vitest';
import request from 'supertest';
import { createApp } from '../src/app.js';
import { setupTestEnvironment } from './testHelper.js';

let app: any;
let pmToken: string;
let custToken: string;
let adminToken: string;

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

describe('Product Manager Offer Management Module', () => {
  let createdProductId: string;

  beforeEach(async () => {
    const env = await setupTestEnvironment();
    pmToken = env.productManagerToken;
    custToken = env.customerToken;
    adminToken = env.superAdminToken;
    app = createApp();

    // Create a product to attach offers to
    const prodRes = await request(app)
      .post('/api/v1/product-manager/products')
      .set('Authorization', `Bearer ${pmToken}`)
      .send({
        name: 'Apple MacBook Air 13 M3',
        categoryId: 'cat-electronics',
        mainImage: 'https://example.com/macbook.jpg',
        brand: 'Apple',
      });

    createdProductId = prodRes.body.data.id;
  });

  it('POST /api/v1/product-manager/offers - should create an offer in DRAFT status and auto-calculate discount', async () => {
    const res = await request(app)
      .post('/api/v1/product-manager/offers')
      .set('Authorization', `Bearer ${pmToken}`)
      .send({
        productId: createdProductId,
        merchantId: 'merch-amazon',
        title: 'MacBook Air M3 Amazon Deal',
        originalPrice: 114900,
        sellingPrice: 99990,
        currency: 'INR',
        originalUrl: 'https://www.amazon.in/dp/B0CX234567',
        couponCode: 'SAVE15000',
        availability: 'IN_STOCK',
      });

    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
    expect(res.body.data.id).toBeDefined();
    expect(res.body.data.title).toBe('MacBook Air M3 Amazon Deal');
    expect(res.body.data.status).toBe('DRAFT');
    expect(res.body.data.originalPrice).toBe(114900);
    expect(res.body.data.sellingPrice).toBe(99990);
    expect(res.body.data.discountPercentage).toBeCloseTo(12.98, 1);
    expect(res.body.data.affiliateUrl).toBeDefined();
    expect(res.body.data.affiliateUrl).toContain('linksredirect.com');
  });

  it('POST /api/v1/product-manager/offers - should reject invalid pricing where selling > original', async () => {
    const res = await request(app)
      .post('/api/v1/product-manager/offers')
      .set('Authorization', `Bearer ${pmToken}`)
      .send({
        productId: createdProductId,
        merchantId: 'merch-amazon',
        title: 'Invalid High Price Deal',
        originalPrice: 1000,
        sellingPrice: 1500,
        originalUrl: 'https://www.amazon.in/dp/B0CX999999',
      });

    expect(res.status).toBe(400);
    expect(res.body.success).toBe(false);
    expect(res.body.message).toContain('Selling price cannot be greater than original price');
  });

  it('GET /api/v1/product-manager/offers - should list offers with filters and pagination', async () => {
    // Create an offer first
    await request(app)
      .post('/api/v1/product-manager/offers')
      .set('Authorization', `Bearer ${pmToken}`)
      .send({
        productId: createdProductId,
        merchantId: 'merch-amazon',
        title: 'Offer Listing Test',
        originalPrice: 2000,
        sellingPrice: 1500,
        originalUrl: 'https://www.amazon.in/dp/B0CX111111',
      });

    const res = await request(app)
      .get('/api/v1/product-manager/offers?page=1&limit=10&merchantId=merch-amazon')
      .set('Authorization', `Bearer ${pmToken}`);

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.items).toBeInstanceOf(Array);
    expect(res.body.data.items.length).toBeGreaterThanOrEqual(1);
    expect(res.body.data.pagination).toBeDefined();
  });

  it('GET /api/v1/product-manager/offers/:id - should get offer details', async () => {
    const createRes = await request(app)
      .post('/api/v1/product-manager/offers')
      .set('Authorization', `Bearer ${pmToken}`)
      .send({
        productId: createdProductId,
        merchantId: 'merch-amazon',
        title: 'Single Offer Details Test',
        originalPrice: 5000,
        sellingPrice: 4000,
        originalUrl: 'https://www.amazon.in/dp/B0CX222222',
      });

    const offerId = createRes.body.data.id;

    const res = await request(app)
      .get(`/api/v1/product-manager/offers/${offerId}`)
      .set('Authorization', `Bearer ${pmToken}`);

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.id).toBe(offerId);
    expect(res.body.data.title).toBe('Single Offer Details Test');
  });

  it('PATCH /api/v1/product-manager/offers/:id - should update offer price and recalculate discount', async () => {
    const createRes = await request(app)
      .post('/api/v1/product-manager/offers')
      .set('Authorization', `Bearer ${pmToken}`)
      .send({
        productId: createdProductId,
        merchantId: 'merch-amazon',
        title: 'Price Update Offer Test',
        originalPrice: 10000,
        sellingPrice: 8000,
        originalUrl: 'https://www.amazon.in/dp/B0CX333333',
      });

    const offerId = createRes.body.data.id;

    const updateRes = await request(app)
      .patch(`/api/v1/product-manager/offers/${offerId}`)
      .set('Authorization', `Bearer ${pmToken}`)
      .send({
        sellingPrice: 7000,
      });

    expect(updateRes.status).toBe(200);
    expect(updateRes.body.success).toBe(true);
    expect(updateRes.body.data.sellingPrice).toBe(7000);
    expect(updateRes.body.data.discountPercentage).toBe(30);
  });

  it('PATCH /api/v1/product-manager/offers/:id/submit-approval - should transition offer to PENDING_APPROVAL', async () => {
    const createRes = await request(app)
      .post('/api/v1/product-manager/offers')
      .set('Authorization', `Bearer ${pmToken}`)
      .send({
        productId: createdProductId,
        merchantId: 'merch-amazon',
        title: 'Submit Approval Test',
        originalPrice: 8000,
        sellingPrice: 6000,
        originalUrl: 'https://www.amazon.in/dp/B0CX444444',
      });

    const offerId = createRes.body.data.id;

    const submitRes = await request(app)
      .patch(`/api/v1/product-manager/offers/${offerId}/submit-approval`)
      .set('Authorization', `Bearer ${pmToken}`);

    expect(submitRes.status).toBe(200);
    expect(submitRes.body.success).toBe(true);
    expect(submitRes.body.data.status).toBe('PENDING_APPROVAL');
  });

  it('PATCH /api/v1/product-manager/offers/:id/status - should allow PM to pause or expire offer', async () => {
    const createRes = await request(app)
      .post('/api/v1/product-manager/offers')
      .set('Authorization', `Bearer ${pmToken}`)
      .send({
        productId: createdProductId,
        merchantId: 'merch-amazon',
        title: 'Status Transition Test',
        originalPrice: 4000,
        sellingPrice: 3000,
        originalUrl: 'https://www.amazon.in/dp/B0CX555555',
      });

    const offerId = createRes.body.data.id;

    const pauseRes = await request(app)
      .patch(`/api/v1/product-manager/offers/${offerId}/status`)
      .set('Authorization', `Bearer ${pmToken}`)
      .send({ status: 'PAUSED' });

    expect(pauseRes.status).toBe(200);
    expect(pauseRes.body.success).toBe(true);
    expect(pauseRes.body.data.status).toBe('PAUSED');
  });

  it('PATCH /api/v1/product-manager/offers/:id/status - should REJECT direct publishing by Product Manager', async () => {
    const createRes = await request(app)
      .post('/api/v1/product-manager/offers')
      .set('Authorization', `Bearer ${pmToken}`)
      .send({
        productId: createdProductId,
        merchantId: 'merch-amazon',
        title: 'Direct Publish Block Test',
        originalPrice: 4000,
        sellingPrice: 3000,
        originalUrl: 'https://www.amazon.in/dp/B0CX666666',
      });

    const offerId = createRes.body.data.id;

    const publishRes = await request(app)
      .patch(`/api/v1/product-manager/offers/${offerId}/status`)
      .set('Authorization', `Bearer ${pmToken}`)
      .send({ status: 'PUBLISHED' });

    // Zod validation blocks non-PAUSED/EXPIRED statuses for this endpoint
    expect(publishRes.status).toBe(400);
    expect(publishRes.body.success).toBe(false);
  });

  it('RBAC - should reject unauthenticated requests to offers', async () => {
    const res = await request(app).get('/api/v1/product-manager/offers');
    expect(res.status).toBe(401);
  });

  it('RBAC - should reject customer access to product manager offers', async () => {
    const res = await request(app)
      .get('/api/v1/product-manager/offers')
      .set('Authorization', `Bearer ${custToken}`);

    expect(res.status).toBe(403);
  });
});

