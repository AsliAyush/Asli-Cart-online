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

describe('Customer Profile Module', () => {
  beforeEach(async () => {
    const env = await setupTestEnvironment();
    customerToken = env.customerToken;
    app = createApp();
  });

  it('GET /api/v1/customer/profile - should return customer profile information', async () => {
    const res = await request(app)
      .get('/api/v1/customer/profile')
      .set('Authorization', `Bearer ${customerToken}`);

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.email).toBe('customer@aslicart.com');
    expect(res.body.data.role).toBe('CUSTOMER');
    expect(res.body.data.passwordHash).toBeUndefined();
  });

  it('PATCH /api/v1/customer/profile - should update allowed customer profile fields', async () => {
    const res = await request(app)
      .patch('/api/v1/customer/profile')
      .set('Authorization', `Bearer ${customerToken}`)
      .send({
        fullName: 'Updated Customer Name',
        phone: '9988776655',
      });

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.fullName).toBe('Updated Customer Name');
    expect(res.body.data.phone).toBe('9988776655');
  });

  it('PATCH /api/v1/customer/profile/change-password - should change customer password and revoke session', async () => {
    const res = await request(app)
      .patch('/api/v1/customer/profile/change-password')
      .set('Authorization', `Bearer ${customerToken}`)
      .send({
        currentPassword: 'CustomerPass@2026!',
        newPassword: 'NewCustomerPass@2026!',
      });

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);

    // Old password should fail login
    const oldLoginRes = await request(app)
      .post('/api/v1/customer/auth/login')
      .send({
        email: 'customer@aslicart.com',
        password: 'CustomerPass@2026!',
      });
    expect(oldLoginRes.status).toBe(401);

    // New password should succeed
    const newLoginRes = await request(app)
      .post('/api/v1/customer/auth/login')
      .send({
        email: 'customer@aslicart.com',
        password: 'NewCustomerPass@2026!',
      });
    expect(newLoginRes.status).toBe(200);
    expect(newLoginRes.body.data.accessToken).toBeDefined();
  });

  it('Security Guard - Customer must not be able to elevate their own role', async () => {
    const tamperRes = await request(app)
      .patch('/api/v1/customer/profile')
      .set('Authorization', `Bearer ${customerToken}`)
      .send({
        roleId: 'role-super-admin',
        isActive: false,
      });

    // Zod validator strips or ignores non-profile fields, and service never updates roleId
    expect(tamperRes.body.data.role).toBe('CUSTOMER');
  });

  it('RBAC Guard - CUSTOMER cannot access Admin endpoints', async () => {
    const res = await request(app)
      .get('/api/v1/admin/users')
      .set('Authorization', `Bearer ${customerToken}`);

    expect(res.status).toBe(403);
  });

  it('RBAC Guard - CUSTOMER cannot access Product Manager creation endpoints', async () => {
    const res = await request(app)
      .post('/api/v1/product-manager/products')
      .set('Authorization', `Bearer ${customerToken}`)
      .send({
        name: 'Unauthorized Product',
        categoryId: 'cat-electronics',
        mainImage: 'https://example.com/test.jpg',
      });

    expect(res.status).toBe(403);
  });
});

