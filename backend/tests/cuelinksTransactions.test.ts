import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import request from 'supertest';
import { createApp } from '../src/app.js';
import { cuelinksClient } from '../src/infra/integrations/cuelinks/cuelinksClient.js';
import { cuelinksTransactionSyncService } from '../src/services/cuelinksTransactionSync.service.js';
import { cuelinksReportService } from '../src/services/cuelinksReport.service.js';
import { setupTestEnvironment } from './testHelper.js';

let app: any;
let superAdminToken: string;
let productManagerToken: string;
let customerToken: string;
let testStore: any;

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

describe('Cuelinks V3 Phase 4 — Transaction & Commission Tracking', () => {
  const originalFetch = globalThis.fetch;
  const originalApiKey = (cuelinksClient as any).apiKey;

  beforeEach(async () => {
    const env = await setupTestEnvironment();
    testStore = env.store;
    superAdminToken = env.superAdminToken;
    productManagerToken = env.productManagerToken;
    customerToken = env.customerToken;
    app = createApp();

    // Ensure mock client is configured
    process.env.CUELINKS_API_KEY = 'mock-cuelinks-api-key';
    (cuelinksClient as any).apiKey = 'mock-cuelinks-api-key';

    // Clear transaction store
    testStore.cuelinksTransactions = [];
    testStore.cuelinksTransactionSyncLogs = [];
  });

  afterEach(() => {
    globalThis.fetch = originalFetch;
    (cuelinksClient as any).apiKey = originalApiKey;
    vi.restoreAllMocks();
  });

  describe('1. CuelinksClient Transaction & Report Methods', () => {
    it('should query transactions with pagination and return mapped payload', async () => {
      globalThis.fetch = vi.fn().mockResolvedValue({
        ok: true,
        status: 200,
        json: async () => ({
          data: [
            {
              id: 987654,
              campaign_id: 4821,
              campaign_name: 'Flipkart CPS',
              transaction_date: '2026-11-20T10:00:00Z',
              status: 'pending',
              sale_amount: '1999.00',
              user_commission: '89.95',
              currency: 'INR',
              order_id: 'OD-112233',
            },
          ],
          meta: { total: 1, page: 1, per_page: 30 },
        }),
      } as any);

      const res = await cuelinksClient.getTransactions({ page: 1, per_page: 30 });

      expect(res.data).toHaveLength(1);
      expect(res.data[0].id).toBe(987654);
      expect(res.data[0].status).toBe('pending');
      expect(res.meta.total).toBe(1);
    });

    it('should query transaction by ID', async () => {
      globalThis.fetch = vi.fn().mockResolvedValue({
        ok: true,
        status: 200,
        json: async () => ({
          data: {
            id: 987654,
            campaign_id: 4821,
            status: 'validated',
            user_commission: '150.00',
          },
        }),
      } as any);

      const res = await cuelinksClient.getTransactionById(987654);
      expect(res.data.id).toBe(987654);
      expect(res.data.status).toBe('validated');
    });

    it('should query daily performance report', async () => {
      globalThis.fetch = vi.fn().mockResolvedValue({
        ok: true,
        status: 200,
        json: async () => ({
          data: [
            {
              date: '2026-11-20',
              clicks: 500,
              transactions: 25,
              commission: '1250.00',
              sale_amount: '25000.00',
              currency: 'INR',
            },
          ],
          meta: { total: 1 },
        }),
      } as any);

      const res = await cuelinksClient.getPerformanceReport({ start_date: '2026-11-01', end_date: '2026-11-20' });
      expect(res.data).toHaveLength(1);
      expect(res.data[0].clicks).toBe(500);
      expect(res.data[0].commission).toBe('1250.00');
    });

    it('should query monthly earnings report', async () => {
      globalThis.fetch = vi.fn().mockResolvedValue({
        ok: true,
        status: 200,
        json: async () => ({
          data: [
            {
              month: '2026-11',
              pending: '5000.00',
              validated: '3000.00',
              payable: '2000.00',
              claimed: '1000.00',
              rejected: '500.00',
              total: '11500.00',
              currency: 'INR',
            },
          ],
          meta: { total: 1 },
        }),
      } as any);

      const res = await cuelinksClient.getEarningsReport({ start_date: '2026-01-01', end_date: '2026-11-01' });
      expect(res.data).toHaveLength(1);
      expect(res.data[0].month).toBe('2026-11');
      expect(res.data[0].total).toBe('11500.00');
    });

    it('should throw AppError on API 401 Unauthorized', async () => {
      globalThis.fetch = vi.fn().mockResolvedValue({
        ok: false,
        status: 401,
      } as any);

      await expect(cuelinksClient.getTransactions()).rejects.toThrow();
    });
  });

  describe('2. Transaction Synchronization Service (Upserts & Reliability)', () => {
    it('should fetch and insert new transaction records', async () => {
      vi.spyOn(cuelinksClient, 'getTransactions').mockResolvedValueOnce({
        data: [
          {
            id: 1001,
            campaign_id: 4821,
            campaign_name: 'Flipkart CPS',
            transaction_date: '2026-11-20T10:00:00Z',
            status: 'pending',
            sale_amount: '2999.00',
            user_commission: '120.00',
            currency: 'INR',
            order_id: 'ORD-1001',
          },
        ],
        meta: { total: 1, page: 1, per_page: 100 },
      });

      const summary = await cuelinksTransactionSyncService.syncTransactions({ fullSync: true });

      expect(summary.status).toBe('COMPLETED');
      expect(summary.totalFetched).toBe(1);
      expect(summary.created).toBe(1);
      expect(summary.updated).toBe(0);
      expect(testStore.cuelinksTransactions).toHaveLength(1);
      expect(testStore.cuelinksTransactions[0].externalTransactionId).toBe('1001');
      expect(testStore.cuelinksTransactions[0].status).toBe('pending');
    });

    it('should update existing records and prevent duplicates when re-synced', async () => {
      // Seed existing transaction
      testStore.cuelinksTransactions.push({
        id: 'tx-existing-1',
        externalTransactionId: '1001',
        campaignId: 4821,
        transactionDate: new Date('2026-11-20T10:00:00Z'),
        status: 'pending',
        saleAmount: '2999.00',
        commissionAmount: '120.00',
        currency: 'INR',
        createdAt: new Date(),
        updatedAt: new Date(),
      });

      // API returns updated status from pending -> validated with revised commission
      vi.spyOn(cuelinksClient, 'getTransactions').mockResolvedValueOnce({
        data: [
          {
            id: 1001,
            campaign_id: 4821,
            campaign_name: 'Flipkart CPS',
            transaction_date: '2026-11-20T10:00:00Z',
            status: 'validated',
            sale_amount: '2999.00',
            user_commission: '145.00',
            currency: 'INR',
            order_id: 'ORD-1001',
          },
        ],
        meta: { total: 1, page: 1, per_page: 100 },
      });

      const summary = await cuelinksTransactionSyncService.syncTransactions({ fullSync: true });

      expect(summary.status).toBe('COMPLETED');
      expect(summary.totalFetched).toBe(1);
      expect(summary.created).toBe(0);
      expect(summary.updated).toBe(1);
      expect(testStore.cuelinksTransactions).toHaveLength(1); // No duplicates!
      expect(testStore.cuelinksTransactions[0].status).toBe('validated');
      expect(String(testStore.cuelinksTransactions[0].commissionAmount)).toContain('145');
    });

    it('should handle multi-page synchronization seamlessly', async () => {
      vi.spyOn(cuelinksClient, 'getTransactions')
        .mockResolvedValueOnce({
          data: [
            { id: 2001, transaction_date: '2026-11-19T00:00:00Z', status: 'pending', user_commission: '50' },
          ],
          meta: { total: 2, page: 1, per_page: 1 },
        })
        .mockResolvedValueOnce({
          data: [
            { id: 2002, transaction_date: '2026-11-20T00:00:00Z', status: 'validated', user_commission: '75' },
          ],
          meta: { total: 2, page: 2, per_page: 1 },
        });

      const summary = await cuelinksTransactionSyncService.syncTransactions({ perPage: 1, maxPages: 2 });

      expect(summary.totalFetched).toBe(2);
      expect(summary.created).toBe(2);
      expect(testStore.cuelinksTransactions).toHaveLength(2);
    });

    it('should perform incremental sync using updated_since with overlap window', async () => {
      const pastLogTime = new Date('2026-11-20T08:00:00Z');
      testStore.cuelinksTransactionSyncLogs.push({
        id: 'log-past-1',
        status: 'COMPLETED',
        startedAt: pastLogTime,
        completedAt: new Date('2026-11-20T08:05:00Z'),
        recordsFetched: 10,
      });

      const getSpy = vi.spyOn(cuelinksClient, 'getTransactions').mockResolvedValueOnce({
        data: [],
        meta: { total: 0, page: 1, per_page: 100 },
      });

      await cuelinksTransactionSyncService.syncTransactions({ overlapMinutes: 15 });

      expect(getSpy).toHaveBeenCalledTimes(1);
      const callArgs = getSpy.mock.calls[0][0];
      expect(callArgs?.updated_since).toBeDefined();
      // Should be pastLogTime minus 15 minutes (07:45:00Z)
      const expectedTime = new Date(pastLogTime.getTime() - 15 * 60 * 1000).toISOString();
      expect(callArgs?.updated_since).toBe(expectedTime);
    });

    it('should prevent concurrent synchronization executions', async () => {
      (cuelinksTransactionSyncService as any).isSyncInProgress = true;

      await expect(
        cuelinksTransactionSyncService.syncTransactions()
      ).rejects.toThrow('already in progress');

      (cuelinksTransactionSyncService as any).isSyncInProgress = false;
    });

    it('should gracefully handle null sale amount and null commission without crashing', async () => {
      vi.spyOn(cuelinksClient, 'getTransactions').mockResolvedValueOnce({
        data: [
          {
            id: 3001,
            transaction_date: '2026-11-20T10:00:00Z',
            status: 'pending',
            sale_amount: null,
            user_commission: null,
            currency: 'INR',
          },
        ],
        meta: { total: 1, page: 1, per_page: 100 },
      });

      const summary = await cuelinksTransactionSyncService.syncTransactions({ fullSync: true });

      expect(summary.created).toBe(1);
      expect(testStore.cuelinksTransactions[0].saleAmount).toBeNull();
      expect(testStore.cuelinksTransactions[0].commissionAmount).toBeNull();
    });

    it('should accurately store and separate USD and INR currencies', async () => {
      vi.spyOn(cuelinksClient, 'getTransactions').mockResolvedValueOnce({
        data: [
          {
            id: 4001,
            transaction_date: '2026-11-20T10:00:00Z',
            status: 'validated',
            sale_amount: '50.00',
            user_commission: '5.00',
            currency: 'USD',
          },
          {
            id: 4002,
            transaction_date: '2026-11-20T10:00:00Z',
            status: 'validated',
            sale_amount: '4000.00',
            user_commission: '400.00',
            currency: 'INR',
          },
        ],
        meta: { total: 2, page: 1, per_page: 100 },
      });

      await cuelinksTransactionSyncService.syncTransactions({ fullSync: true });

      const usdTx = testStore.cuelinksTransactions.find((t: any) => t.externalTransactionId === '4001');
      const inrTx = testStore.cuelinksTransactions.find((t: any) => t.externalTransactionId === '4002');
      expect(usdTx.currency).toBe('USD');
      expect(inrTx.currency).toBe('INR');
    });
  });

  describe('3. Report Services & Validation Guardrails', () => {
    it('should reject performance report queries exceeding 90 days', async () => {
      await expect(
        cuelinksReportService.getPerformanceReport({
          start_date: '2026-01-01',
          end_date: '2026-06-01', // 150 days > 90 days
        })
      ).rejects.toThrow('maximum allowed limit of 90 days');
    });

    it('should reject earnings report queries exceeding 24 months', async () => {
      await expect(
        cuelinksReportService.getEarningsReport({
          start_date: '2023-01-01',
          end_date: '2026-01-01', // 36 months > 24 months
        })
      ).rejects.toThrow('maximum allowed limit of 24 months');
    });

    it('should aggregate dashboard summary from reports when live Cuelinks is available', async () => {
      vi.spyOn(cuelinksReportService, 'getPerformanceReport').mockResolvedValueOnce({
        data: [
          {
            date: '2026-11-20',
            clicks: 120,
            transactions: 5,
            sale_amount: '10000.00',
            commission: '500.00',
            currency: 'INR',
          },
        ],
        meta: { total: 1, page: 1, per_page: 30 },
      });

      vi.spyOn(cuelinksReportService, 'getEarningsReport').mockResolvedValueOnce({
        data: [
          {
            month: '2026-11',
            pending: '200.00',
            validated: '150.00',
            payable: '100.00',
            claimed: '50.00',
            rejected: '0.00',
            total: '500.00',
            currency: 'INR',
          },
        ],
        meta: { total: 1, page: 1, per_page: 30 },
      });

      const summary = await cuelinksReportService.getDashboardSummary();

      expect(summary.isLiveAvailable).toBe(true);
      expect(summary.totalClicks).toBe(120);
      expect(summary.totalTransactions).toBe(5);
      expect(summary.totalSaleAmount).toBe('10000.00');
      expect(summary.totalCommission).toBe('500.00');
      expect(summary.pendingCommission).toBe('200.00');
      expect(summary.validatedCommission).toBe('150.00');
      expect(summary.payableCommission).toBe('100.00');
      expect(summary.claimedCommission).toBe('50.00');
    });

    it('should fallback to local database calculations when live reports fail', async () => {
      // Seed transactions
      testStore.cuelinksTransactions.push(
        {
          id: 'tx-fallback-1',
          externalTransactionId: '5001',
          transactionDate: new Date(),
          status: 'pending',
          saleAmount: '1000.00',
          commissionAmount: '50.00',
          currency: 'INR',
        },
        {
          id: 'tx-fallback-2',
          externalTransactionId: '5002',
          transactionDate: new Date(),
          status: 'payable',
          saleAmount: '2000.00',
          commissionAmount: '150.00',
          currency: 'INR',
        }
      );

      vi.spyOn(cuelinksClient, 'getPerformanceReport').mockRejectedValueOnce(
        new Error('Cuelinks performance report unavailable')
      );

      const summary = await cuelinksReportService.getDashboardSummary();

      expect(summary.isLiveAvailable).toBe(false);
      expect(summary.totalTransactions).toBe(2);
      expect(summary.totalSaleAmount).toBe('3000.00');
      expect(summary.totalCommission).toBe('200.00');
      expect(summary.pendingCommission).toBe('50.00');
      expect(summary.payableCommission).toBe('150.00');
    });
  });

  describe('4. Super Admin API Endpoints', () => {
    beforeEach(() => {
      testStore.cuelinksTransactions.push(
        {
          id: 'api-tx-1',
          externalTransactionId: '7001',
          campaignId: 4821,
          campaignName: 'Flipkart CPS',
          productName: 'Puma Shoes',
          orderId: 'ORD-7001',
          transactionDate: new Date('2026-11-20T12:00:00Z'),
          status: 'validated',
          saleAmount: '2500.00',
          commissionAmount: '125.00',
          currency: 'INR',
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          id: 'api-tx-2',
          externalTransactionId: '7002',
          campaignId: 101,
          campaignName: 'Amazon CPS',
          productName: 'Sony Earbuds',
          orderId: 'ORD-7002',
          transactionDate: new Date('2026-11-19T12:00:00Z'),
          status: 'pending',
          saleAmount: '1500.00',
          commissionAmount: '60.00',
          currency: 'INR',
          createdAt: new Date(),
          updatedAt: new Date(),
        }
      );
    });

    it('GET /api/v1/admin/integrations/cuelinks/transactions - should list transactions with pagination', async () => {
      const res = await request(app)
        .get('/api/v1/admin/integrations/cuelinks/transactions')
        .set('Authorization', `Bearer ${superAdminToken}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(Array.isArray(res.body.data)).toBe(true);
      expect(res.body.data).toHaveLength(2);
      expect(res.body.pagination).toBeDefined();
    });

    it('GET /api/v1/admin/integrations/cuelinks/transactions/:id - should get single transaction details', async () => {
      const res = await request(app)
        .get('/api/v1/admin/integrations/cuelinks/transactions/7001')
        .set('Authorization', `Bearer ${superAdminToken}`);

      expect(res.status).toBe(200);
      expect(res.body.data.externalTransactionId).toBe('7001');
      expect(res.body.data.productName).toBe('Puma Shoes');
    });

    it('GET /api/v1/admin/integrations/cuelinks/transactions/sync-status - should return sync state', async () => {
      const res = await request(app)
        .get('/api/v1/admin/integrations/cuelinks/transactions/sync-status')
        .set('Authorization', `Bearer ${superAdminToken}`);

      expect(res.status).toBe(200);
      expect(res.body.data.isSyncInProgress).toBe(false);
      expect(res.body.data.totalTransactions).toBe(2);
    });

    it('POST /api/v1/admin/integrations/cuelinks/transactions/sync - should trigger manual sync', async () => {
      vi.spyOn(cuelinksClient, 'getTransactions').mockResolvedValueOnce({
        data: [],
        meta: { total: 0, page: 1, per_page: 100 },
      });

      const res = await request(app)
        .post('/api/v1/admin/integrations/cuelinks/transactions/sync')
        .set('Authorization', `Bearer ${superAdminToken}`)
        .send({ fullSync: false });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.status).toBe('COMPLETED');
    });

    it('GET /api/v1/admin/integrations/cuelinks/reports/performance - should return performance report', async () => {
      vi.spyOn(cuelinksClient, 'getPerformanceReport').mockResolvedValueOnce({
        data: [
          {
            date: '2026-11-20',
            clicks: 100,
            transactions: 4,
            commission: '200.00',
            sale_amount: '4000.00',
          },
        ],
        meta: { total: 1, page: 1, per_page: 30 },
      });

      const res = await request(app)
        .get('/api/v1/admin/integrations/cuelinks/reports/performance')
        .set('Authorization', `Bearer ${superAdminToken}`);

      expect(res.status).toBe(200);
      expect(Array.isArray(res.body.data)).toBe(true);
      expect(res.body.data[0].clicks).toBe(100);
    });

    it('GET /api/v1/admin/integrations/cuelinks/reports/earnings - should return earnings report', async () => {
      vi.spyOn(cuelinksClient, 'getEarningsReport').mockResolvedValueOnce({
        data: [
          {
            month: '2026-11',
            pending: '1000.00',
            validated: '800.00',
            payable: '500.00',
            claimed: '200.00',
            rejected: '50.00',
            total: '2550.00',
          },
        ],
        meta: { total: 1, page: 1, per_page: 30 },
      });

      const res = await request(app)
        .get('/api/v1/admin/integrations/cuelinks/reports/earnings')
        .set('Authorization', `Bearer ${superAdminToken}`);

      expect(res.status).toBe(200);
      expect(Array.isArray(res.body.data)).toBe(true);
      expect(res.body.data[0].month).toBe('2026-11');
    });

    it('GET /api/v1/admin/integrations/cuelinks/dashboard-summary - should return aggregated dashboard summary', async () => {
      const res = await request(app)
        .get('/api/v1/admin/integrations/cuelinks/dashboard-summary')
        .set('Authorization', `Bearer ${superAdminToken}`);

      expect(res.status).toBe(200);
      expect(res.body.data.currency).toBeDefined();
      expect(res.body.data.totalTransactions).toBeDefined();
    });
  });

  describe('5. RBAC & Security Enforcement', () => {
    it('should forbid Product Manager from accessing transaction records', async () => {
      const res = await request(app)
        .get('/api/v1/admin/integrations/cuelinks/transactions')
        .set('Authorization', `Bearer ${productManagerToken}`);

      expect(res.status).toBe(403);
    });

    it('should forbid Product Manager from triggering global transaction sync', async () => {
      const res = await request(app)
        .post('/api/v1/admin/integrations/cuelinks/transactions/sync')
        .set('Authorization', `Bearer ${productManagerToken}`)
        .send({});

      expect(res.status).toBe(403);
    });

    it('should forbid Customer from accessing reports and transactions', async () => {
      const res1 = await request(app)
        .get('/api/v1/admin/integrations/cuelinks/transactions')
        .set('Authorization', `Bearer ${customerToken}`);
      expect(res1.status).toBe(403);

      const res2 = await request(app)
        .get('/api/v1/admin/integrations/cuelinks/reports/performance')
        .set('Authorization', `Bearer ${customerToken}`);
      expect(res2.status).toBe(403);

      const res3 = await request(app)
        .get('/api/v1/admin/integrations/cuelinks/dashboard-summary')
        .set('Authorization', `Bearer ${customerToken}`);
      expect(res3.status).toBe(403);
    });

    it('should reject unauthenticated requests with 401', async () => {
      const res = await request(app)
        .get('/api/v1/admin/integrations/cuelinks/transactions');

      expect(res.status).toBe(401);
    });
  });
});
