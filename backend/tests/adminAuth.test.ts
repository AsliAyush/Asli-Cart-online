import { describe, it, expect, beforeEach, vi } from 'vitest';
import request from 'supertest';
import { createApp } from '../src/app.js';
import { PasswordUtil } from '../src/utils/password.js';
import { JwtUtil } from '../src/utils/jwt.js';
import { ROLES } from '../src/constants/roles.js';
import { createMockStore, buildMockPrisma, MockStore } from './mockPrisma.js';

let store: MockStore;
let app: any;

vi.mock('../src/infra/database/prisma.js', () => {
  return {
    default: {
      user: {
        findUnique: (args: any) => (globalThis as any).currentMockPrisma.user.findUnique(args),
        findFirst: (args: any) => (globalThis as any).currentMockPrisma.user.findFirst(args),
        findMany: (args: any) => (globalThis as any).currentMockPrisma.user.findMany(args),
        count: (args: any) => (globalThis as any).currentMockPrisma.user.count(args),
        create: (args: any) => (globalThis as any).currentMockPrisma.user.create(args),
        update: (args: any) => (globalThis as any).currentMockPrisma.user.update(args),
      },
      role: {
        findMany: (args: any) => (globalThis as any).currentMockPrisma.role.findMany(args),
        findUnique: (args: any) => (globalThis as any).currentMockPrisma.role.findUnique(args),
      },
      module: {
        findMany: (args: any) => (globalThis as any).currentMockPrisma.module.findMany(args),
        findUnique: (args: any) => (globalThis as any).currentMockPrisma.module.findUnique(args),
      },
      modulePermission: {
        findMany: (args: any) => (globalThis as any).currentMockPrisma.modulePermission.findMany(args),
      },
      roleModulePermission: {
        findMany: (args: any) => (globalThis as any).currentMockPrisma.roleModulePermission.findMany(args),
        findFirst: (args: any) => (globalThis as any).currentMockPrisma.roleModulePermission.findFirst(args),
        deleteMany: (args: any) => (globalThis as any).currentMockPrisma.roleModulePermission.deleteMany(args),
        createMany: (args: any) => (globalThis as any).currentMockPrisma.roleModulePermission.createMany(args),
      },
      refreshToken: {
        create: (args: any) => (globalThis as any).currentMockPrisma.refreshToken.create(args),
        findUnique: (args: any) => (globalThis as any).currentMockPrisma.refreshToken.findUnique(args),
        update: (args: any) => (globalThis as any).currentMockPrisma.refreshToken.update(args),
        updateMany: (args: any) => (globalThis as any).currentMockPrisma.refreshToken.updateMany(args),
        deleteMany: (args: any) => (globalThis as any).currentMockPrisma.refreshToken.deleteMany(args),
      },
      auditLog: {
        create: (args: any) => (globalThis as any).currentMockPrisma.auditLog.create(args),
        findMany: (args: any) => (globalThis as any).currentMockPrisma.auditLog.findMany(args),
        count: (args: any) => (globalThis as any).currentMockPrisma.auditLog.count(args),
      },
      $queryRaw: () => (globalThis as any).currentMockPrisma.$queryRaw(),
      $transaction: (cb: any) => (globalThis as any).currentMockPrisma.$transaction(cb),
      $disconnect: () => {},
    },
    prisma: {
      user: {
        findUnique: (args: any) => (globalThis as any).currentMockPrisma.user.findUnique(args),
        findFirst: (args: any) => (globalThis as any).currentMockPrisma.user.findFirst(args),
        findMany: (args: any) => (globalThis as any).currentMockPrisma.user.findMany(args),
        count: (args: any) => (globalThis as any).currentMockPrisma.user.count(args),
        create: (args: any) => (globalThis as any).currentMockPrisma.user.create(args),
        update: (args: any) => (globalThis as any).currentMockPrisma.user.update(args),
      },
      role: {
        findMany: (args: any) => (globalThis as any).currentMockPrisma.role.findMany(args),
        findUnique: (args: any) => (globalThis as any).currentMockPrisma.role.findUnique(args),
      },
      module: {
        findMany: (args: any) => (globalThis as any).currentMockPrisma.module.findMany(args),
        findUnique: (args: any) => (globalThis as any).currentMockPrisma.module.findUnique(args),
      },
      modulePermission: {
        findMany: (args: any) => (globalThis as any).currentMockPrisma.modulePermission.findMany(args),
      },
      roleModulePermission: {
        findMany: (args: any) => (globalThis as any).currentMockPrisma.roleModulePermission.findMany(args),
        findFirst: (args: any) => (globalThis as any).currentMockPrisma.roleModulePermission.findFirst(args),
        deleteMany: (args: any) => (globalThis as any).currentMockPrisma.roleModulePermission.deleteMany(args),
        createMany: (args: any) => (globalThis as any).currentMockPrisma.roleModulePermission.createMany(args),
      },
      refreshToken: {
        create: (args: any) => (globalThis as any).currentMockPrisma.refreshToken.create(args),
        findUnique: (args: any) => (globalThis as any).currentMockPrisma.refreshToken.findUnique(args),
        update: (args: any) => (globalThis as any).currentMockPrisma.refreshToken.update(args),
        updateMany: (args: any) => (globalThis as any).currentMockPrisma.refreshToken.updateMany(args),
        deleteMany: (args: any) => (globalThis as any).currentMockPrisma.refreshToken.deleteMany(args),
      },
      auditLog: {
        create: (args: any) => (globalThis as any).currentMockPrisma.auditLog.create(args),
        findMany: (args: any) => (globalThis as any).currentMockPrisma.auditLog.findMany(args),
        count: (args: any) => (globalThis as any).currentMockPrisma.auditLog.count(args),
      },
      $queryRaw: () => (globalThis as any).currentMockPrisma.$queryRaw(),
      $transaction: (cb: any) => (globalThis as any).currentMockPrisma.$transaction(cb),
      $disconnect: () => {},
    },
  };
});

describe('Admin Authentication Module', () => {
  beforeEach(async () => {
    store = createMockStore();
    (globalThis as any).currentMockPrisma = buildMockPrisma(store);

    // Seed default Super Admin
    const superAdminPasswordHash = await PasswordUtil.hash('SuperAdmin@2026!');
    store.users.push({
      id: 'admin-1',
      fullName: 'Super Admin Test',
      email: 'admin@aslicart.com',
      passwordHash: superAdminPasswordHash,
      roleId: 'role-super-admin',
      isActive: true,
      emailVerified: true,
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    // Seed non-admin user
    const customerPasswordHash = await PasswordUtil.hash('CustomerPass123!');
    store.users.push({
      id: 'cust-1',
      fullName: 'Regular Customer',
      email: 'customer@aslicart.com',
      passwordHash: customerPasswordHash,
      roleId: 'role-customer',
      isActive: true,
      emailVerified: true,
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    // Seed inactive admin
    store.users.push({
      id: 'admin-inactive',
      fullName: 'Inactive Admin',
      email: 'inactive@aslicart.com',
      passwordHash: superAdminPasswordHash,
      roleId: 'role-super-admin',
      isActive: false,
      emailVerified: true,
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    app = createApp();
  });

  it('POST /api/v1/admin/auth/login - should authenticate active SUPER_ADMIN successfully', async () => {
    const res = await request(app)
      .post('/api/v1/admin/auth/login')
      .send({
        email: 'admin@aslicart.com',
        password: 'SuperAdmin@2026!',
      });

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.accessToken).toBeDefined();
    expect(res.body.data.refreshToken).toBeDefined();
    expect(res.body.data.user.email).toBe('admin@aslicart.com');
    expect(res.body.data.user.roleName).toBe(ROLES.SUPER_ADMIN);
    expect(res.body.data.user.passwordHash).toBeUndefined();
  });

  it('POST /api/v1/admin/auth/login - should reject invalid password', async () => {
    const res = await request(app)
      .post('/api/v1/admin/auth/login')
      .send({
        email: 'admin@aslicart.com',
        password: 'WrongPassword!',
      });

    expect(res.status).toBe(401);
    expect(res.body.success).toBe(false);
    expect(res.body.message).toContain('Invalid email or password');
  });

  it('POST /api/v1/admin/auth/login - should reject non-existent user', async () => {
    const res = await request(app)
      .post('/api/v1/admin/auth/login')
      .send({
        email: 'nonexistent@aslicart.com',
        password: 'SomePassword123!',
      });

    expect(res.status).toBe(401);
    expect(res.body.success).toBe(false);
  });

  it('POST /api/v1/admin/auth/login - should deny access to non-SUPER_ADMIN users', async () => {
    const res = await request(app)
      .post('/api/v1/admin/auth/login')
      .send({
        email: 'customer@aslicart.com',
        password: 'CustomerPass123!',
      });

    expect(res.status).toBe(403);
    expect(res.body.success).toBe(false);
    expect(res.body.message).toContain('Access denied');
  });

  it('POST /api/v1/admin/auth/login - should reject inactive user accounts', async () => {
    const res = await request(app)
      .post('/api/v1/admin/auth/login')
      .send({
        email: 'inactive@aslicart.com',
        password: 'SuperAdmin@2026!',
      });

    expect(res.status).toBe(401);
    expect(res.body.success).toBe(false);
    expect(res.body.message).toContain('deactivated');
  });

  it('POST /api/v1/admin/auth/refresh - should rotate refresh token and issue new access token', async () => {
    // First login to get a real refresh token
    const loginRes = await request(app)
      .post('/api/v1/admin/auth/login')
      .send({
        email: 'admin@aslicart.com',
        password: 'SuperAdmin@2026!',
      });

    const initialRefreshToken = loginRes.body.data.refreshToken;

    const refreshRes = await request(app)
      .post('/api/v1/admin/auth/refresh')
      .send({ refreshToken: initialRefreshToken });

    expect(refreshRes.status).toBe(200);
    expect(refreshRes.body.success).toBe(true);
    expect(refreshRes.body.data.accessToken).toBeDefined();
    expect(refreshRes.body.data.refreshToken).toBeDefined();
    expect(refreshRes.body.data.refreshToken).not.toBe(initialRefreshToken);

    // Old refresh token must now be revoked
    const reusedRes = await request(app)
      .post('/api/v1/admin/auth/refresh')
      .send({ refreshToken: initialRefreshToken });

    expect(reusedRes.status).toBe(401);
    expect(reusedRes.body.success).toBe(false);
  });

  it('POST /api/v1/admin/auth/refresh - should reject invalid refresh token', async () => {
    const res = await request(app)
      .post('/api/v1/admin/auth/refresh')
      .send({ refreshToken: 'invalid.jwt.token' });

    expect(res.status).toBe(401);
    expect(res.body.success).toBe(false);
  });

  it('POST /api/v1/admin/auth/logout - should revoke refresh token', async () => {
    const loginRes = await request(app)
      .post('/api/v1/admin/auth/login')
      .send({
        email: 'admin@aslicart.com',
        password: 'SuperAdmin@2026!',
      });

    const refreshToken = loginRes.body.data.refreshToken;

    const logoutRes = await request(app)
      .post('/api/v1/admin/auth/logout')
      .send({ refreshToken });

    expect(logoutRes.status).toBe(200);
    expect(logoutRes.body.success).toBe(true);

    // Subsequent refresh attempt must fail
    const refreshRes = await request(app)
      .post('/api/v1/admin/auth/refresh')
      .send({ refreshToken });

    expect(refreshRes.status).toBe(401);
  });

  it('GET /api/v1/admin/auth/me - should return authenticated admin profile', async () => {
    const loginRes = await request(app)
      .post('/api/v1/admin/auth/login')
      .send({
        email: 'admin@aslicart.com',
        password: 'SuperAdmin@2026!',
      });

    const accessToken = loginRes.body.data.accessToken;

    const meRes = await request(app)
      .get('/api/v1/admin/auth/me')
      .set('Authorization', `Bearer ${accessToken}`);

    expect(meRes.status).toBe(200);
    expect(meRes.body.success).toBe(true);
    expect(meRes.body.data.id).toBe('admin-1');
    expect(meRes.body.data.email).toBe('admin@aslicart.com');
    expect(meRes.body.data.roleName).toBe(ROLES.SUPER_ADMIN);
  });

  it('GET /api/v1/admin/auth/me - should reject request without token or with invalid token', async () => {
    const resNoToken = await request(app).get('/api/v1/admin/auth/me');
    expect(resNoToken.status).toBe(401);

    const resInvalidToken = await request(app)
      .get('/api/v1/admin/auth/me')
      .set('Authorization', 'Bearer invalid.token');
    expect(resInvalidToken.status).toBe(401);
  });
});

