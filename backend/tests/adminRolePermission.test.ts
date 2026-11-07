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
let productManagerToken: string;

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

describe('Admin Role & Permission Management Module', () => {
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

    const pmUser = {
      id: 'pm-1',
      fullName: 'Product Manager Test',
      email: 'pm@aslicart.com',
      passwordHash: await PasswordUtil.hash('PMPassword123!'),
      roleId: 'role-product-manager',
      isActive: true,
      emailVerified: true,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    store.users.push(pmUser);

    superAdminToken = JwtUtil.signAccessToken({
      userId: superAdminUser.id,
      email: superAdminUser.email,
      roleId: superAdminUser.roleId,
      roleName: ROLES.SUPER_ADMIN,
    });

    productManagerToken = JwtUtil.signAccessToken({
      userId: pmUser.id,
      email: pmUser.email,
      roleId: pmUser.roleId,
      roleName: ROLES.PRODUCT_MANAGER,
    });

    app = createApp();
  });

  it('GET /api/v1/admin/roles - should list all roles', async () => {
    const res = await request(app)
      .get('/api/v1/admin/roles')
      .set('Authorization', `Bearer ${superAdminToken}`);

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.length).toBeGreaterThanOrEqual(4);
    expect(res.body.data[0].name).toBeDefined();
  });

  it('GET /api/v1/admin/roles/:id - should return single role details', async () => {
    const res = await request(app)
      .get('/api/v1/admin/roles/role-product-manager')
      .set('Authorization', `Bearer ${superAdminToken}`);

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.name).toBe(ROLES.PRODUCT_MANAGER);
  });

  it('GET /api/v1/admin/modules - should list registered modules', async () => {
    const res = await request(app)
      .get('/api/v1/admin/modules')
      .set('Authorization', `Bearer ${superAdminToken}`);

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.length).toBeGreaterThanOrEqual(4);
  });

  it('GET /api/v1/admin/modules/:id/permissions - should return permissions for a module', async () => {
    const res = await request(app)
      .get('/api/v1/admin/modules/mod-user/permissions')
      .set('Authorization', `Bearer ${superAdminToken}`);

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.length).toBeGreaterThan(0);
    expect(res.body.data[0].moduleId).toBe('mod-user');
  });

  it('GET /api/v1/admin/roles/:id/permissions - should return permissions assigned to a role', async () => {
    const res = await request(app)
      .get('/api/v1/admin/roles/role-product-manager/permissions')
      .set('Authorization', `Bearer ${superAdminToken}`);

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.length).toBeGreaterThanOrEqual(2);
    expect(res.body.data[0].permissionKey).toBeDefined();
  });

  it('PUT /api/v1/admin/roles/:id/permissions - should update permissions assigned to a role', async () => {
    const newPermIds = ['perm-user-view', 'perm-product-view'];

    const res = await request(app)
      .put('/api/v1/admin/roles/role-product-manager/permissions')
      .set('Authorization', `Bearer ${superAdminToken}`)
      .send({ permissionIds: newPermIds });

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.length).toBe(2);
  });

  it('PUT /api/v1/admin/roles/:id/permissions - should reject invalid permission IDs', async () => {
    const res = await request(app)
      .put('/api/v1/admin/roles/role-product-manager/permissions')
      .set('Authorization', `Bearer ${superAdminToken}`)
      .send({ permissionIds: ['non-existent-perm-id'] });

    expect(res.status).toBe(400);
    expect(res.body.success).toBe(false);
    expect(res.body.message).toContain('invalid');
  });

  it('PUT /api/v1/admin/roles/:id/permissions - should PREVENT stripping permissions from SUPER_ADMIN system role', async () => {
    const res = await request(app)
      .put('/api/v1/admin/roles/role-super-admin/permissions')
      .set('Authorization', `Bearer ${superAdminToken}`)
      .send({ permissionIds: [] });

    expect(res.status).toBe(403);
    expect(res.body.success).toBe(false);
    expect(res.body.message).toContain('immutable and cannot be restricted');
  });

  it('Role Guard - non-Super Admin must be forbidden from accessing role/module endpoints', async () => {
    const res = await request(app)
      .get('/api/v1/admin/roles')
      .set('Authorization', `Bearer ${productManagerToken}`);

    expect(res.status).toBe(403);
    expect(res.body.success).toBe(false);
  });
});

