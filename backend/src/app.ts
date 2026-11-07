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

export const createApp = (): Application => {
  const app = express();

  // Security Headers
  app.use(helmet());

  // CORS Configuration
  app.use(
    cors({
      origin: env.FRONTEND_URL ? [env.FRONTEND_URL] : true,
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

