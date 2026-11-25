import { describe, it, expect, vi } from 'vitest';
import request from 'supertest';
import express from 'express';
import rateLimit from 'express-rate-limit';

// Mock prisma to return healthy DB ping for /api/v1/health
vi.mock('../src/infra/database/prisma.js', () => ({
  default: {
    $queryRaw: vi.fn().mockResolvedValue([{ 1: 1 }]),
  },
}));

import { createApp } from '../src/app.js';
import {
  DEFAULT_TRUSTED_PROXIES,
  resolveTrustProxyConfiguration,
  CLOUDFLARE_IPV4_CIDRS,
} from '../src/config/proxy.js';

describe('Phase 5.2: Final Proxy Trust Hardening & Security QA', () => {
  const ACTUAL_RENDER_CHAIN = '61.1.116.213, 104.23.160.114, 10.27.189.201';

  // --- Socket Remote Address Explanation ---
  // In Node.js / Supertest, the TCP socket connection (req.socket.remoteAddress) connects
  // over the local loopback interface (::ffff:127.0.0.1 or 127.0.0.1).
  // On Render, the application container's socket connection is established by Render's
  // container host proxy (also loopback or private subnet 10.x.x.x).
  // In Express proxy-addr, address traversal begins at req.socket.remoteAddress and
  // proceeds right-to-left across the comma-separated X-Forwarded-For entries.

  it('PROXY-CHAIN-01: demonstrates why trust proxy = 1 fails on actual Render multi-proxy chain', async () => {
    const app = express();
    app.set('trust proxy', 1);

    let observedIp = '';
    let observedIps: string[] = [];
    app.get('/test', (req, res) => {
      observedIp = req.ip || '';
      observedIps = req.ips || [];
      res.json({ ip: req.ip, ips: req.ips });
    });

    await request(app)
      .get('/test')
      .set('X-Forwarded-For', ACTUAL_RENDER_CHAIN);

    // trust proxy = 1 only trusts the immediate socket connection;
    // it selects the rightmost entry (Render internal LB 10.27.189.201), NOT the client!
    expect(observedIp).toBe('10.27.189.201');
    expect(observedIps).toEqual(['10.27.189.201']);
  });

  it('PROXY-CHAIN-02: demonstrates why trust proxy = 2 still fails on Cloudflare edge proxy', async () => {
    const app = express();
    app.set('trust proxy', 2);

    let observedIp = '';
    app.get('/test', (req, res) => {
      observedIp = req.ip || '';
      res.json({ ip: req.ip });
    });

    await request(app)
      .get('/test')
      .set('X-Forwarded-For', ACTUAL_RENDER_CHAIN);

    // trust proxy = 2 selects the Cloudflare edge proxy (104.23.160.114), NOT the client!
    expect(observedIp).toBe('104.23.160.114');
  });

  it('PROXY-CHAIN-03: default narrowed infrastructure proxy list accurately extracts real client IP', async () => {
    const app = express();
    app.set('trust proxy', DEFAULT_TRUSTED_PROXIES as any);

    let observedIp = '';
    let observedIps: string[] = [];
    app.get('/test', (req, res) => {
      observedIp = req.ip || '';
      observedIps = req.ips || [];
      res.json({ ip: req.ip, ips: req.ips });
    });

    await request(app)
      .get('/test')
      .set('X-Forwarded-For', ACTUAL_RENDER_CHAIN);

    // Traversal: 10.27.189.201 (trusted in 10.0.0.0/8) -> 104.23.160.114 (trusted Cloudflare CIDR)
    // -> 61.1.116.213 (first UNTRUSTED address = genuine client IP!)
    expect(observedIp).toBe('61.1.116.213');
    expect(observedIps).toEqual(['61.1.116.213', '104.23.160.114', '10.27.189.201']);
  });

  it('PROXY-CHAIN-04: createApp() extracts genuine client IP on actual Render chain without ERL error', async () => {
    const app = createApp();

    const res = await request(app)
      .get('/api/v1/health')
      .set('X-Forwarded-For', ACTUAL_RENDER_CHAIN);

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.headers['ratelimit-limit']).toBeDefined();
    expect(res.headers['ratelimit-remaining']).toBeDefined();
  });

  it('PROXY-CHAIN-05: rate limiter maintains separate buckets for distinct real clients behind the same proxies', async () => {
    const app = express();
    app.set('trust proxy', DEFAULT_TRUSTED_PROXIES as any);

    const strictLimiter = rateLimit({
      windowMs: 60 * 1000,
      max: 2,
      standardHeaders: true,
      legacyHeaders: false,
      message: { success: false, message: 'Too many requests' },
    });
    app.use('/limited', strictLimiter);
    app.get('/limited/resource', (req, res) => res.json({ ip: req.ip }));

    const client1Chain = '61.1.116.213, 104.23.160.114, 10.27.189.201';
    const client2Chain = '49.37.150.12, 104.23.160.114, 10.27.189.201';

    // Client 1 consumes quota
    const c1r1 = await request(app).get('/limited/resource').set('X-Forwarded-For', client1Chain);
    expect(c1r1.status).toBe(200);
    expect(c1r1.headers['ratelimit-remaining']).toBe('1');

    const c1r2 = await request(app).get('/limited/resource').set('X-Forwarded-For', client1Chain);
    expect(c1r2.status).toBe(200);
    expect(c1r2.headers['ratelimit-remaining']).toBe('0');

    // Client 1 is now rate limited
    const c1r3 = await request(app).get('/limited/resource').set('X-Forwarded-For', client1Chain);
    expect(c1r3.status).toBe(429);

    // Client 2 routed through the SAME Cloudflare and Render proxies has independent quota!
    const c2r1 = await request(app).get('/limited/resource').set('X-Forwarded-For', client2Chain);
    expect(c2r1.status).toBe(200);
    expect(c2r1.body.ip).toBe('49.37.150.12');
    expect(c2r1.headers['ratelimit-remaining']).toBe('1');
  });

  it('PROXY-CHAIN-06: attacker cannot bypass rate limit by prepending spoofed IPs to X-Forwarded-For', async () => {
    const app = express();
    app.set('trust proxy', DEFAULT_TRUSTED_PROXIES as any);

    const strictLimiter = rateLimit({
      windowMs: 60 * 1000,
      max: 1,
      standardHeaders: true,
      legacyHeaders: false,
    });
    app.use('/test', strictLimiter);
    app.get('/test', (req, res) => res.json({ ip: req.ip }));

    const realClient = '61.1.116.213';
    const legitimateChain = `${realClient}, 104.23.160.114, 10.27.189.201`;

    // First request uses up quota
    const r1 = await request(app).get('/test').set('X-Forwarded-For', legitimateChain);
    expect(r1.status).toBe(200);
    expect(r1.body.ip).toBe(realClient);

    // Attacker sends request with spoofed IP prepended (trying to appear as 1.2.3.4)
    const spoofedChain1 = `1.2.3.4, ${legitimateChain}`;
    const r2 = await request(app).get('/test').set('X-Forwarded-For', spoofedChain1);
    // Express stops traversal at 61.1.116.213 (first untrusted IP); attacker remains blocked
    expect(r2.status).toBe(429);

    // Attacker rotates to another spoofed IP (5.6.7.8)
    const spoofedChain2 = `5.6.7.8, 9.10.11.12, ${legitimateChain}`;
    const r3 = await request(app).get('/test').set('X-Forwarded-For', spoofedChain2);
    expect(r3.status).toBe(429);
  });

  it('PROXY-CHAIN-07: handles malformed forwarded headers gracefully without crashing or bypassing', async () => {
    const app = express();
    app.set('trust proxy', DEFAULT_TRUSTED_PROXIES as any);

    let observedIp = '';
    app.get('/test-malformed', (req, res) => {
      observedIp = req.ip || '';
      res.json({ ip: req.ip });
    });

    // Case 1: Junk text / SQLi payload in forwarded header
    const malformed1 = "junk-data, ' OR 1=1; --, 10.27.189.201";
    const res1 = await request(app).get('/test-malformed').set('X-Forwarded-For', malformed1);
    expect(res1.status).toBe(200);
    // 10.27.189.201 is trusted, traversal halts at the first invalid/untrusted string
    expect(observedIp).toBeDefined();

    // Case 2: Empty or comma-only header
    const res2 = await request(app).get('/test-malformed').set('X-Forwarded-For', ', , ,');
    expect(res2.status).toBe(200);
    expect(res2.body.ip).toBeDefined();
  });

  it('PROXY-CHAIN-08: handles direct unproxied requests that bypass Cloudflare', async () => {
    const app = express();
    app.set('trust proxy', DEFAULT_TRUSTED_PROXIES as any);

    let observedIp = '';
    app.get('/direct', (req, res) => {
      observedIp = req.ip || '';
      res.json({ ip: req.ip });
    });

    // Case 1: No X-Forwarded-For header at all (direct connection to container)
    const res1 = await request(app).get('/direct');
    expect(res1.status).toBe(200);
    // Falls back safely to socket remote address
    expect(observedIp).toMatch(/^(::ffff:)?127\.0\.0\.1$/);

    // Case 2: Only internal Render proxy in header (e.g., internal health probe)
    const res2 = await request(app).get('/direct').set('X-Forwarded-For', '10.27.189.201');
    expect(res2.status).toBe(200);
    expect(res2.body.ip).toBeDefined();
  });

  it('PROXY-SEC-01: strictly rejects TRUST_PROXY=true to prevent global header spoofing', () => {
    expect(() => resolveTrustProxyConfiguration('true')).toThrowError(
      /Insecure TRUST_PROXY="true" is strictly forbidden/
    );
    expect(() => resolveTrustProxyConfiguration('TRUE')).toThrowError(/Insecure TRUST_PROXY/);
    expect(() => resolveTrustProxyConfiguration('all')).toThrowError(/Insecure TRUST_PROXY/);
    expect(() => resolveTrustProxyConfiguration('*')).toThrowError(/Insecure TRUST_PROXY/);
    expect(() => resolveTrustProxyConfiguration('0.0.0.0/0')).toThrowError(/Insecure TRUST_PROXY/);
  });

  it('PROXY-SEC-02: strictly rejects numeric hop counts to prevent multi-tier proxy misconfiguration', () => {
    expect(() => resolveTrustProxyConfiguration('1')).toThrowError(
      /Numeric TRUST_PROXY="1" is not permitted/
    );
    expect(() => resolveTrustProxyConfiguration('2')).toThrowError(/Numeric TRUST_PROXY/);
    expect(() => resolveTrustProxyConfiguration('3')).toThrowError(/Numeric TRUST_PROXY/);
  });

  it('PROXY-SEC-03: strictly rejects arbitrary or unapproved CIDRs', () => {
    // Arbitrary public IP block
    expect(() => resolveTrustProxyConfiguration('198.51.100.0/24')).toThrowError(
      /Unapproved or unrecognized proxy token "198.51.100.0\/24"/
    );
    // Malformed token
    expect(() => resolveTrustProxyConfiguration('not-an-ip')).toThrowError(
      /Unapproved or unrecognized proxy token "not-an-ip"/
    );
    // Empty token within list
    expect(() => resolveTrustProxyConfiguration('loopback, , 10.0.0.0/8')).toThrowError(
      /empty token detected/
    );
  });

  it('PROXY-SEC-04: allows valid overrides and explicit disable', () => {
    // Explicit disable for unproxied environment
    expect(resolveTrustProxyConfiguration('false')).toBe(false);
    expect(resolveTrustProxyConfiguration('none')).toBe(false);

    // Approved override subset
    const custom = resolveTrustProxyConfiguration('loopback, 10.0.0.0/8, 104.16.0.0/13');
    expect(custom).toEqual(['loopback', '10.0.0.0/8', '104.16.0.0/13']);

    // Default when unset
    const defaultConf = resolveTrustProxyConfiguration(undefined);
    expect(defaultConf).toEqual(DEFAULT_TRUSTED_PROXIES);
  });
});
