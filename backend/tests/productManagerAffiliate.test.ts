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

describe('Product Manager Affiliate Management Module', () => {
  beforeEach(async () => {
    const env = await setupTestEnvironment();
    pmToken = env.productManagerToken;
    custToken = env.customerToken;
    app = createApp();
  });

  it('POST /api/v1/product-manager/affiliate/convert - should convert valid merchant URL to affiliate link', async () => {
    const res = await request(app)
      .post('/api/v1/product-manager/affiliate/convert')
      .set('Authorization', `Bearer ${pmToken}`)
      .send({
        originalUrl: 'https://www.amazon.in/dp/B0CX123456',
        subId1: 'test-product-1',
        subId2: 'amazon',
      });

    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
    expect(res.body.data.originalUrl).toBe('https://www.amazon.in/dp/B0CX123456');
    expect(res.body.data.affiliateUrl).toBeDefined();
    expect(res.body.data.affiliateUrl).toContain('linksredirect.com');
    expect(res.body.data.provider).toMatch(/CUELINKS/);
  });

  it('POST /api/v1/product-manager/affiliate/convert - should reject invalid URLs', async () => {
    const res = await request(app)
      .post('/api/v1/product-manager/affiliate/convert')
      .set('Authorization', `Bearer ${pmToken}`)
      .send({
        originalUrl: 'not-a-valid-url',
      });

    expect(res.status).toBe(400);
    expect(res.body.success).toBe(false);
  });

  it('GET /api/v1/product-manager/affiliate/links - should list affiliate links with pagination', async () => {
    // Generate a link first
    await request(app)
      .post('/api/v1/product-manager/affiliate/convert')
      .set('Authorization', `Bearer ${pmToken}`)
      .send({
        originalUrl: 'https://www.flipkart.com/item/123',
        subId1: 'item-1',
      });

    const res = await request(app)
      .get('/api/v1/product-manager/affiliate/links?page=1&limit=20')
      .set('Authorization', `Bearer ${pmToken}`);

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.items).toBeInstanceOf(Array);
    expect(res.body.data.pagination).toBeDefined();
  });

  it('GET /api/v1/product-manager/affiliate/links/:id - should return single affiliate link details', async () => {
    const convRes = await request(app)
      .post('/api/v1/product-manager/affiliate/convert')
      .set('Authorization', `Bearer ${pmToken}`)
      .send({
        originalUrl: 'https://www.myntra.com/shoes/12345',
        subId1: 'myntra-shoes',
      });

    const linkId = convRes.body.data.id;

    const res = await request(app)
      .get(`/api/v1/product-manager/affiliate/links/${linkId}`)
      .set('Authorization', `Bearer ${pmToken}`);

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.id).toBe(linkId);
    expect(res.body.data.originalUrl).toBe('https://www.myntra.com/shoes/12345');
  });

  it('RBAC - should reject unauthenticated requests to affiliate endpoints', async () => {
    const res = await request(app).get('/api/v1/product-manager/affiliate/links');
    expect(res.status).toBe(401);
  });

  it('RBAC - should reject customer access to affiliate endpoints', async () => {
    const res = await request(app)
      .get('/api/v1/product-manager/affiliate/links')
      .set('Authorization', `Bearer ${custToken}`);

    expect(res.status).toBe(403);
  });
});

