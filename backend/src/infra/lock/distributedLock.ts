import crypto from 'crypto';
import { getRedisClient } from '../redis/redis.js';
import { env } from '../../config/env.js';
import { AppError } from '../../utils/appError.js';

export interface LockAcquisitionResult {
  acquired: boolean;
  token: string | null;
  ttlSeconds: number;
  resourceKey: string;
}

export class DistributedLockManager {
  private inMemoryLocks = new Map<string, { token: string; expiresAt: number }>();

  /**
   * Check whether in-memory fallback is permitted in the current environment.
   * Multi-instance production strictly requires Redis. In-memory fallback is permitted
   * ONLY in test/dev or when the deployment is explicitly verified as a single-instance topology.
   */
  public isMemoryFallbackAllowed(): boolean {
    const currentEnv = process.env.NODE_ENV || env.NODE_ENV;
    if (currentEnv === 'test' || currentEnv === 'development') {
      return true;
    }

    // In production, require dual explicit acknowledgement of single-instance deployment
    const allowFallback = process.env.ALLOW_MEMORY_LOCK_FALLBACK === 'true';
    const singleInstance = process.env.SINGLE_INSTANCE_DEPLOYMENT === 'true';
    const instanceCount = Number(process.env.INSTANCE_COUNT) || 1;

    if (allowFallback && singleInstance && instanceCount === 1) {
      if (env.NODE_ENV !== 'test') {
        console.warn(
          '[DistributedLock] WARNING: In-memory lock fallback is active in production under verified single-instance override. If scaling beyond 1 replica, REDIS_URL must be configured.'
        );
      }
      return true;
    }

    return false;
  }

  /**
   * Acquire a distributed lock on a given resource key.
   *
   * @param resourceKey Resource identifier (e.g. 'cuelinks:transaction:sync')
   * @param ttlSeconds Lock expiry in seconds (default: 600 = 10 minutes)
   */
  public async acquireLock(
    resourceKey: string,
    ttlSeconds: number = 600
  ): Promise<LockAcquisitionResult> {
    const token = crypto.randomUUID();
    const fullKey = `lock:${resourceKey}`;
    const redis = getRedisClient();

    // 1. Attempt Redis distributed lock if connected
    if (redis && redis.status === 'ready') {
      try {
        const result = await redis.set(fullKey, token, 'EX', ttlSeconds, 'NX');
        if (result === 'OK') {
          return {
            acquired: true,
            token,
            ttlSeconds,
            resourceKey,
          };
        }
        return {
          acquired: false,
          token: null,
          ttlSeconds,
          resourceKey,
        };
      } catch (err) {
        // Fall through to fallback check
      }
    }

    // 2. Multi-instance safety check: reject in-memory lock if Redis is unavailable in production
    if (!this.isMemoryFallbackAllowed()) {
      throw AppError.serviceUnavailable(
        'Distributed lock service (Redis) is required in production. In-memory lock fallback is disabled in multi-instance environments. Configure REDIS_URL or explicitly verify single-instance deployment via ALLOW_MEMORY_LOCK_FALLBACK=true and SINGLE_INSTANCE_DEPLOYMENT=true.'
      );
    }

    // 3. Permitted in-memory fallback (test / local dev / single-instance verified)
    const now = Date.now();
    const existing = this.inMemoryLocks.get(fullKey);

    if (existing && existing.expiresAt > now) {
      return {
        acquired: false,
        token: null,
        ttlSeconds,
        resourceKey,
      };
    }

    this.inMemoryLocks.set(fullKey, {
      token,
      expiresAt: now + ttlSeconds * 1000,
    });

    return {
      acquired: true,
      token,
      ttlSeconds,
      resourceKey,
    };
  }

  /**
   * Renew a distributed lock lease for a long-running job.
   * Verifies lock ownership before extending TTL. An expired lock CANNOT be renewed.
   *
   * @param resourceKey Resource identifier
   * @param token Ownership token from acquireLock
   * @param ttlSeconds Extended TTL in seconds
   */
  public async renewLock(
    resourceKey: string,
    token: string,
    ttlSeconds: number = 600
  ): Promise<boolean> {
    if (!token) return false;
    const fullKey = `lock:${resourceKey}`;
    const redis = getRedisClient();

    if (redis && redis.status === 'ready') {
      try {
        const luaScript = `
          if redis.call("get", KEYS[1]) == ARGV[1] then
            return redis.call("expire", KEYS[1], ARGV[2])
          else
            return 0
          end
        `;
        const result = await redis.eval(luaScript, 1, fullKey, token, ttlSeconds);
        return Number(result) === 1;
      } catch (err) {
        // Fall back to memory renewal
      }
    }

    // In-memory renewal: verify ownership AND non-expired status
    const now = Date.now();
    const existing = this.inMemoryLocks.get(fullKey);

    if (!existing || existing.token !== token) {
      return false; // Wrong token or lock does not exist
    }

    if (existing.expiresAt <= now) {
      // Lock has already expired; old job cannot reclaim expired lock
      this.inMemoryLocks.delete(fullKey);
      return false;
    }

    // Renew lease
    existing.expiresAt = now + ttlSeconds * 1000;
    return true;
  }

  /**
   * Release a distributed lock safely using ownership verification.
   *
   * @param resourceKey Resource identifier
   * @param token The ownership token returned by acquireLock
   */
  public async releaseLock(resourceKey: string, token: string): Promise<boolean> {
    if (!token) return false;
    const fullKey = `lock:${resourceKey}`;
    const redis = getRedisClient();

    if (redis && redis.status === 'ready') {
      try {
        const luaScript = `
          if redis.call("get", KEYS[1]) == ARGV[1] then
            return redis.call("del", KEYS[1])
          else
            return 0
          end
        `;
        const result = await redis.eval(luaScript, 1, fullKey, token);
        return Number(result) === 1;
      } catch (err) {
        // Fall back to memory release
      }
    }

    const existing = this.inMemoryLocks.get(fullKey);
    if (existing && existing.token === token) {
      this.inMemoryLocks.delete(fullKey);
      return true;
    }

    return false;
  }

  /**
   * Check if a resource is currently locked.
   */
  public async isLocked(resourceKey: string): Promise<boolean> {
    const fullKey = `lock:${resourceKey}`;
    const redis = getRedisClient();

    if (redis && redis.status === 'ready') {
      try {
        const val = await redis.get(fullKey);
        return val !== null;
      } catch (err) {
        // Fall back to memory check
      }
    }

    const existing = this.inMemoryLocks.get(fullKey);
    if (!existing) return false;

    if (existing.expiresAt <= Date.now()) {
      this.inMemoryLocks.delete(fullKey);
      return false;
    }

    return true;
  }

  /**
   * Force reset a lock (used primarily for test cleanup).
   */
  public async forceRelease(resourceKey: string): Promise<void> {
    const fullKey = `lock:${resourceKey}`;
    const redis = getRedisClient();

    if (redis && redis.status === 'ready') {
      try {
        await redis.del(fullKey);
      } catch {
        // Ignore
      }
    }

    this.inMemoryLocks.delete(fullKey);
  }
}

export const distributedLock = new DistributedLockManager();
