import { describe, it, expect, beforeEach, vi } from 'vitest';
import request from 'supertest';
import { createApp } from '../src/app.js';
import { setupTestEnvironment } from './testHelper.js';

let app: any;
let pmToken: string;
let custToken: string;

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

describe('Product Manager Product Management Module', () => {
  beforeEach(async () => {
    const env = await setupTestEnvironment();
    pmToken = env.productManagerToken;
    custToken = env.customerToken;
    app = createApp();
  });

  it('POST /api/v1/product-manager/products - should create a new product in DRAFT status', async () => {
    const res = await request(app)
      .post('/api/v1/product-manager/products')
      .set('Authorization', `Bearer ${pmToken}`)
      .send({
        name: 'Apple iPhone 15 Pro Max',
        description: 'Titanium flagship smartphone',
        brand: 'Apple',
        categoryId: 'cat-mobiles',
        mainImage: 'https://example.com/iphone15.jpg',
        specifications: { storage: '256GB', color: 'Natural Titanium' },
      });

    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
    expect(res.body.data.name).toBe('Apple iPhone 15 Pro Max');
    expect(res.body.data.status).toBe('DRAFT');
    expect(res.body.data.slug).toContain('apple-iphone-15-pro-max');
    expect(res.body.data.isAssignedToSmm).toBe(false);
  });

  it('GET /api/v1/product-manager/products - should list products with pagination and filters', async () => {
    // First create a product
    await request(app)
      .post('/api/v1/product-manager/products')
      .set('Authorization', `Bearer ${pmToken}`)
      .send({
        name: 'Sony WH-1000XM5',
        categoryId: 'cat-electronics',
        mainImage: 'https://example.com/sony.jpg',
        brand: 'Sony',
      });

    const res = await request(app)
      .get('/api/v1/product-manager/products?page=1&limit=10&categoryId=cat-electronics')
      .set('Authorization', `Bearer ${pmToken}`);

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.items).toBeInstanceOf(Array);
    expect(res.body.data.items.length).toBeGreaterThanOrEqual(1);
    expect(res.body.data.pagination).toBeDefined();
  });

  it('GET /api/v1/product-manager/products/:id - should get product details', async () => {
    const createRes = await request(app)
      .post('/api/v1/product-manager/products')
      .set('Authorization', `Bearer ${pmToken}`)
      .send({
        name: 'MacBook Air M3',
        categoryId: 'cat-electronics',
        mainImage: 'https://example.com/macbook.jpg',
      });

    const productId = createRes.body.data.id;

    const res = await request(app)
      .get(`/api/v1/product-manager/products/${productId}`)
      .set('Authorization', `Bearer ${pmToken}`);

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.id).toBe(productId);
    expect(res.body.data.name).toBe('MacBook Air M3');
  });

  it('PATCH /api/v1/product-manager/products/:id - should update product information', async () => {
    const createRes = await request(app)
      .post('/api/v1/product-manager/products')
      .set('Authorization', `Bearer ${pmToken}`)
      .send({
        name: 'Dell XPS 13',
        categoryId: 'cat-electronics',
        mainImage: 'https://example.com/xps.jpg',
      });

    const productId = createRes.body.data.id;

    const updateRes = await request(app)
      .patch(`/api/v1/product-manager/products/${productId}`)
      .set('Authorization', `Bearer ${pmToken}`)
      .send({
        description: 'Updated ultra-portable laptop description',
        brand: 'Dell',
      });

    expect(updateRes.status).toBe(200);
    expect(updateRes.body.success).toBe(true);
    expect(updateRes.body.data.description).toContain('Updated');
    expect(updateRes.body.data.brand).toBe('Dell');
  });

  it('PATCH /api/v1/product-manager/products/:id/submit-approval - should transition status to PENDING_APPROVAL', async () => {
    const createRes = await request(app)
      .post('/api/v1/product-manager/products')
      .set('Authorization', `Bearer ${pmToken}`)
      .send({
        name: 'iPad Pro 13',
        categoryId: 'cat-mobiles',
        mainImage: 'https://example.com/ipad.jpg',
      });

    const productId = createRes.body.data.id;

    const submitRes = await request(app)
      .patch(`/api/v1/product-manager/products/${productId}/submit-approval`)
      .set('Authorization', `Bearer ${pmToken}`);

    expect(submitRes.status).toBe(200);
    expect(submitRes.body.success).toBe(true);
    expect(submitRes.body.data.status).toBe('PENDING_APPROVAL');
  });

  it('PATCH /api/v1/product-manager/products/:id/assign-smm - should assign product to Social Media Manager', async () => {
    const createRes = await request(app)
      .post('/api/v1/product-manager/products')
      .set('Authorization', `Bearer ${pmToken}`)
      .send({
        name: 'GoPro Hero 12',
        categoryId: 'cat-electronics',
        mainImage: 'https://example.com/gopro.jpg',
      });

    const productId = createRes.body.data.id;

    const assignRes = await request(app)
      .patch(`/api/v1/product-manager/products/${productId}/assign-smm`)
      .set('Authorization', `Bearer ${pmToken}`)
      .send({ isAssigned: true });

    expect(assignRes.status).toBe(200);
    expect(assignRes.body.data.isAssignedToSmm).toBe(true);
  });

  it('DELETE /api/v1/product-manager/products/:id - should archive product', async () => {
    const createRes = await request(app)
      .post('/api/v1/product-manager/products')
      .set('Authorization', `Bearer ${pmToken}`)
      .send({
        name: 'Old Model Phone',
        categoryId: 'cat-mobiles',
        mainImage: 'https://example.com/old.jpg',
      });

    const productId = createRes.body.data.id;

    const archiveRes = await request(app)
      .delete(`/api/v1/product-manager/products/${productId}`)
      .set('Authorization', `Bearer ${pmToken}`);

    expect(archiveRes.status).toBe(200);
    expect(archiveRes.body.data.status).toBe('ARCHIVED');
  });

  it('RBAC Guard - CUSTOMER role must be forbidden from creating products', async () => {
    const res = await request(app)
      .post('/api/v1/product-manager/products')
      .set('Authorization', `Bearer ${custToken}`)
      .send({
        name: 'Unauthorized Product',
        categoryId: 'cat-mobiles',
        mainImage: 'https://example.com/test.jpg',
      });

    expect(res.status).toBe(403);
  });
});

