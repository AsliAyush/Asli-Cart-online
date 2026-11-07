import Redis from 'ioredis';
import { env } from '../../config/env.js';

let redisClient: Redis | null = null;

export const getRedisClient = (): Redis | null => {
  if (!env.REDIS_URL) {
    return null;
  }

  if (!redisClient) {
    try {
      redisClient = new Redis(env.REDIS_URL, {
        lazyConnect: true,
        maxRetriesPerRequest: 1,
        retryStrategy(times) {
          if (times > 3) {
            return null; // Stop retrying after 3 attempts
          }
          return Math.min(times * 100, 1000);
        },
      });

      redisClient.on('error', (err) => {
        // Safe logging without crashing application when Redis is optional
        if (env.NODE_ENV !== 'test') {
          console.warn('[Redis] Connection warning:', err.message);
        }
      });
    } catch (err: any) {
      console.warn('[Redis] Initialization error:', err?.message);
      redisClient = null;
    }
  }

  return redisClient;
};

export const closeRedisConnection = async (): Promise<void> => {
  if (redisClient) {
    try {
      await redisClient.quit();
    } catch (err) {
      // Ignore disconnect error
    } finally {
      redisClient = null;
    }
  }
};

