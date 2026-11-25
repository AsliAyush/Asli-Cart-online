import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import request from 'supertest';
import { createApp } from '../src/app.js';
import { CuelinksClient } from '../src/infra/integrations/cuelinks/cuelinksClient.js';
import { cuelinksService } from '../src/services/cuelinks.service.js';
import { setupTestEnvironment } from './testHelper.js';

let app: any;
let superAdminToken: string;
let productManagerToken: string;
let customerToken: string;
let testStore: any;

vi.mock('../src/infra/database/prisma.js', () => {
  return {
    default: {
      user: {
        findUnique: (args: any) => (globalThis as any).currentMockPrisma.user.findUnique(args),
        findFirst: (args: any) => (globalThis as any).currentMockPrisma.user.findFirst(args),
      },
      role: {
        findMany: (args: any) => (globalThis as any).currentMockPrisma.role.findMany(args),
        findUnique: (args: any) => (globalThis as any).currentMockPrisma.role.findUnique(args),
      },
      auditLog: {
        create: (args: any) => (globalThis as any).currentMockPrisma.auditLog.create(args),
      },
      cuelinksCampaign: {
        findMany: (args: any) => (globalThis as any).currentMockPrisma.cuelinksCampaign.findMany(args),
        findUnique: (args: any) => (globalThis as any).currentMockPrisma.cuelinksCampaign.findUnique(args),
        findFirst: (args: any) => (globalThis as any).currentMockPrisma.cuelinksCampaign.findFirst(args),
        create: (args: any) => (globalThis as any).currentMockPrisma.cuelinksCampaign.create(args),
        update: (args: any) => (globalThis as any).currentMockPrisma.cuelinksCampaign.update(args),
        upsert: (args: any) => (globalThis as any).currentMockPrisma.cuelinksCampaign.upsert(args),
        count: (args: any) => (globalThis as any).currentMockPrisma.cuelinksCampaign.count(args),
      },
    },
    prisma: {
      user: {
        findUnique: (args: any) => (globalThis as any).currentMockPrisma.user.findUnique(args),
      },
      cuelinksCampaign: {
        findMany: (args: any) => (globalThis as any).currentMockPrisma.cuelinksCampaign.findMany(args),
        findUnique: (args: any) => (globalThis as any).currentMockPrisma.cuelinksCampaign.findUnique(args),
        findFirst: (args: any) => (globalThis as any).currentMockPrisma.cuelinksCampaign.findFirst(args),
        create: (args: any) => (globalThis as any).currentMockPrisma.cuelinksCampaign.create(args),
        update: (args: any) => (globalThis as any).currentMockPrisma.cuelinksCampaign.update(args),
        upsert: (args: any) => (globalThis as any).currentMockPrisma.cuelinksCampaign.upsert(args),
        count: (args: any) => (globalThis as any).currentMockPrisma.cuelinksCampaign.count(args),
      },
    },
  };
});

describe('Cuelinks V3 Phase 2 — Campaign Discovery & Management', () => {
  const originalFetch = globalThis.fetch;

  beforeEach(async () => {
    const env = await setupTestEnvironment();
    testStore = env.store;
    superAdminToken = env.superAdminToken;
    productManagerToken = env.productManagerToken;
    customerToken = env.customerToken;
    app = createApp();

    // Reset store cuelinksCampaigns
    testStore.cuelinksCampaigns = [];
  });

  afterEach(() => {
    globalThis.fetch = originalFetch;
    vi.restoreAllMocks();
  });

  describe('CuelinksClient Campaign Methods', () => {
    it('should query campaigns with parameters and return mapped response', async () => {
      const mockCampaignsData = [
        {
          id: 4821,
          name: 'Flipkart CPS',
          description: 'Earn up to 4.5% commission on electronics and fashion',
          url: 'https://flipkart.com',
          domain: 'flipkart.com',
          access_status: 'open',
          payout: '4.50',
          currency: 'INR',
          epc_7d: '3.21',
          is_featured: true,
          platforms: ['Web', 'Mobile Web', 'Android App'],
        },
      ];

      globalThis.fetch = vi.fn().mockResolvedValue({
        ok: true,
        status: 200,
        json: async () => ({
          data: mockCampaignsData,
          meta: { total: 10482 },
        }),
      } as any);

      const client = new CuelinksClient({ apiKey: 'mock-key', baseUrl: 'https://developers.cuelinks.com/pub_api/v3' });
      const res = await client.getCampaigns({ q: 'Flipkart', access_status: 'open', page: 1, per_page: 10 });

      expect(res.data).toHaveLength(1);
      expect(res.data[0].id).toBe(4821);
      expect(res.data[0].name).toBe('Flipkart CPS');
      expect(res.meta.total).toBe(10482);
    });

    it('should query single campaign by ID', async () => {
      globalThis.fetch = vi.fn().mockResolvedValue({
        ok: true,
        status: 200,
        json: async () => ({
          data: {
            id: 4821,
            name: 'Flipkart CPS',
            access_status: 'open',
            payout: '4.50',
          },
        }),
      } as any);

      const client = new CuelinksClient({ apiKey: 'mock-key', baseUrl: 'https://developers.cuelinks.com/pub_api/v3' });
      const res = await client.getCampaignById(4821);

      expect(res.data.id).toBe(4821);
      expect(res.data.name).toBe('Flipkart CPS');
    });

    it('should post access request to private campaign', async () => {
      globalThis.fetch = vi.fn().mockResolvedValue({
        ok: true,
        status: 200,
        json: async () => ({
          message: 'Access request submitted successfully to advertiser',
          status: 'pending',
        }),
      } as any);

      const client = new CuelinksClient({ apiKey: 'mock-key', baseUrl: 'https://developers.cuelinks.com/pub_api/v3' });
      const res = await client.requestAccess(9999);

      expect(res.success).toBe(true);
      expect(res.status).toBe('pending');
      expect(res.message).toContain('Access request submitted');
    });
  });

  describe('CuelinksService Campaign Synchronization', () => {
    it('should synchronize remote campaigns and upsert into local database', async () => {
      const mockCampaigns = [
        {
          id: 101,
          name: 'Amazon India',
          url: 'https://amazon.in',
          domain: 'amazon.in',
          access_status: 'open',
          payout: '5.00',
          currency: 'INR',
          epc_7d: '4.10',
          is_featured: true,
          platforms: ['Web'],
        },
        {
          id: 102,
          name: 'Myntra',
          url: 'https://myntra.com',
          domain: 'myntra.com',
          access_status: 'approval_required',
          payout: '6.50',
          currency: 'INR',
          epc_7d: '2.80',
          is_featured: false,
          platforms: ['Web', 'Mobile Web'],
        },
      ];

      vi.spyOn(cuelinksService['client'], 'getCampaigns').mockResolvedValueOnce({
        data: mockCampaigns,
        meta: { total: 2, page: 1, per_page: 50 },
      });

      const summary = await cuelinksService.syncCampaigns({ page: 1, perPage: 50, maxPages: 1 });

      expect(summary.totalFetched).toBe(2);
      expect(summary.created).toBe(2);
      expect(summary.failed).toBe(0);
      expect(summary.status).toBe('COMPLETED');
      expect(testStore.cuelinksCampaigns).toHaveLength(2);

      // Verify sync status state
      const state = cuelinksService.getSyncStatus();
      expect(state.status).toBe('COMPLETED');
      expect(state.lastSyncedAt).toBeDefined();
    });

    it('should update existing campaigns and track unchanged items on subsequent sync', async () => {
      // Pre-seed campaign in store
      testStore.cuelinksCampaigns.push({
        id: 'camp-pre-1',
        externalCampaignId: 101,
        name: 'Amazon India',
        accessStatus: 'open',
        payout: '5.00',
        payoutCurrency: 'INR',
        epc7d: '4.10',
        isFeatured: true,
        lastSyncedAt: new Date(Date.now() - 100000),
        createdAt: new Date(),
        updatedAt: new Date(),
      });

      // Synchronize with updated payout
      const updatedCampaigns = [
        {
          id: 101,
          name: 'Amazon India',
          access_status: 'open',
          payout: '7.50', // Changed payout
          currency: 'INR',
          epc_7d: '4.10',
          is_featured: true,
        },
      ];

      vi.spyOn(cuelinksService['client'], 'getCampaigns').mockResolvedValueOnce({
        data: updatedCampaigns,
        meta: { total: 1, page: 1, per_page: 50 },
      });

      const summary = await cuelinksService.syncCampaigns({ page: 1, perPage: 50, maxPages: 1 });

      expect(summary.totalFetched).toBe(1);
      expect(summary.created).toBe(0);
      expect(summary.updated).toBe(1);
      expect(summary.failed).toBe(0);

      const updated = testStore.cuelinksCampaigns.find((c: any) => c.externalCampaignId === 101);
      expect(updated.payout).toBe('7.50');
    });
  });

  describe('Admin Campaign Endpoints & RBAC Guards', () => {
    beforeEach(() => {
      // Seed test campaigns in mockStore
      testStore.cuelinksCampaigns = [
        {
          id: 'camp-1',
          externalCampaignId: 201,
          name: 'Flipkart CPS',
          domain: 'flipkart.com',
          accessStatus: 'open',
          payout: '4.50',
          payoutCurrency: 'INR',
          epc7d: '3.50',
          category: 'Electronics',
          isFeatured: true,
          lastSyncedAt: new Date(),
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          id: 'camp-2',
          externalCampaignId: 202,
          name: 'Ajio Fashion',
          domain: 'ajio.com',
          accessStatus: 'approval_required',
          payout: '8.00',
          payoutCurrency: 'INR',
          epc7d: '1.90',
          category: 'Fashion',
          isFeatured: false,
          lastSyncedAt: new Date(),
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      ];
    });

    it('GET /api/v1/admin/integrations/cuelinks/campaigns - should list campaigns for Super Admin', async () => {
      const res = await request(app)
        .get('/api/v1/admin/integrations/cuelinks/campaigns')
        .set('Authorization', `Bearer ${superAdminToken}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data).toHaveLength(2);
      expect(res.body.pagination).toBeDefined();
      expect(res.body.pagination.total).toBe(2);
    });

    it('GET /api/v1/admin/integrations/cuelinks/campaigns - should filter by accessStatus', async () => {
      const res = await request(app)
        .get('/api/v1/admin/integrations/cuelinks/campaigns?accessStatus=open')
        .set('Authorization', `Bearer ${superAdminToken}`);

      expect(res.status).toBe(200);
      expect(res.body.data).toHaveLength(1);
      expect(res.body.data[0].name).toBe('Flipkart CPS');
    });

    it('GET /api/v1/admin/integrations/cuelinks/campaigns/:id - should get campaign details', async () => {
      const res = await request(app)
        .get('/api/v1/admin/integrations/cuelinks/campaigns/camp-1')
        .set('Authorization', `Bearer ${superAdminToken}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.name).toBe('Flipkart CPS');
      expect(res.body.data.externalCampaignId).toBe(201);
    });

    it('GET /api/v1/admin/integrations/cuelinks/campaigns/sync-status - should return current sync status', async () => {
      const res = await request(app)
        .get('/api/v1/admin/integrations/cuelinks/campaigns/sync-status')
        .set('Authorization', `Bearer ${superAdminToken}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.status).toBeDefined();
    });

    it('POST /api/v1/admin/integrations/cuelinks/campaigns/sync - should trigger sync for Super Admin', async () => {
      vi.spyOn(cuelinksService['client'], 'getCampaigns').mockResolvedValueOnce({
        data: [
          {
            id: 301,
            name: 'Tata CLiQ',
            access_status: 'open',
            payout: '4.00',
          },
        ],
        meta: { total: 1, page: 1, per_page: 50 },
      });

      const res = await request(app)
        .post('/api/v1/admin/integrations/cuelinks/campaigns/sync')
        .set('Authorization', `Bearer ${superAdminToken}`)
        .send({ maxPages: 1 });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.totalFetched).toBe(1);
    });

    it('POST /api/v1/admin/integrations/cuelinks/campaigns/:id/request-access - should submit access request', async () => {
      vi.spyOn(cuelinksService['client'], 'requestAccess').mockResolvedValueOnce({
        success: true,
        message: 'Access request submitted',
        status: 'pending',
      });

      const res = await request(app)
        .post('/api/v1/admin/integrations/cuelinks/campaigns/202/request-access')
        .set('Authorization', `Bearer ${superAdminToken}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.status).toBe('pending');
    });

    it('RBAC Guard: Unauthenticated users must be rejected with 401', async () => {
      const res = await request(app).get('/api/v1/admin/integrations/cuelinks/campaigns');
      expect(res.status).toBe(401);
    });

    it('RBAC Guard: Customer role must be forbidden with 403', async () => {
      const res = await request(app)
        .get('/api/v1/admin/integrations/cuelinks/campaigns')
        .set('Authorization', `Bearer ${customerToken}`);

      expect(res.status).toBe(403);
    });

    it('RBAC Guard: Product Manager role must be forbidden with 403', async () => {
      const res = await request(app)
        .get('/api/v1/admin/integrations/cuelinks/campaigns')
        .set('Authorization', `Bearer ${productManagerToken}`);

      expect(res.status).toBe(403);
    });
  });
});
