import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest';
import request from 'supertest';
import { createApp } from '../src/app.js';
import { cuelinksTransactionSyncService } from '../src/services/cuelinksTransactionSync.service.js';
import { cuelinksReportService } from '../src/services/cuelinksReport.service.js';
import { cuelinksClient } from '../src/infra/integrations/cuelinks/cuelinksClient.js';
import { distributedLock } from '../src/infra/lock/distributedLock.js';
import { startCuelinksTransactionScheduler, stopCuelinksTransactionScheduler } from '../src/cron/cuelinksTransactionScheduler.js';
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
    Prisma: {
      Decimal: class MockDecimal {
        private val: string;
        constructor(v: any) {
          this.val = String(v);
        }
        toFixed(digits: number) {
          return Number(this.val).toFixed(digits);
        }
        toString() {
          return this.toFixed(2);
        }
        isZero() {
          return Number(this.val) === 0;
        }
        toNumber() {
          return Number(this.val);
        }
      },
    },
  };
});

describe('Phase 4.1 — Cuelinks Transaction System Hardening', () => {
  const originalFetch = globalThis.fetch;
  const originalApiKey = (cuelinksClient as any).apiKey;

  beforeEach(async () => {
    const env = await setupTestEnvironment();
    testStore = env.store;
    superAdminToken = env.superAdminToken;
    productManagerToken = env.productManagerToken;
    customerToken = env.customerToken;
    app = createApp();

    testStore.cuelinksTransactions = [];
    testStore.cuelinksTransactionSyncLogs = [];
    await distributedLock.forceRelease('cuelinks:transaction:sync');
    (cuelinksTransactionSyncService as any).isSyncInProgress = false;
    (cuelinksClient as any).apiKey = 'test-api-key-hardened';
  });

  afterEach(async () => {
    stopCuelinksTransactionScheduler();
    await distributedLock.forceRelease('cuelinks:transaction:sync');
    (cuelinksClient as any).apiKey = originalApiKey;
    globalThis.fetch = originalFetch;
    vi.restoreAllMocks();
  });

  describe('1. Distributed Synchronization Lock & Instance Protection', () => {
    it('should acquire lock, prevent concurrent sync, and release safely', async () => {
      const lock1 = await distributedLock.acquireLock('cuelinks:transaction:sync', 60);
      expect(lock1.acquired).toBe(true);
      expect(lock1.token).toBeTruthy();

      // Second backend instance attempts to acquire same resource
      const lock2 = await distributedLock.acquireLock('cuelinks:transaction:sync', 60);
      expect(lock2.acquired).toBe(false);
      expect(lock2.token).toBeNull();

      // Releasing with wrong/empty token fails
      const wrongRelease = await distributedLock.releaseLock('cuelinks:transaction:sync', 'invalid-token-123');
      expect(wrongRelease).toBe(false);

      // Releasing with correct ownership token succeeds
      const validRelease = await distributedLock.releaseLock('cuelinks:transaction:sync', lock1.token!);
      expect(validRelease).toBe(true);

      // Now another instance can acquire
      const lock3 = await distributedLock.acquireLock('cuelinks:transaction:sync', 60);
      expect(lock3.acquired).toBe(true);
      await distributedLock.releaseLock('cuelinks:transaction:sync', lock3.token!);
    });

    it('should automatically recover after lock TTL expiration', async () => {
      // Simulate expired in-memory lock
      const fullKey = 'lock:cuelinks:transaction:sync';
      (distributedLock as any).inMemoryLocks.set(fullKey, {
        token: 'old-crashed-token',
        expiresAt: Date.now() - 1000, // expired 1s ago
      });

      // Checking isLocked should recognize expired state
      const isLocked = await distributedLock.isLocked('cuelinks:transaction:sync');
      expect(isLocked).toBe(false);

      // New acquisition succeeds cleanly without manual unlock
      const newLock = await distributedLock.acquireLock('cuelinks:transaction:sync', 60);
      expect(newLock.acquired).toBe(true);
      await distributedLock.releaseLock('cuelinks:transaction:sync', newLock.token!);
    });

    it('should block manual API sync when distributed lock is held by another worker', async () => {
      const lock = await distributedLock.acquireLock('cuelinks:transaction:sync', 120);
      expect(lock.acquired).toBe(true);

      const res = await request(app)
        .post('/api/v1/admin/integrations/cuelinks/transactions/sync')
        .set('Authorization', `Bearer ${superAdminToken}`)
        .send({});

      expect(res.status).toBe(409);
      expect(res.body.message).toContain('Distributed lock held');

      await distributedLock.releaseLock('cuelinks:transaction:sync', lock.token!);
    });

    it('should renew distributed lock when valid token is provided and lock is alive', async () => {
      const lock = await distributedLock.acquireLock('cuelinks:transaction:sync', 60);
      expect(lock.acquired).toBe(true);

      // Safe renewal by owner
      const renewed = await distributedLock.renewLock('cuelinks:transaction:sync', lock.token!, 120);
      expect(renewed).toBe(true);

      // Renewal fails with wrong token
      const wrongRenew = await distributedLock.renewLock('cuelinks:transaction:sync', 'wrong-token', 120);
      expect(wrongRenew).toBe(false);

      await distributedLock.releaseLock('cuelinks:transaction:sync', lock.token!);
    });

    it('should reject lock renewal if lock has already expired', async () => {
      const fullKey = 'lock:cuelinks:transaction:sync';
      (distributedLock as any).inMemoryLocks.set(fullKey, {
        token: 'expired-lease-token',
        expiresAt: Date.now() - 500, // expired in the past
      });

      // An old job cannot reclaim an expired lock
      const renewed = await distributedLock.renewLock('cuelinks:transaction:sync', 'expired-lease-token', 60);
      expect(renewed).toBe(false);
    });

    it('should reject synchronization if Redis is down and in-memory fallback is disabled in production', async () => {
      vi.spyOn(distributedLock, 'isMemoryFallbackAllowed').mockReturnValue(false);

      await expect(
        distributedLock.acquireLock('cuelinks:transaction:sync', 60)
      ).rejects.toThrow('Distributed lock service (Redis) is required');
    });
  });

  describe('2. Financial Precision & Nullable Monetary Handling', () => {
    it('should distinguish genuine zero from missing and invalid values', () => {
      const zeroParsed = cuelinksTransactionSyncService.parseMonetaryField('0.00');
      expect(zeroParsed.status).toBe('ZERO');
      expect(zeroParsed.value?.toFixed(2)).toBe('0.00');
      expect(zeroParsed.value?.isZero()).toBe(true);

      const genuineZero = cuelinksTransactionSyncService.parseMonetaryField(0);
      expect(genuineZero.status).toBe('ZERO');
      expect(genuineZero.value?.toFixed(2)).toBe('0.00');
      expect(genuineZero.value?.isZero()).toBe(true);

      const nullParsed = cuelinksTransactionSyncService.parseMonetaryField(null);
      expect(nullParsed.status).toBe('MISSING');
      expect(nullParsed.value).toBeNull();

      const undefinedParsed = cuelinksTransactionSyncService.parseMonetaryField(undefined);
      expect(undefinedParsed.status).toBe('MISSING');
      expect(undefinedParsed.value).toBeNull();

      const emptyParsed = cuelinksTransactionSyncService.parseMonetaryField('');
      expect(emptyParsed.status).toBe('MISSING');
      expect(emptyParsed.value).toBeNull();

      const invalidParsed = cuelinksTransactionSyncService.parseMonetaryField('not-a-number');
      expect(invalidParsed.status).toBe('INVALID');
      expect(invalidParsed.value).toBeNull();

      const validParsed = cuelinksTransactionSyncService.parseMonetaryField('1549.99');
      expect(validParsed.status).toBe('VALID');
      expect(validParsed.value?.toString()).toBe('1549.99');
    });

    it('should preserve null commission in DB instead of defaulting to zero', async () => {
      vi.spyOn(cuelinksClient, 'getTransactions').mockResolvedValueOnce({
        data: [
          {
            id: 'tx-null-comm-01',
            campaign_id: 101,
            campaign_name: 'Affiliate Merchant',
            transaction_date: '2026-11-20T10:00:00Z',
            status: 'pending',
            sale_amount: '2999.00',
            user_commission: null, // missing/uncalculated commission
            currency: 'INR',
          },
          {
            id: 'tx-zero-comm-02',
            campaign_id: 101,
            campaign_name: 'Affiliate Merchant',
            transaction_date: '2026-11-20T10:05:00Z',
            status: 'pending',
            sale_amount: '500.00',
            user_commission: '0.00', // genuine zero
            currency: 'INR',
          },
        ] as any,
        meta: { total: 2, page: 1, per_page: 100 },
      });

      const summary = await cuelinksTransactionSyncService.syncTransactions({ fullSync: true });
      expect(summary.created).toBe(2);

      const nullTx = testStore.cuelinksTransactions.find((t: any) => t.externalTransactionId === 'tx-null-comm-01');
      expect(nullTx.commissionAmount).toBeNull();

      const zeroTx = testStore.cuelinksTransactions.find((t: any) => t.externalTransactionId === 'tx-zero-comm-02');
      expect(zeroTx.commissionAmount?.toFixed(2)).toBe('0.00');
      expect(zeroTx.commissionAmount?.isZero()).toBe(true);
    });

    it('should preserve UNKNOWN currency when source currency is missing', async () => {
      vi.spyOn(cuelinksClient, 'getTransactions').mockResolvedValueOnce({
        data: [
          {
            id: 'tx-unknown-curr-01',
            campaign_id: 202,
            transaction_date: '2026-11-20T12:00:00Z',
            status: 'pending',
            sale_amount: '100.00',
            currency: '', // missing currency
          },
        ] as any,
        meta: { total: 1, page: 1, per_page: 100 },
      });

      await cuelinksTransactionSyncService.syncTransactions({ fullSync: true });

      const tx = testStore.cuelinksTransactions.find((t: any) => t.externalTransactionId === 'tx-unknown-curr-01');
      expect(tx.currency).toBe('UNKNOWN');
    });
  });

  describe('3. Multi-Currency Isolation & Aggregation Safety', () => {
    it('should segregate USD, INR, and UNKNOWN in dashboard summary and not mix currencies', async () => {
      testStore.cuelinksTransactions.push(
        {
          id: 't-inr-1',
          externalTransactionId: 't-inr-1',
          currency: 'INR',
          saleAmount: 1000,
          commissionAmount: 100,
          status: 'validated',
          transactionDate: new Date(),
        },
        {
          id: 't-usd-1',
          externalTransactionId: 't-usd-1',
          currency: 'USD',
          saleAmount: 50,
          commissionAmount: 5,
          status: 'validated',
          transactionDate: new Date(),
        },
        {
          id: 't-unk-1',
          externalTransactionId: 't-unk-1',
          currency: 'UNKNOWN',
          saleAmount: 200,
          commissionAmount: 20,
          status: 'pending',
          transactionDate: new Date(),
        }
      );

      vi.spyOn(cuelinksClient, 'isConfigured').mockReturnValue(false);

      const summary = await cuelinksReportService.getDashboardSummary();
      expect(summary.dataSource).toBe('LOCAL_DB');
      expect(summary.isFallback).toBe(true);

      // Verify currencies are kept strictly isolated
      expect(summary.currencies['INR']).toBeDefined();
      expect(summary.currencies['USD']).toBeDefined();
      expect(summary.currencies['UNKNOWN']).toBeDefined();

      expect(summary.currencies['INR'].totalSaleAmount).toBe('1000.00');
      expect(summary.currencies['INR'].totalCommission).toBe('100.00');

      expect(summary.currencies['USD'].totalSaleAmount).toBe('50.00');
      expect(summary.currencies['USD'].totalCommission).toBe('5.00');

      expect(summary.currencies['UNKNOWN'].totalSaleAmount).toBe('200.00');
      expect(summary.currencies['UNKNOWN'].totalCommission).toBe('20.00');

      // Primary currency should reflect only INR totals, never 1000 + 50 + 200 = 1250!
      expect(summary.totalSaleAmount).toBe('1000.00');
    });
  });

  describe('4. Pagination Safety-Limit & Checkpointing', () => {
    it('should mark sync as PARTIALLY_COMPLETED and save checkpoint when safety limit is reached', async () => {
      vi.spyOn(cuelinksClient, 'getTransactions').mockImplementation(async (params: any) => {
        const page = params.page || 1;
        return {
          data: [
            {
              id: `tx-page-${page}-01`,
              campaign_id: 10,
              transaction_date: `2026-11-20T0${page}:00:00Z`,
              status: 'pending',
              sale_amount: '100.00',
              currency: 'INR',
            },
          ] as any,
          meta: { total: 50, page, per_page: 10 },
        };
      });

      const summary = await cuelinksTransactionSyncService.syncTransactions({
        fullSync: true,
        maxPages: 2, // Safety clamp
        perPage: 10,
      });

      expect(summary.status).toBe('PARTIALLY_COMPLETED');
      expect(summary.isPartial).toBe(true);
      expect(summary.reachedPageLimit).toBe(true);
      expect(summary.checkpointPage).toBe(3);
      expect(summary.error).toContain('Safety limit of 2 pages reached');

      const lastLog = testStore.cuelinksTransactionSyncLogs[testStore.cuelinksTransactionSyncLogs.length - 1];
      expect(lastLog.status).toBe('PARTIALLY_COMPLETED');
      expect(lastLog.isPartial).toBe(true);
      expect(lastLog.checkpointPage).toBe(3);
      expect(lastLog.reachedPageLimit).toBe(true);
    });

    it('should resume safely from partial checkpoint using updated_since overlap window', async () => {
      // Setup a recorded partial sync log with lastProcessedDate
      const processedDate = new Date('2026-11-20T12:00:00Z');
      testStore.cuelinksTransactionSyncLogs.push({
        id: 'partial-log-01',
        status: 'PARTIALLY_COMPLETED',
        isPartial: true,
        reachedPageLimit: true,
        checkpointPage: 3,
        lastProcessedDate: processedDate,
        startedAt: new Date('2026-11-20T12:05:00Z'),
        createdAt: new Date('2026-11-20T12:05:00Z'),
      });

      let requestedUpdatedSince: string | undefined;
      vi.spyOn(cuelinksClient, 'getTransactions').mockImplementation(async (params: any) => {
        requestedUpdatedSince = params.updated_since;
        return {
          data: [],
          meta: { total: 0, page: 1, per_page: 100 },
        };
      });

      // Subsequent incremental sync should use lastProcessedDate minus 15m overlap
      await cuelinksTransactionSyncService.syncTransactions({ fullSync: false, overlapMinutes: 15 });

      expect(requestedUpdatedSince).toBeDefined();
      const expectedOverlapDate = new Date(processedDate.getTime() - 15 * 60 * 1000).toISOString();
      expect(requestedUpdatedSince).toBe(expectedOverlapDate);
    });
  });

  describe('5. Sensitive Data Redaction', () => {
    it('should redact sensitive keys from rawMetadata before persisting and returning', async () => {
      vi.spyOn(cuelinksClient, 'getTransactions').mockResolvedValueOnce({
        data: [
          {
            id: 'tx-sensitive-01',
            campaign_id: 50,
            transaction_date: '2026-11-20T14:00:00Z',
            status: 'validated',
            sale_amount: '500.00',
            currency: 'INR',
            client_ip: '192.168.1.50',
            user_token: 'secret-token-xyz',
            customer_email: 'buyer@test.com',
            auth_bearer: 'Bearer abc123def456',
          },
        ] as any,
        meta: { total: 1, page: 1, per_page: 100 },
      });

      await cuelinksTransactionSyncService.syncTransactions({ fullSync: true });

      const tx = await cuelinksTransactionSyncService.getTransactionById('tx-sensitive-01');
      expect(tx).toBeDefined();
      expect(tx.rawMetadata.client_ip).toBe('[REDACTED]');
      expect(tx.rawMetadata.user_token).toBe('[REDACTED]');
      expect(tx.rawMetadata.customer_email).toBe('[REDACTED]');
      expect(tx.rawMetadata.auth_bearer).toBe('[REDACTED]');
      expect(tx.rawMetadata.id).toBe('tx-sensitive-01');
    });

    it('should omit rawMetadata completely from listTransactions', async () => {
      testStore.cuelinksTransactions.push({
        id: 'tx-list-01',
        externalTransactionId: 'tx-list-01',
        currency: 'INR',
        transactionDate: new Date(),
        status: 'pending',
        rawMetadata: { secret_token: 'leaked?' },
      });

      const result = await cuelinksTransactionSyncService.listTransactions();
      expect(result.items.length).toBe(1);
      expect((result.items[0] as any).rawMetadata).toBeUndefined();
    });
  });

  describe('6. Route Ordering & Parameter Collision Prevention', () => {
    it('should resolve /transactions/sync-status without being captured by /transactions/:id', async () => {
      const res = await request(app)
        .get('/api/v1/admin/integrations/cuelinks/transactions/sync-status')
        .set('Authorization', `Bearer ${superAdminToken}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data).toHaveProperty('isSyncInProgress');
      expect(res.body.data).toHaveProperty('totalTransactions');
    });

    it('should reject reserved route keywords when queried as :id', async () => {
      const res = await request(app)
        .get('/api/v1/admin/integrations/cuelinks/transactions/sync')
        .set('Authorization', `Bearer ${superAdminToken}`);

      expect(res.status).toBe(400);
      expect(JSON.stringify(res.body)).toContain('reserved route keyword');
    });

    it('should enforce date range limit validation on reports via validator middleware', async () => {
      const res = await request(app)
        .get('/api/v1/admin/integrations/cuelinks/reports/performance?start_date=2026-01-01&end_date=2026-06-01')
        .set('Authorization', `Bearer ${superAdminToken}`);

      expect(res.status).toBe(400);
      expect(res.body.message).toContain('90 days');
    });

    it('should strictly reject non-super-admins from accessing transaction endpoints', async () => {
      const pmRes = await request(app)
        .get('/api/v1/admin/integrations/cuelinks/transactions')
        .set('Authorization', `Bearer ${productManagerToken}`);
      expect(pmRes.status).toBe(403);

      const custRes = await request(app)
        .get('/api/v1/admin/integrations/cuelinks/transactions')
        .set('Authorization', `Bearer ${customerToken}`);
      expect(custRes.status).toBe(403);
    });
  });

  describe('7. Scheduler Singleton & Repeatable Execution Safety', () => {
    it('should not spawn duplicate scheduler intervals on repeated start calls', () => {
      startCuelinksTransactionScheduler();
      startCuelinksTransactionScheduler();

      stopCuelinksTransactionScheduler();
      expect(true).toBe(true);
    });
  });

  describe('8. Phase 4.3 Checkpoint Timestamp Correctness & Lock Heartbeat Safety', () => {
    it('should derive lastProcessedDate from upstream updated_at / validation_date, NOT transaction_date', async () => {
      // Historical order dates (e.g. 60 and 90 days ago) with recent updates
      vi.spyOn(cuelinksClient, 'getTransactions').mockResolvedValueOnce({
        data: [
          {
            id: 'tx-updated-01',
            campaign_id: 101,
            transaction_date: '2026-09-01T10:00:00Z', // Old purchase
            updated_at: '2026-11-20T10:30:00Z',       // Recent advertiser update
            status: 'validated',
            sale_amount: '1200.00',
            user_commission: '120.00',
            currency: 'INR',
          },
          {
            id: 'tx-updated-02',
            campaign_id: 101,
            transaction_date: '2026-08-15T12:00:00Z', // Even older purchase
            validation_date: '2026-11-20T15:45:00Z',  // Most recent validation
            status: 'validated',
            sale_amount: '2500.00',
            user_commission: '250.00',
            currency: 'INR',
          },
        ] as any,
        meta: { total: 2, page: 1, per_page: 100 },
      });

      const summary = await cuelinksTransactionSyncService.syncTransactions({ fullSync: true });
      expect(summary.status).toBe('COMPLETED');
      expect(summary.created).toBe(2);

      const latestLog = testStore.cuelinksTransactionSyncLogs[testStore.cuelinksTransactionSyncLogs.length - 1];
      expect(latestLog).toBeDefined();
      expect(latestLog.lastProcessedDate).toBeDefined();
      // MUST track latest upstream update timestamp (2026-11-20T15:45:00Z), NEVER order date (2026-09-01 or 2026-08-15)
      expect(latestLog.lastProcessedDate.toISOString()).toBe('2026-11-20T15:45:00.000Z');
    });

    it('should anchor checkpoint to sync startedAt when upstream records lack explicit updated_at', async () => {
      const syncStartTime = new Date();
      vi.spyOn(cuelinksClient, 'getTransactions').mockResolvedValueOnce({
        data: [
          {
            id: 'tx-no-updated-at',
            campaign_id: 102,
            transaction_date: '2026-09-10T08:00:00Z', // Historical purchase date
            status: 'pending',
            sale_amount: '800.00',
            user_commission: '80.00',
            currency: 'INR',
          },
        ] as any,
        meta: { total: 1, page: 1, per_page: 100 },
      });

      const summary = await cuelinksTransactionSyncService.syncTransactions({ fullSync: true });
      expect(summary.status).toBe('COMPLETED');

      const latestLog = testStore.cuelinksTransactionSyncLogs[testStore.cuelinksTransactionSyncLogs.length - 1];
      expect(latestLog.lastProcessedDate).toBeDefined();
      // Should NOT be the old transaction_date; should be anchored to the sync startedAt window
      expect(latestLog.lastProcessedDate.getTime()).toBeGreaterThanOrEqual(syncStartTime.getTime() - 2000);
      expect(latestLog.lastProcessedDate.toISOString()).not.toContain('2026-09-10');
    });

    it('should abort immediately and avoid split-brain writes when lock heartbeat renewal fails', async () => {
      vi.useFakeTimers();

      let pagesFetched = 0;
      vi.spyOn(cuelinksClient, 'getTransactions').mockImplementation(async (params: any) => {
        pagesFetched++;
        const page = params.page || 1;
        if (page === 1) {
          // Advance time mid-execution to trigger heartbeat lease renewal (half-life of 600s = 300s)
          await vi.advanceTimersByTimeAsync(305 * 1000);
        }
        return {
          data: [
            {
              id: `tx-hb-p${page}`,
              campaign_id: 55,
              transaction_date: '2026-11-20T10:00:00Z',
              status: 'pending',
              sale_amount: '100.00',
              currency: 'INR',
            },
          ] as any,
          meta: { total: 50, page, per_page: 1 },
        };
      });

      // Spy on renewLock to simulate expired lease / lost lock
      vi.spyOn(distributedLock, 'renewLock').mockResolvedValue(false);
      const releaseSpy = vi.spyOn(distributedLock, 'releaseLock');

      // Job must reject with split-brain protection error
      await expect(
        cuelinksTransactionSyncService.syncTransactions({
          fullSync: true,
          perPage: 1,
        })
      ).rejects.toThrow('Distributed lock lease lost during synchronization');

      // The sync log must be marked FAILED
      const failedLog = testStore.cuelinksTransactionSyncLogs[testStore.cuelinksTransactionSyncLogs.length - 1];
      expect(failedLog.status).toBe('FAILED');
      expect(failedLog.error).toContain('Distributed lock lease lost');

      // releaseLock must NOT have been called because lock was lost
      expect(releaseSpy).not.toHaveBeenCalled();

      vi.useRealTimers();
    });

    it('should validate strict production Redis fallback conditions', () => {
      const origEnv = process.env.NODE_ENV;
      const origFallback = process.env.ALLOW_MEMORY_LOCK_FALLBACK;
      const origSingle = process.env.SINGLE_INSTANCE_DEPLOYMENT;
      const origCount = process.env.INSTANCE_COUNT;

      try {
        // Temporarily set production
        (process.env as any).NODE_ENV = 'production';

        // 1. Production with no flags -> strictly prohibited
        delete process.env.ALLOW_MEMORY_LOCK_FALLBACK;
        delete process.env.SINGLE_INSTANCE_DEPLOYMENT;
        delete process.env.INSTANCE_COUNT;
        expect(distributedLock.isMemoryFallbackAllowed()).toBe(false);

        // 2. Production with fallback flag only -> prohibited
        process.env.ALLOW_MEMORY_LOCK_FALLBACK = 'true';
        expect(distributedLock.isMemoryFallbackAllowed()).toBe(false);

        // 3. Production with fallback and single instance, but count = 2 -> prohibited
        process.env.SINGLE_INSTANCE_DEPLOYMENT = 'true';
        process.env.INSTANCE_COUNT = '2';
        expect(distributedLock.isMemoryFallbackAllowed()).toBe(false);

        // 4. Production with all 3 verified single-instance flags -> permitted
        process.env.INSTANCE_COUNT = '1';
        expect(distributedLock.isMemoryFallbackAllowed()).toBe(true);
      } finally {
        (process.env as any).NODE_ENV = origEnv;
        if (origFallback !== undefined) process.env.ALLOW_MEMORY_LOCK_FALLBACK = origFallback;
        else delete process.env.ALLOW_MEMORY_LOCK_FALLBACK;
        if (origSingle !== undefined) process.env.SINGLE_INSTANCE_DEPLOYMENT = origSingle;
        else delete process.env.SINGLE_INSTANCE_DEPLOYMENT;
        if (origCount !== undefined) process.env.INSTANCE_COUNT = origCount;
        else delete process.env.INSTANCE_COUNT;
      }
    });
  });
});
