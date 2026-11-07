import { z } from 'zod';

export const searchDiscoveryQuerySchema = z.object({
  keyword: z.string().optional(),
  category: z.string().optional(),
  merchant: z.string().optional(),
  limit: z
    .string()
    .optional()
    .default('20')
    .transform((val) => parseInt(val, 10))
    .pipe(z.number().min(1).max(100)),
});

export const externalIdParamSchema = z.object({
  externalId: z.string().min(1, 'External ID is required'),
});

export const importProductSchema = z.object({
  externalId: z.string().min(1, 'External product ID is required'),
});

