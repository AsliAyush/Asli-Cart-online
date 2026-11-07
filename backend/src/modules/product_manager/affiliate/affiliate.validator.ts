import { z } from 'zod';

export const convertAffiliateSchema = z.object({
  originalUrl: z.string().url('Must be a valid merchant URL'),
  offerId: z.string().optional(),
  subId1: z.string().optional(),
  subId2: z.string().optional(),
});

export const listAffiliateLinksQuerySchema = z.object({
  page: z
    .string()
    .optional()
    .default('1')
    .transform((val) => parseInt(val, 10))
    .pipe(z.number().min(1)),
  limit: z
    .string()
    .optional()
    .default('20')
    .transform((val) => parseInt(val, 10))
    .pipe(z.number().min(1).max(100)),
  offerId: z.string().optional(),
  provider: z.string().optional(),
  status: z.enum(['ACTIVE', 'FAILED', 'PENDING']).optional(),
});

export const linkIdParamSchema = z.object({
  id: z.string().min(1, 'Link ID is required'),
});

