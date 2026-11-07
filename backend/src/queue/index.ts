// BullMQ Queue Configuration Preparation
// Prepared for deals sync, affiliate link validation, notification processing

export interface QueueJobDefinition<T = any> {
  name: string;
  data: T;
}

export const QUEUE_NAMES = {
  DEALS_SYNC: 'deals-sync-queue',
  NOTIFICATIONS: 'notifications-queue',
  AUDIT_LOG_PROCESSING: 'audit-log-queue',
} as const;

