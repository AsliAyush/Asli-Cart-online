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

describe('Product Discovery Module', () => {
  beforeEach(async () => {
    const env = await setupTestEnvironment();
    pmToken = env.productManagerToken;
    app = createApp();
  });

  it('GET /api/v1/product-manager/discovery - should search discovered products feed', async () => {
    const res = await request(app)
      .get('/api/v1/product-manager/discovery?keyword=Sony')
      .set('Authorization', `Bearer ${pmToken}`);

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data).toBeInstanceOf(Array);
    expect(res.body.data.length).toBeGreaterThanOrEqual(1);
    expect(res.body.data[0].title).toContain('Sony');
  });

  it('GET /api/v1/product-manager/discovery/:externalId - should get discovered item details', async () => {
    const res = await request(app)
      .get('/api/v1/product-manager/discovery/DISC-AMZ-001')
      .set('Authorization', `Bearer ${pmToken}`);

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.externalId).toBe('DISC-AMZ-001');
    expect(res.body.data.merchantSlug).toBe('amazon');
    expect(res.body.data.discountPercentage).toBeGreaterThan(0);
  });

  it('POST /api/v1/product-manager/discovery/import - should import discovered product into catalog', async () => {
    const res = await request(app)
      .post('/api/v1/product-manager/discovery/import')
      .set('Authorization', `Bearer ${pmToken}`)
      .send({ externalId: 'DISC-AMZ-001' });

    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
    expect(res.body.data.product).toBeDefined();
    expect(res.body.data.offer).toBeDefined();
    expect(res.body.data.product.name).toContain('Sony');

    // Duplicate import attempt must fail
    const duplicateRes = await request(app)
      .post('/api/v1/product-manager/discovery/import')
      .set('Authorization', `Bearer ${pmToken}`)
      .send({ externalId: 'DISC-AMZ-001' });

    expect(duplicateRes.status).toBe(409);
    expect(duplicateRes.body.success).toBe(false);
    expect(duplicateRes.body.message).toContain('already been imported');
  });
});

