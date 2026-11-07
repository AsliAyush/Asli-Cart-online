import { z } from 'zod';

export const listCustomerProductsQuerySchema = z.object({
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
  search: z.string().optional(),
  brand: z.string().optional(),
  category: z.string().optional(),
  merchant: z.string().optional(),
  minPrice: z
    .string()
    .optional()
    .transform((val) => (val ? parseFloat(val) : undefined))
    .pipe(z.number().min(0).optional()),
  maxPrice: z
    .string()
    .optional()
    .transform((val) => (val ? parseFloat(val) : undefined))
    .pipe(z.number().min(0).optional()),
  minDiscount: z
    .string()
    .optional()
    .transform((val) => (val ? parseFloat(val) : undefined))
    .pipe(z.number().min(0).max(100).optional()),
  sort: z.enum(['newest', 'price_asc', 'price_desc', 'discount_desc']).optional(),
});

export const productIdParamSchema = z.object({
  id: z.string().min(1, 'Product identifier is required'),
});

export const searchProductsQuerySchema = z.object({
  q: z.string().min(1, 'Search query cannot be empty'),
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
});

