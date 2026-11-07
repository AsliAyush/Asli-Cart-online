import { describe, it, expect, beforeEach, vi } from 'vitest';
import request from 'supertest';
import { createApp } from '../src/app.js';
import { setupTestEnvironment } from './testHelper.js';

let app: any;
let customerToken: string;

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

describe('Customer Dashboard Module', () => {
  beforeEach(async () => {
    const env = await setupTestEnvironment();
    customerToken = env.customerToken;
    app = createApp();
  });

  it('GET /api/v1/customer/dashboard/summary - should return customer dashboard statistics and recent activity', async () => {
    const res = await request(app)
      .get('/api/v1/customer/dashboard/summary')
      .set('Authorization', `Bearer ${customerToken}`);

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.stats).toBeDefined();
    expect(res.body.data.stats.totalCartItems).toBeDefined();
    expect(res.body.data.stats.totalWishlistItems).toBeDefined();
    expect(res.body.data.recentCartItems).toBeInstanceOf(Array);
    expect(res.body.data.recommendedDeals).toBeInstanceOf(Array);
  });

  it('RBAC Guard - Guest users cannot access customer dashboard', async () => {
    const res = await request(app).get('/api/v1/customer/dashboard/summary');
    expect(res.status).toBe(401);
  });
});

