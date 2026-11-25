import express, { Application } from 'express';
import helmet from 'helmet';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import pinoHttp from 'pino-http';
import { env } from './config/env.js';
import { logger } from './utils/logger.js';
import { apiRateLimiter } from './middlewares/rateLimiter.js';
import { errorMiddleware, notFoundMiddleware } from './middlewares/errorMiddleware.js';
import apiV1Router from './routes/index.js';
import { resolveTrustProxyConfiguration } from './config/proxy.js';

export const createApp = (): Application => {
  const app = express();

  // Strictly validated infrastructure proxy trust (Render internal network + Cloudflare Anycast edge)
  // Resolves ERR_ERL_UNEXPECTED_X_FORWARDED_FOR while strictly rejecting unsafe/permissive overrides
  const trustProxySetting = resolveTrustProxyConfiguration(process.env.TRUST_PROXY);
  app.set('trust proxy', trustProxySetting as any);

  // Security Headers
  app.use(helmet());

  // CORS Configuration
  const allowedOrigins = env.FRONTEND_URL
    ? env.FRONTEND_URL.split(',').map((u) => u.trim().replace(/\/$/, ''))
    : ['http://localhost:3000'];

  // Restrict Vercel preview origins strictly to Asli Cart project deployments
  const ASLI_CART_VERCEL_PREVIEW_REGEX = /^asli-?cart(-[a-z0-9_-]+)?\.vercel\.app$/i;

  app.use(
    cors({
      origin: (origin, callback) => {
        if (!origin || allowedOrigins.includes(origin) || allowedOrigins.includes('*')) {
          return callback(null, true);
        }
        try {
          const parsed = new URL(origin);
          if (ASLI_CART_VERCEL_PREVIEW_REGEX.test(parsed.hostname)) {
            return callback(null, true);
          }
        } catch {
          // ignore URL parse error
        }
        return callback(null, false);
      },
      credentials: true,
      methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
      allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
    })
  );

  // Body and Cookie Parsers
  app.use(express.json({ limit: '10mb' }));
  app.use(express.urlencoded({ extended: true, limit: '10mb' }));
  app.use(cookieParser());

  // Request Logging with Pino (disabled during test runs to keep output clean)
  if (env.NODE_ENV !== 'test') {
    app.use(
      (pinoHttp as any)({
        logger,
        autoLogging: {
          ignore: (req: any) => req.url === '/api/v1/health',
        },
      })
    );
  }

  // Global Rate Limiting on API endpoints
  app.use('/api', apiRateLimiter);

  // API v1 Routes
  app.use('/api/v1', apiV1Router);

  // 404 Not Found Handler
  app.use(notFoundMiddleware);

  // Centralized Error Handling Middleware
  app.use(errorMiddleware);

  return app;
};

export default createApp;

