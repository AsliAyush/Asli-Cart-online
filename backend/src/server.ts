import { createApp } from './app.js';
import { env } from './config/env.js';
import { logger } from './utils/logger.js';
import prisma from './infra/database/prisma.js';
import { closeRedisConnection } from './infra/redis/redis.js';

const app = createApp();

const server = app.listen(env.PORT, () => {
  logger.info(`Asli Cart Backend running in [${env.NODE_ENV}] mode on port ${env.PORT}`);
  logger.info(`Health check available at http://localhost:${env.PORT}/api/v1/health`);
});

// Graceful Shutdown
const handleShutdown = async (signal: string) => {
  logger.info(`Received ${signal}. Starting graceful shutdown...`);

  server.close(async () => {
    logger.info('HTTP server closed.');

    try {
      await prisma.$disconnect();
      logger.info('Database connection closed.');
    } catch (err: any) {
      logger.error('Error disconnecting database:', err?.message);
    }

    try {
      await closeRedisConnection();
      logger.info('Redis connection closed.');
    } catch (err: any) {
      logger.error('Error closing Redis connection:', err?.message);
    }

    logger.info('Graceful shutdown completed.');
    process.exit(0);
  });

  // Force shutdown if cleanup takes longer than 10 seconds
  setTimeout(() => {
    logger.error('Graceful shutdown timed out. Forcing process exit.');
    process.exit(1);
  }, 10000).unref();
};

process.on('SIGTERM', () => handleShutdown('SIGTERM'));
process.on('SIGINT', () => handleShutdown('SIGINT'));

process.on('unhandledRejection', (reason: any) => {
  logger.error({ reason: reason?.message || reason }, 'Unhandled Promise Rejection detected');
});

process.on('uncaughtException', (err: Error) => {
  logger.fatal({ err: err.message, stack: err.stack }, 'Uncaught Exception detected! Exiting...');
  process.exit(1);
});

