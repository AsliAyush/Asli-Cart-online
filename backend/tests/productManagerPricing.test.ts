import { describe, it, expect, beforeEach, vi } from 'vitest';
import request from 'supertest';
import { createApp } from '../src/app.js';
import { setupTestEnvironment } from './testHelper.js';

let app: any;
let pmToken: string;

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

describe('Pricing Management Module', () => {
  beforeEach(async () => {
    const env = await setupTestEnvironment();
    pmToken = env.productManagerToken;
    app = createApp();
  });

  it('POST /api/v1/product-manager/pricing/calculate - should calculate discount and savings correctly', async () => {
    const res = await request(app)
      .post('/api/v1/product-manager/pricing/calculate')
      .set('Authorization', `Bearer ${pmToken}`)
      .send({
        originalPrice: 10000,
        sellingPrice: 7500,
      });

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.discountPercentage).toBe(25);
    expect(res.body.data.savings).toBe(2500);
  });

  it('POST /api/v1/product-manager/pricing/calculate - should reject selling price greater than original price', async () => {
    const res = await request(app)
      .post('/api/v1/product-manager/pricing/calculate')
      .set('Authorization', `Bearer ${pmToken}`)
      .send({
        originalPrice: 5000,
        sellingPrice: 6000,
      });

    expect(res.status).toBe(400);
    expect(res.body.success).toBe(false);
    expect(res.body.message).toContain('Selling price cannot be greater than original price');
  });

  it('POST /api/v1/product-manager/pricing/calculate - should reject negative prices', async () => {
    const res = await request(app)
      .post('/api/v1/product-manager/pricing/calculate')
      .set('Authorization', `Bearer ${pmToken}`)
      .send({
        originalPrice: -100,
        sellingPrice: 50,
      });

    expect(res.status).toBe(400);
    expect(res.body.success).toBe(false);
  });

  it('GET /api/v1/product-manager/pricing/history/:productId - should return historical pricing records', async () => {
    // Create product
    const prodRes = await request(app)
      .post('/api/v1/product-manager/products')
      .set('Authorization', `Bearer ${pmToken}`)
      .send({
        name: 'Pricing Test Product',
        categoryId: 'cat-electronics',
        mainImage: 'https://example.com/test.jpg',
      });

    const productId = prodRes.body.data.id;

    const res = await request(app)
      .get(`/api/v1/product-manager/pricing/history/${productId}`)
      .set('Authorization', `Bearer ${pmToken}`);

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data).toBeInstanceOf(Array);
  });
});

