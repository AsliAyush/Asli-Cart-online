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

describe('Admin Dashboard & Health Check Endpoints', () => {
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

    superAdminToken = JwtUtil.signAccessToken({
      userId: superAdminUser.id,
      email: superAdminUser.email,
      roleId: superAdminUser.roleId,
      roleName: ROLES.SUPER_ADMIN,
    });

    app = createApp();
  });

  it('GET /api/v1/health - should report service status and database connectivity', async () => {
    const res = await request(app).get('/api/v1/health');

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.status).toBe('UP');
    expect(res.body.data.database).toBe('connected');
    expect(res.body.data.uptime).toBeDefined();
    // Verify no credentials leaked
    expect(JSON.stringify(res.body)).not.toContain('password');
    expect(JSON.stringify(res.body)).not.toContain('secret');
    expect(JSON.stringify(res.body)).not.toContain('postgres');
  });

  it('GET /api/v1/admin/dashboard - should return structured dashboard summary', async () => {
    const res = await request(app)
      .get('/api/v1/admin/dashboard')
      .set('Authorization', `Bearer ${superAdminToken}`);

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.users.total).toBe(1);
    expect(res.body.data.users.active).toBe(1);
    expect(res.body.data.products.total).toBe(0);
    expect(res.body.data.products._note).toBeDefined();
    expect(res.body.data.offers.total).toBe(0);
    expect(res.body.data.offers.published).toBe(0);
    expect(res.body.data.offers.pendingApprovals).toBe(0);
  });
});

