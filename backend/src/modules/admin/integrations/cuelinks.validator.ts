import { z } from 'zod';

export const listCampaignsSchema = {
  query: z.object({
    page: z
      .string()
      .optional()
      .transform((val) => (val ? parseInt(val, 10) : 1)),
    limit: z
      .string()
      .optional()
      .transform((val) => (val ? parseInt(val, 10) : 20)),
    search: z.string().trim().optional(),
    accessStatus: z.string().trim().optional(),
    category: z.string().trim().optional(),
    country: z.string().trim().optional(),
    sort: z.string().trim().optional(),
    order: z.enum(['asc', 'desc']).optional().default('desc'),
  }),
};

export const syncCampaignsSchema = {
  body: z
    .object({
      accessStatus: z.string().trim().optional(),
      page: z.number().int().positive().optional(),
      perPage: z.number().int().positive().max(100).optional(),
      maxPages: z.number().int().positive().max(20).optional(),
    })
    .optional(),
};

export const campaignIdParamSchema = {
  params: z.object({
    id: z.string().min(1, 'Campaign ID is required'),
  }),
};

// Phase 4 & 4.1: Transaction & Reporting Validators

const RESERVED_TRANSACTION_IDS = ['sync-status', 'sync', 'reports', 'dashboard-summary', 'export'];

export const transactionIdParamSchema = {
  params: z.object({
    id: z
      .string()
      .min(1, 'Transaction ID is required')
      .refine(
        (val) => !RESERVED_TRANSACTION_IDS.includes(val.toLowerCase()),
        {
          message: 'Invalid transaction ID parameter: cannot use reserved route keyword',
        }
      ),
  }),
};

export const listTransactionsSchema = {
  query: z.object({
    page: z
      .string()
      .optional()
      .transform((val) => (val ? Math.max(1, parseInt(val, 10)) : 1)),
    limit: z
      .string()
      .optional()
      .transform((val) => (val ? Math.min(Math.max(1, parseInt(val, 10)), 100) : 20)),
    status: z.enum(['ALL', 'pending', 'validated', 'payable', 'claimed', 'rejected']).optional(),
    campaignId: z.string().optional(),
    subId: z.string().trim().optional(),
    invoiceNumber: z.string().trim().optional(),
    currency: z.string().trim().optional(),
    search: z.string().trim().optional(),
    startDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'startDate must be in YYYY-MM-DD format').optional(),
    endDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'endDate must be in YYYY-MM-DD format').optional(),
    sort: z.enum(['transactionDate', 'updatedAt', 'saleAmount', 'commissionAmount', 'status']).optional().default('transactionDate'),
    order: z.enum(['asc', 'desc']).optional().default('desc'),
  }),
};

export const syncTransactionsSchema = {
  body: z
    .object({
      fullSync: z.boolean().optional(),
      updatedSince: z.string().optional(),
      startDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'startDate must be in YYYY-MM-DD format').optional(),
      endDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'endDate must be in YYYY-MM-DD format').optional(),
      maxPages: z.number().int().positive().max(100).optional(),
      perPage: z.number().int().positive().max(500).optional(),
      checkpointPage: z.number().int().positive().optional(),
      overlapMinutes: z.number().int().nonnegative().max(1440).optional(),
    })
    .optional(),
};

export const performanceReportSchema = {
  query: z.object({
    start_date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'start_date must be in YYYY-MM-DD format').optional(),
    end_date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'end_date must be in YYYY-MM-DD format').optional(),
    campaign_id: z.string().optional(),
    sub_id: z.string().optional(),
  }),
};

export const earningsReportSchema = {
  query: z.object({
    start_date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'start_date must be in YYYY-MM-DD format').optional(),
    end_date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'end_date must be in YYYY-MM-DD format').optional(),
    campaign_id: z.string().optional(),
  }),
};
