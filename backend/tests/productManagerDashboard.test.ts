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

describe('Product Manager Dashboard Module', () => {
  beforeEach(async () => {
    const env = await setupTestEnvironment();
    pmToken = env.productManagerToken;
    custToken = env.customerToken;
    app = createApp();
  });

  it('GET /api/v1/product-manager/dashboard - should return dashboard statistics', async () => {
    const res = await request(app)
      .get('/api/v1/product-manager/dashboard')
      .set('Authorization', `Bearer ${pmToken}`);

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.products).toBeDefined();
    expect(res.body.data.products.total).toBeDefined();
    expect(res.body.data.products.active).toBeDefined();
    expect(res.body.data.products.draft).toBeDefined();
    expect(res.body.data.products.pendingApproval).toBeDefined();
    expect(res.body.data.offers).toBeDefined();
    expect(res.body.data.offers.total).toBeDefined();
  });

  it('GET /api/v1/product-manager/dashboard/recent-activity - should return recent products and offers', async () => {
    const res = await request(app)
      .get('/api/v1/product-manager/dashboard/recent-activity?limit=5')
      .set('Authorization', `Bearer ${pmToken}`);

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.recentProducts).toBeInstanceOf(Array);
    expect(res.body.data.recentOffers).toBeInstanceOf(Array);
  });

  it('GET /api/v1/product-manager/dashboard/pending-reviews - should return items pending approval', async () => {
    const res = await request(app)
      .get('/api/v1/product-manager/dashboard/pending-reviews')
      .set('Authorization', `Bearer ${pmToken}`);

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.pendingProducts).toBeInstanceOf(Array);
    expect(res.body.data.pendingOffers).toBeInstanceOf(Array);
    expect(res.body.data.totalPending).toBeDefined();
  });

  it('RBAC Guard - CUSTOMER role must be forbidden from accessing Product Manager dashboard', async () => {
    const res = await request(app)
      .get('/api/v1/product-manager/dashboard')
      .set('Authorization', `Bearer ${custToken}`);

    expect(res.status).toBe(403);
    expect(res.body.success).toBe(false);
  });
});

