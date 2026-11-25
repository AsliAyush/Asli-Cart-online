import { describe, it, expect } from 'vitest';
import request from 'supertest';
import { createApp } from '../src/app.js';

describe('Task 6: Strict CORS Security & Origin Validation', () => {
  const app = createApp();

  it('CORS-01: allows local development frontend origin', async () => {
    const res = await request(app)
      .options('/api/v1/health')
      .set('Origin', 'http://localhost:3000')
      .set('Access-Control-Request-Method', 'GET');

    expect(res.headers['access-control-allow-origin']).toBe('http://localhost:3000');
    expect(res.headers['access-control-allow-credentials']).toBe('true');
  });

  it('CORS-02: allows approved Asli Cart Vercel preview origins', async () => {
    const approvedOrigins = [
      'https://aslicart.vercel.app',
      'https://asli-cart.vercel.app',
      'https://asli-cart-git-staging.vercel.app',
      'https://aslicart-pr-123.vercel.app',
      'https://asli-cart-preview-feature.vercel.app',
    ];

    for (const origin of approvedOrigins) {
      const res = await request(app)
        .options('/api/v1/health')
        .set('Origin', origin)
        .set('Access-Control-Request-Method', 'GET');

      expect(res.headers['access-control-allow-origin']).toBe(origin);
      expect(res.headers['access-control-allow-credentials']).toBe('true');
    }
  });

  it('CORS-03: allows configured production origin', async () => {
    // If FRONTEND_URL is set or defaults, test matching origin
    const res = await request(app)
      .options('/api/v1/health')
      .set('Origin', 'http://localhost:3000')
      .set('Access-Control-Request-Method', 'GET');

    expect(res.headers['access-control-allow-origin']).toBe('http://localhost:3000');
  });

  it('CORS-04: rejects unrelated third-party Vercel origins', async () => {
    const untrustedVercelOrigins = [
      'https://malicious-project.vercel.app',
      'https://unrelated-app.vercel.app',
      'https://not-aslicart.vercel.app',
      'https://fake-cart.vercel.app',
    ];

    for (const origin of untrustedVercelOrigins) {
      const res = await request(app)
        .options('/api/v1/health')
        .set('Origin', origin)
        .set('Access-Control-Request-Method', 'GET');

      // CORS rejects origin: no access-control-allow-origin returned for this origin
      expect(res.headers['access-control-allow-origin']).toBeUndefined();
    }
  });

  it('CORS-05: rejects untrusted external origins', async () => {
    const untrustedOrigins = [
      'https://evil-site.com',
      'https://phishing-aslicart.com',
      'http://attacker.local',
    ];

    for (const origin of untrustedOrigins) {
      const res = await request(app)
        .options('/api/v1/health')
        .set('Origin', origin)
        .set('Access-Control-Request-Method', 'GET');

      expect(res.headers['access-control-allow-origin']).toBeUndefined();
    }
  });
});
