import { describe, it, expect, beforeEach, vi } from 'vitest';
import request from 'supertest';
import { createApp } from '../src/app.js';
import { PasswordUtil } from '../src/utils/password.js';
import { JwtUtil } from '../src/utils/jwt.js';
import { ROLES } from '../src/constants/roles.js';
import { createMockStore, buildMockPrisma, MockStore } from './mockPrisma.js';

let store: MockStore;
let app: any;
let superAdminToken: string;

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

describe('Admin User Management Module', () => {
  beforeEach(async () => {
    store = createMockStore();
    (globalThis as any).currentMockPrisma = buildMockPrisma(store);

    const superAdminPasswordHash = await PasswordUtil.hash('SuperAdmin@2026!');
    const superAdminUser = {
      id: 'admin-1',
      fullName: 'Super Admin Test',
      email: 'admin@aslicart.com',
      passwordHash: superAdminPasswordHash,
      roleId: 'role-super-admin',
      isActive: true,
      emailVerified: true,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    store.users.push(superAdminUser);

    // Create an employee
    store.users.push({
      id: 'emp-1',
      fullName: 'Employee One',
      email: 'emp1@aslicart.com',
      passwordHash: await PasswordUtil.hash('EmployeePass123!'),
      roleId: 'role-product-manager',
      isActive: true,
      emailVerified: true,
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    superAdminToken = JwtUtil.signAccessToken({
      userId: superAdminUser.id,
      email: superAdminUser.email,
      roleId: superAdminUser.roleId,
      roleName: ROLES.SUPER_ADMIN,
    });

    app = createApp();
  });

  it('GET /api/v1/admin/users - should list users with pagination', async () => {
    const res = await request(app)
      .get('/api/v1/admin/users?page=1&limit=10')
      .set('Authorization', `Bearer ${superAdminToken}`);

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.items).toBeInstanceOf(Array);
    expect(res.body.data.pagination.total).toBe(2);
    expect(res.body.data.items[0].passwordHash).toBeUndefined();
  });

  it('GET /api/v1/admin/users/:id - should return single user details without passwordHash', async () => {
    const res = await request(app)
      .get('/api/v1/admin/users/emp-1')
      .set('Authorization', `Bearer ${superAdminToken}`);

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.id).toBe('emp-1');
    expect(res.body.data.email).toBe('emp1@aslicart.com');
    expect(res.body.data.passwordHash).toBeUndefined();
  });

  it('POST /api/v1/admin/users - should create employee with valid role', async () => {
    const res = await request(app)
      .post('/api/v1/admin/users')
      .set('Authorization', `Bearer ${superAdminToken}`)
      .send({
        fullName: 'New Product Manager',
        email: 'pm@aslicart.com',
        password: 'ValidPassword123!',
        roleId: 'role-product-manager',
      });

    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
    expect(res.body.data.email).toBe('pm@aslicart.com');
    expect(res.body.data.passwordHash).toBeUndefined();
    expect(res.body.data.role.name).toBe(ROLES.PRODUCT_MANAGER);
  });

  it('POST /api/v1/admin/users - should PREVENT creating Super Admin through standard endpoint', async () => {
    const res = await request(app)
      .post('/api/v1/admin/users')
      .set('Authorization', `Bearer ${superAdminToken}`)
      .send({
        fullName: 'Rogue Super Admin',
        email: 'rogue@aslicart.com',
        password: 'ValidPassword123!',
        roleId: 'role-super-admin',
      });

    expect(res.status).toBe(403);
    expect(res.body.success).toBe(false);
    expect(res.body.message).toContain('Super Admin accounts cannot be created');
  });

  it('POST /api/v1/admin/users - should reject duplicate email address', async () => {
    const res = await request(app)
      .post('/api/v1/admin/users')
      .set('Authorization', `Bearer ${superAdminToken}`)
      .send({
        fullName: 'Duplicate Email',
        email: 'admin@aslicart.com',
        password: 'ValidPassword123!',
        roleId: 'role-product-manager',
      });

    expect(res.status).toBe(409);
    expect(res.body.success).toBe(false);
    expect(res.body.message).toContain('already exists');
  });

  it('POST /api/v1/admin/users - should reject weak password', async () => {
    const res = await request(app)
      .post('/api/v1/admin/users')
      .set('Authorization', `Bearer ${superAdminToken}`)
      .send({
        fullName: 'Weak Pass',
        email: 'weak@aslicart.com',
        password: 'short',
        roleId: 'role-product-manager',
      });

    expect(res.status).toBe(400);
    expect(res.body.success).toBe(false);
  });

  it('PATCH /api/v1/admin/users/:id/status - should deactivate and activate user', async () => {
    // Deactivate emp-1
    const deactivateRes = await request(app)
      .patch('/api/v1/admin/users/emp-1/status')
      .set('Authorization', `Bearer ${superAdminToken}`)
      .send({ isActive: false });

    expect(deactivateRes.status).toBe(200);
    expect(deactivateRes.body.data.isActive).toBe(false);

    // Re-activate emp-1
    const activateRes = await request(app)
      .patch('/api/v1/admin/users/emp-1/status')
      .set('Authorization', `Bearer ${superAdminToken}`)
      .send({ isActive: true });

    expect(activateRes.status).toBe(200);
    expect(activateRes.body.data.isActive).toBe(true);
  });

  it('PATCH /api/v1/admin/users/:id/status - should PREVENT deactivation of the last active Super Admin', async () => {
    const res = await request(app)
      .patch('/api/v1/admin/users/admin-1/status')
      .set('Authorization', `Bearer ${superAdminToken}`)
      .send({ isActive: false });

    expect(res.status).toBe(400);
    expect(res.body.success).toBe(false);
    expect(res.body.message).toContain('Cannot deactivate the last active Super Admin');
  });

  it('PATCH /api/v1/admin/users/:id/role - should update employee role', async () => {
    const res = await request(app)
      .patch('/api/v1/admin/users/emp-1/role')
      .set('Authorization', `Bearer ${superAdminToken}`)
      .send({ roleId: 'role-social-media' });

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.role.name).toBe(ROLES.SOCIAL_MEDIA_MANAGER);
  });

  it('PATCH /api/v1/admin/users/:id/role - should PREVENT promoting user to Super Admin', async () => {
    const res = await request(app)
      .patch('/api/v1/admin/users/emp-1/role')
      .set('Authorization', `Bearer ${superAdminToken}`)
      .send({ roleId: 'role-super-admin' });

    expect(res.status).toBe(403);
    expect(res.body.success).toBe(false);
    expect(res.body.message).toContain('Super Admin role cannot be assigned');
  });

  it('PATCH /api/v1/admin/users/:id/role - should PREVENT demoting the last active Super Admin', async () => {
    const res = await request(app)
      .patch('/api/v1/admin/users/admin-1/role')
      .set('Authorization', `Bearer ${superAdminToken}`)
      .send({ roleId: 'role-customer' });

    expect(res.status).toBe(400);
    expect(res.body.success).toBe(false);
    expect(res.body.message).toContain('Cannot change the role of the last active Super Admin');
  });
});

