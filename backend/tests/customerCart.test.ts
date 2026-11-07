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

describe('Customer Shopping Cart Module', () => {
  let offerId: string;
  let productId: string;

  beforeEach(async () => {
    const env = await setupTestEnvironment();
    store = env.store;
    customerToken = env.customerToken;
    app = createApp();

    // Create another customer for IDOR tests
    const otherCustRes = await request(app)
      .post('/api/v1/customer/auth/register')
      .send({
        fullName: 'Other Customer',
        email: 'other@aslicart.com',
        password: 'OtherCustomer@123!',
      });
    otherCustomerToken = otherCustRes.body.data.accessToken;

    // Seed product
    productId = 'prod-cart-1';
    store.products.push({
      id: productId,
      name: 'Sony Bravia 55 inch 4K TV',
      slug: 'sony-bravia-55-4k-tv',
      categoryId: 'cat-electronics',
      mainImage: 'https://example.com/bravia.jpg',
      status: 'PUBLISHED',
      createdById: 'admin-1',
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    // Seed offer
    offerId = 'offer-cart-tv';
    store.offers.push({
      id: offerId,
      productId,
      merchantId: 'merch-amazon',
      title: 'Sony Bravia 55 inch TV Amazon Deal',
      originalPrice: 65000,
      sellingPrice: 54990,
      discountPercentage: 15.4,
      currency: 'INR',
      originalUrl: 'https://www.amazon.in/dp/B0CX999888',
      availability: 'IN_STOCK',
      status: 'PUBLISHED',
      createdById: 'admin-1',
      createdAt: new Date(),
      updatedAt: new Date(),
    });
  });

  it('POST /api/v1/customer/cart/items - should add merchant offer to customer cart with price snapshot', async () => {
    const res = await request(app)
      .post('/api/v1/customer/cart/items')
      .set('Authorization', `Bearer ${customerToken}`)
      .send({
        offerId,
        quantity: 1,
      });

    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
    expect(res.body.data.offerId).toBe(offerId);
    expect(res.body.data.quantity).toBe(1);
    expect(Number(res.body.data.priceSnapshot)).toBe(54990);
  });

  it('GET /api/v1/customer/cart - should retrieve cart with subtotal and grouped by merchant', async () => {
    // Add item first
    await request(app)
      .post('/api/v1/customer/cart/items')
      .set('Authorization', `Bearer ${customerToken}`)
      .send({ offerId, quantity: 2 });

    const res = await request(app)
      .get('/api/v1/customer/cart')
      .set('Authorization', `Bearer ${customerToken}`);

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.itemsCount).toBe(2);
    expect(res.body.data.subtotal).toBe(54990 * 2);
    expect(res.body.data.merchantGroups).toBeInstanceOf(Array);
    expect(res.body.data.merchantGroups.length).toBe(1);
    expect(res.body.data.merchantGroups[0].merchant.name).toBe('Amazon India');
  });

  it('PATCH /api/v1/customer/cart/items/:itemId - should update item quantity', async () => {
    const addRes = await request(app)
      .post('/api/v1/customer/cart/items')
      .set('Authorization', `Bearer ${customerToken}`)
      .send({ offerId, quantity: 1 });

    const itemId = addRes.body.data.id;

    const updateRes = await request(app)
      .patch(`/api/v1/customer/cart/items/${itemId}`)
      .set('Authorization', `Bearer ${customerToken}`)
      .send({ quantity: 3 });

    expect(updateRes.status).toBe(200);
    expect(updateRes.body.success).toBe(true);
    expect(updateRes.body.data.quantity).toBe(3);
  });

  it('DELETE /api/v1/customer/cart/items/:itemId - should remove single item from cart', async () => {
    const addRes = await request(app)
      .post('/api/v1/customer/cart/items')
      .set('Authorization', `Bearer ${customerToken}`)
      .send({ offerId, quantity: 1 });

    const itemId = addRes.body.data.id;

    const deleteRes = await request(app)
      .delete(`/api/v1/customer/cart/items/${itemId}`)
      .set('Authorization', `Bearer ${customerToken}`);

    expect(deleteRes.status).toBe(200);
    expect(deleteRes.body.success).toBe(true);
  });

  it('DELETE /api/v1/customer/cart/clear - should clear all items in customer cart', async () => {
    await request(app)
      .post('/api/v1/customer/cart/items')
      .set('Authorization', `Bearer ${customerToken}`)
      .send({ offerId, quantity: 1 });

    const clearRes = await request(app)
      .delete('/api/v1/customer/cart/clear')
      .set('Authorization', `Bearer ${customerToken}`);

    expect(clearRes.status).toBe(200);
    expect(clearRes.body.success).toBe(true);

    const getRes = await request(app)
      .get('/api/v1/customer/cart')
      .set('Authorization', `Bearer ${customerToken}`);

    expect(getRes.body.data.itemsCount).toBe(0);
  });

  it('POST /api/v1/customer/cart/merchant-redirect - should generate outbound redirect and track click attribution', async () => {
    const res = await request(app)
      .post('/api/v1/customer/cart/merchant-redirect')
      .set('Authorization', `Bearer ${customerToken}`)
      .send({
        offerId,
        source: 'cart',
      });

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.clickReference).toBeDefined();
    expect(res.body.data.redirectPath).toContain('/api/v1/customer/redirect/');
    expect(res.body.data.merchant.name).toBe('Amazon India');
    expect(res.body.data.destinationUrl).toBeDefined();
  });

  it('IDOR Guard - Customer A must not be able to modify Customer B cart item', async () => {
    // Add item as Customer A
    const addRes = await request(app)
      .post('/api/v1/customer/cart/items')
      .set('Authorization', `Bearer ${customerToken}`)
      .send({ offerId, quantity: 1 });

    const customerAItemId = addRes.body.data.id;

    // Attempt modification as Customer B
    const tamperRes = await request(app)
      .patch(`/api/v1/customer/cart/items/${customerAItemId}`)
      .set('Authorization', `Bearer ${otherCustomerToken}`)
      .send({ quantity: 10 });

    expect(tamperRes.status).toBe(403);
    expect(tamperRes.body.success).toBe(false);
  });

  it('RBAC Guard - Guest users cannot access customer cart', async () => {
    const res = await request(app).get('/api/v1/customer/cart');
    expect(res.status).toBe(401);
  });
});

