import { describe, it, expect, beforeEach, vi } from 'vitest';
import request from 'supertest';
import { createApp } from '../src/app.js';
import { setupTestEnvironment } from './testHelper.js';

let app: any;
let store: any;
let customerToken: string;
let otherCustomerToken: string;

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

describe('Customer Wishlist Module', () => {
  let productId: string;

  beforeEach(async () => {
    const env = await setupTestEnvironment();
    store = env.store;
    customerToken = env.customerToken;
    app = createApp();

    const otherCustRes = await request(app)
      .post('/api/v1/customer/auth/register')
      .send({
        fullName: 'Other Wishlist User',
        email: 'otherwish@aslicart.com',
        password: 'Password@123!',
      });
    otherCustomerToken = otherCustRes.body.data.accessToken;

    productId = 'prod-wish-1';
    store.products.push({
      id: productId,
      name: 'Kindle Paperwhite 16GB',
      slug: 'kindle-paperwhite-16gb',
      categoryId: 'cat-electronics',
      mainImage: 'https://example.com/kindle.jpg',
      status: 'PUBLISHED',
      createdById: 'admin-1',
      createdAt: new Date(),
      updatedAt: new Date(),
    });
  });

  it('POST /api/v1/customer/wishlist/items - should add product to customer wishlist', async () => {
    const res = await request(app)
      .post('/api/v1/customer/wishlist/items')
      .set('Authorization', `Bearer ${customerToken}`)
      .send({ productId });

    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
    expect(res.body.data.item.productId).toBe(productId);
  });

  it('POST /api/v1/customer/wishlist/items - should prevent duplicate wishlist entries', async () => {
    // Add once
    await request(app)
      .post('/api/v1/customer/wishlist/items')
      .set('Authorization', `Bearer ${customerToken}`)
      .send({ productId });

    // Attempt second add
    const res = await request(app)
      .post('/api/v1/customer/wishlist/items')
      .set('Authorization', `Bearer ${customerToken}`)
      .send({ productId });

    expect(res.status).toBe(409);
    expect(res.body.success).toBe(false);
    expect(res.body.message).toContain('already in your wishlist');
  });

  it('GET /api/v1/customer/wishlist - should retrieve customer saved items', async () => {
    await request(app)
      .post('/api/v1/customer/wishlist/items')
      .set('Authorization', `Bearer ${customerToken}`)
      .send({ productId });

    const res = await request(app)
      .get('/api/v1/customer/wishlist')
      .set('Authorization', `Bearer ${customerToken}`);

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.itemsCount).toBeGreaterThanOrEqual(1);
    expect(res.body.data.items[0].productId).toBe(productId);
  });

  it('DELETE /api/v1/customer/wishlist/items/:itemId - should remove product from wishlist', async () => {
    const addRes = await request(app)
      .post('/api/v1/customer/wishlist/items')
      .set('Authorization', `Bearer ${customerToken}`)
      .send({ productId });

    const itemId = addRes.body.data.item.itemId;

    const delRes = await request(app)
      .delete(`/api/v1/customer/wishlist/items/${itemId}`)
      .set('Authorization', `Bearer ${customerToken}`);

    expect(delRes.status).toBe(200);
    expect(delRes.body.success).toBe(true);
  });

  it('IDOR Guard - Customer A cannot remove Customer B wishlist item', async () => {
    const addRes = await request(app)
      .post('/api/v1/customer/wishlist/items')
      .set('Authorization', `Bearer ${customerToken}`)
      .send({ productId });

    const customerAItemId = addRes.body.data.item.itemId;

    const tamperRes = await request(app)
      .delete(`/api/v1/customer/wishlist/items/${customerAItemId}`)
      .set('Authorization', `Bearer ${otherCustomerToken}`);

    expect(tamperRes.status).toBe(403);
  });

  it('RBAC Guard - Guest users cannot access wishlist', async () => {
    const res = await request(app).get('/api/v1/customer/wishlist');
    expect(res.status).toBe(401);
  });
});

