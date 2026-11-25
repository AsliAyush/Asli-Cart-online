import { cuelinksTransactionSyncService } from '../services/cuelinksTransactionSync.service.js';
import { cuelinksClient } from '../infra/integrations/cuelinks/cuelinksClient.js';
import { distributedLock } from '../infra/lock/distributedLock.js';
import { env } from '../config/env.js';
import { logger } from '../utils/logger.js';

let syncTimer: NodeJS.Timeout | null = null;
let isStopping = false;
let isJobRunning = false;
let sigListenersAttached = false;

export const isSchedulerRunning = (): boolean => {
  return syncTimer !== null && !isStopping;
};

const executeScheduledSync = async (): Promise<void> => {
  if (isStopping || isJobRunning) {
    return;
  }

  // Pre-check Cuelinks API configuration
  if (!cuelinksClient.isConfigured()) {
    return;
  }

  // Check if distributed lock is held before attempting sync (prevents duplicate runs across instances)
  const isLocked = await distributedLock.isLocked('cuelinks:transaction:sync');
  if (isLocked) {
    return; // Another instance is already synchronizing
  }

  isJobRunning = true;
  try {
    await cuelinksTransactionSyncService.syncTransactions({
      fullSync: false,
    });
  } catch (err: any) {
    // Conflict (lock already held by another cluster instance) is expected and not an error
    if (err?.statusCode === 409 || err?.message?.includes('Distributed lock held')) {
      return;
    }
    logger.warn(
      { err: err?.message || err, stack: err?.stack },
      '[CuelinksTransactionScheduler] Incremental transaction sync warning'
    );
  } finally {
    isJobRunning = false;
  }
};

export const startCuelinksTransactionScheduler = (options?: { forceInTest?: boolean }): void => {
  if (syncTimer) {
    return; // Singleton guarantee: avoid duplicate timers on same instance
  }

  // Configurable interval in ms (default: 30 minutes, minimum: 5 minutes)
  const rawInterval = Number(process.env.CUELINKS_TRANSACTION_SYNC_INTERVAL_MS);
  const intervalMs = !isNaN(rawInterval) && rawInterval >= 300000 ? rawInterval : 1800000;

  // Don't auto-run timers in test environment unless explicitly forced
  if (env.NODE_ENV === 'test' && !options?.forceInTest) {
    return;
  }

  isStopping = false;

  syncTimer = setInterval(executeScheduledSync, intervalMs);

  // Allow Node process to exit cleanly without waiting for this timer
  if (syncTimer.unref) {
    syncTimer.unref();
  }

  // Attach graceful shutdown hooks once
  if (!sigListenersAttached) {
    sigListenersAttached = true;
    const shutdownHandler = () => {
      stopCuelinksTransactionScheduler();
    };
    process.once('SIGTERM', shutdownHandler);
    process.once('SIGINT', shutdownHandler);
  }
};

export const stopCuelinksTransactionScheduler = (): void => {
  isStopping = true;
  if (syncTimer) {
    clearInterval(syncTimer);
    syncTimer = null;
  }
};

