import { describe, it, expect, beforeEach, vi } from 'vitest';
import request from 'supertest';
import { createApp } from '../src/app.js';
import { setupTestEnvironment } from './testHelper.js';

let app: any;

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

describe('Customer Authentication Module', () => {
  beforeEach(async () => {
    await setupTestEnvironment();
    app = createApp();
  });

  it('POST /api/v1/customer/auth/register - should register a new customer and assign CUSTOMER role', async () => {
    const res = await request(app)
      .post('/api/v1/customer/auth/register')
      .send({
        fullName: 'Jane Customer',
        email: 'jane@example.com',
        password: 'Password@123!',
        phone: '9876543210',
      });

    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
    expect(res.body.data.user).toBeDefined();
    expect(res.body.data.user.email).toBe('jane@example.com');
    expect(res.body.data.user.role).toBe('CUSTOMER');
    expect(res.body.data.accessToken).toBeDefined();
    expect(res.body.data.refreshToken).toBeDefined();
  });

  it('POST /api/v1/customer/auth/register - should reject duplicate email address', async () => {
    // First registration
    await request(app)
      .post('/api/v1/customer/auth/register')
      .send({
        fullName: 'First Customer',
        email: 'duplicate@example.com',
        password: 'Password@123!',
      });

    // Duplicate attempt
    const res = await request(app)
      .post('/api/v1/customer/auth/register')
      .send({
        fullName: 'Second Customer',
        email: 'duplicate@example.com',
        password: 'Password@123!',
      });

    expect(res.status).toBe(409);
    expect(res.body.success).toBe(false);
    expect(res.body.message).toContain('already exists');
  });

  it('POST /api/v1/customer/auth/register - should reject weak password', async () => {
    const res = await request(app)
      .post('/api/v1/customer/auth/register')
      .send({
        fullName: 'Weak Password User',
        email: 'weak@example.com',
        password: 'weak',
      });

    expect(res.status).toBe(400);
    expect(res.body.success).toBe(false);
  });

  it('POST /api/v1/customer/auth/login - should authenticate registered customer', async () => {
    const res = await request(app)
      .post('/api/v1/customer/auth/login')
      .send({
        email: 'customer@aslicart.com',
        password: 'CustomerPass@2026!',
      });

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.user.email).toBe('customer@aslicart.com');
    expect(res.body.data.user.role).toBe('CUSTOMER');
    expect(res.body.data.accessToken).toBeDefined();
    expect(res.body.data.refreshToken).toBeDefined();
  });

  it('POST /api/v1/customer/auth/login - should reject invalid password', async () => {
    const res = await request(app)
      .post('/api/v1/customer/auth/login')
      .send({
        email: 'customer@aslicart.com',
        password: 'WrongPassword@123!',
      });

    expect(res.status).toBe(401);
    expect(res.body.success).toBe(false);
  });

  it('POST /api/v1/customer/auth/refresh - should rotate refresh token and issue new access token', async () => {
    const loginRes = await request(app)
      .post('/api/v1/customer/auth/login')
      .send({
        email: 'customer@aslicart.com',
        password: 'CustomerPass@2026!',
      });

    const refreshToken = loginRes.body.data.refreshToken;

    const refreshRes = await request(app)
      .post('/api/v1/customer/auth/refresh')
      .send({ refreshToken });

    expect(refreshRes.status).toBe(200);
    expect(refreshRes.body.success).toBe(true);
    expect(refreshRes.body.data.accessToken).toBeDefined();
    expect(refreshRes.body.data.refreshToken).toBeDefined();
  });

  it('POST /api/v1/customer/auth/logout - should revoke refresh token', async () => {
    const loginRes = await request(app)
      .post('/api/v1/customer/auth/login')
      .send({
        email: 'customer@aslicart.com',
        password: 'CustomerPass@2026!',
      });

    const refreshToken = loginRes.body.data.refreshToken;
    const accessToken = loginRes.body.data.accessToken;

    const logoutRes = await request(app)
      .post('/api/v1/customer/auth/logout')
      .set('Authorization', `Bearer ${accessToken}`)
      .send({ refreshToken });

    expect(logoutRes.status).toBe(200);
    expect(logoutRes.body.success).toBe(true);
  });

  it('GET /api/v1/customer/auth/me - should return authenticated customer information', async () => {
    const loginRes = await request(app)
      .post('/api/v1/customer/auth/login')
      .send({
        email: 'customer@aslicart.com',
        password: 'CustomerPass@2026!',
      });

    const accessToken = loginRes.body.data.accessToken;

    const meRes = await request(app)
      .get('/api/v1/customer/auth/me')
      .set('Authorization', `Bearer ${accessToken}`);

    expect(meRes.status).toBe(200);
    expect(meRes.body.success).toBe(true);
    expect(meRes.body.data.email).toBe('customer@aslicart.com');
  });
});

