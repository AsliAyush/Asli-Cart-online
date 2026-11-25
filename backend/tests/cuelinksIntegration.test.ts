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
    },
    prisma: {
      user: {
        findUnique: (args: any) => (globalThis as any).currentMockPrisma.user.findUnique(args),
      },
    },
  };
});

describe('Cuelinks V3 Integration Test Suite', () => {
  const originalFetch = globalThis.fetch;

  beforeEach(async () => {
    const env = await setupTestEnvironment();
    superAdminToken = env.superAdminToken;
    productManagerToken = env.productManagerToken;
    customerToken = env.customerToken;
    app = createApp();
  });

  afterEach(() => {
    globalThis.fetch = originalFetch;
    vi.restoreAllMocks();
  });

  describe('CuelinksClient Unit Tests', () => {
    it('Scenario 1: should return NOT_CONFIGURED when API key is missing or blank', async () => {
      const client = new CuelinksClient({ apiKey: '', baseUrl: 'https://developers.cuelinks.com/pub_api/v3' });
      expect(client.isConfigured()).toBe(false);

      const result = await client.ping();
      expect(result.configured).toBe(false);
      expect(result.connected).toBe(false);
      expect(result.errorCategory).toBe('NOT_CONFIGURED');
      expect(result.message).toContain('not configured');
    });

    it('Scenario 2: should return success (200 OK) when Cuelinks responds with 200', async () => {
      globalThis.fetch = vi.fn().mockResolvedValue({
        ok: true,
        status: 200,
        json: async () => ({ status: 'pong', message: 'alive' }),
      } as any);

      const client = new CuelinksClient({ apiKey: 'valid-test-api-key', baseUrl: 'https://developers.cuelinks.com/pub_api/v3' });
      expect(client.isConfigured()).toBe(true);

      const result = await client.ping();
      expect(result.configured).toBe(true);
      expect(result.connected).toBe(true);
      expect(result.statusCode).toBe(200);
      expect(result.latencyMs).toBeGreaterThanOrEqual(0);
      expect(result.message).toBe('Successfully connected to Cuelinks V3 API');
      expect(result.details).toEqual({ status: 'pong', message: 'alive' });
    });

    it('Scenario 3: should handle 401 Unauthorized as AUTHENTICATION_FAILED', async () => {
      globalThis.fetch = vi.fn().mockResolvedValue({
        ok: false,
        status: 401,
        json: async () => ({ error: 'Invalid API Token' }),
      } as any);

      const client = new CuelinksClient({ apiKey: 'invalid-test-api-key', baseUrl: 'https://developers.cuelinks.com/pub_api/v3' });
      const result = await client.ping();

      expect(result.configured).toBe(true);
      expect(result.connected).toBe(false);
      expect(result.statusCode).toBe(401);
      expect(result.errorCategory).toBe('AUTHENTICATION_FAILED');
      expect(result.message).toContain('Authentication failed');
    });

    it('Scenario 4: should handle 403 Forbidden as PERMISSION_DENIED', async () => {
      globalThis.fetch = vi.fn().mockResolvedValue({
        ok: false,
        status: 403,
        json: async () => ({ error: 'Access denied' }),
      } as any);

      const client = new CuelinksClient({ apiKey: 'forbidden-key', baseUrl: 'https://developers.cuelinks.com/pub_api/v3' });
      const result = await client.ping();

      expect(result.configured).toBe(true);
      expect(result.connected).toBe(false);
      expect(result.statusCode).toBe(403);
      expect(result.errorCategory).toBe('PERMISSION_DENIED');
      expect(result.message).toContain('Permission denied');
    });

    it('Scenario 5: should handle timeout/AbortError as TIMEOUT', async () => {
      globalThis.fetch = vi.fn().mockImplementation(() => {
        const error = new Error('The operation was aborted');
        error.name = 'TimeoutError';
        return Promise.reject(error);
      });

      const client = new CuelinksClient({ apiKey: 'test-key', baseUrl: 'https://developers.cuelinks.com/pub_api/v3', timeoutMs: 100 });
      const result = await client.ping();

      expect(result.configured).toBe(true);
      expect(result.connected).toBe(false);
      expect(result.errorCategory).toBe('TIMEOUT');
      expect(result.message).toContain('Request timed out');
    });

    it('Scenario 6: should handle 500 Internal Server Error as SERVER_ERROR', async () => {
      globalThis.fetch = vi.fn().mockResolvedValue({
        ok: false,
        status: 500,
        json: async () => ({ error: 'Internal server error' }),
      } as any);

      const client = new CuelinksClient({ apiKey: 'test-key', baseUrl: 'https://developers.cuelinks.com/pub_api/v3' });
      const result = await client.ping();

      expect(result.configured).toBe(true);
      expect(result.connected).toBe(false);
      expect(result.statusCode).toBe(500);
      expect(result.errorCategory).toBe('SERVER_ERROR');
      expect(result.message).toContain('server error (500)');
    });

    it('Scenario 7: should handle 429 Too Many Requests as RATE_LIMITED', async () => {
      globalThis.fetch = vi.fn().mockResolvedValue({
        ok: false,
        status: 429,
        json: async () => ({ error: 'Rate limit exceeded' }),
      } as any);

      const client = new CuelinksClient({ apiKey: 'test-key', baseUrl: 'https://developers.cuelinks.com/pub_api/v3' });
      const result = await client.ping();

      expect(result.configured).toBe(true);
      expect(result.connected).toBe(false);
      expect(result.statusCode).toBe(429);
      expect(result.errorCategory).toBe('RATE_LIMITED');
      expect(result.message).toContain('Rate limit exceeded');
    });

    it('Scenario 8: should sanitize sensitive keys from response details and error messages', async () => {
      const secretKey = 'super-secret-api-key-12345';
      globalThis.fetch = vi.fn().mockResolvedValue({
        ok: true,
        status: 200,
        json: async () => ({
          api_key: secretKey,
          token: 'sensitive-token',
          nested: {
            authSecret: 'nested-secret',
            publicInfo: 'visible',
          },
        }),
      } as any);

      const client = new CuelinksClient({ apiKey: secretKey, baseUrl: 'https://developers.cuelinks.com/pub_api/v3' });
      const result = await client.ping();

      expect(result.details).toBeDefined();
      expect((result.details as any).api_key).toBe('[REDACTED]');
      expect((result.details as any).token).toBe('[REDACTED]');
      expect((result.details as any).nested.authSecret).toBe('[REDACTED]');
      expect((result.details as any).nested.publicInfo).toBe('visible');

      // Network error containing key string must also redact
      globalThis.fetch = vi.fn().mockRejectedValue(new Error(`Failed to authenticate with key ${secretKey}`));
      const netResult = await client.ping();
      expect(netResult.message).not.toContain(secretKey);
      expect(netResult.message).toContain('[REDACTED]');
    });
  });

  describe('Scenario 9: Admin Integration Diagnostic Health API & RBAC Guards', () => {
    it('should reject unauthenticated request with 401 Unauthorized', async () => {
      const res = await request(app).get('/api/v1/admin/integrations/cuelinks/health');
      expect(res.status).toBe(401);
      expect(res.body.success).toBe(false);
    });

    it('should reject authenticated CUSTOMER with 403 Forbidden', async () => {
      const res = await request(app)
        .get('/api/v1/admin/integrations/cuelinks/health')
        .set('Authorization', `Bearer ${customerToken}`);

      expect(res.status).toBe(403);
      expect(res.body.success).toBe(false);
    });

    it('should reject authenticated PRODUCT_MANAGER with 403 Forbidden', async () => {
      const res = await request(app)
        .get('/api/v1/admin/integrations/cuelinks/health')
        .set('Authorization', `Bearer ${productManagerToken}`);

      expect(res.status).toBe(403);
      expect(res.body.success).toBe(false);
    });

    it('should allow authenticated SUPER_ADMIN and return health diagnostic payload', async () => {
      vi.spyOn(cuelinksService, 'checkHealth').mockResolvedValueOnce({
        configured: true,
        connected: true,
        statusCode: 200,
        latencyMs: 42,
        message: 'Successfully connected to Cuelinks V3 API',
      });

      const res = await request(app)
        .get('/api/v1/admin/integrations/cuelinks/health')
        .set('Authorization', `Bearer ${superAdminToken}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.configured).toBe(true);
      expect(res.body.data.connected).toBe(true);
      expect(res.body.data.statusCode).toBe(200);
      expect(res.body.data.message).toBe('Successfully connected to Cuelinks V3 API');
    });
  });
});
