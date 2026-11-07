import { z } from 'zod';

export const listProductsQuerySchema = z.object({
  page: z
    .string()
    .optional()
    .default('1')
    .transform((val) => parseInt(val, 10))
    .pipe(z.number().min(1)),
  limit: z
    .string()
    .optional()
    .default('10')
    .transform((val) => parseInt(val, 10))
    .pipe(z.number().min(1).max(100)),
  categoryId: z.string().optional(),
  status: z.enum(['DRAFT', 'PENDING_APPROVAL', 'APPROVED', 'REJECTED', 'ARCHIVED']).optional(),
  brand: z.string().optional(),
  search: z.string().optional(),
  isAssignedToSmm: z
    .enum(['true', 'false'])
    .optional()
    .transform((val) => (val === undefined ? undefined : val === 'true')),
});

export const productIdParamSchema = z.object({
  id: z.string().min(1, 'Product ID is required'),
});

export const createProductSchema = z.object({
  name: z.string().min(2, 'Product name must be at least 2 characters'),
  slug: z.string().optional(),
  description: z.string().optional(),
  brand: z.string().optional(),
  categoryId: z.string().min(1, 'Category ID is required'),
  mainImage: z.string().url('Main image must be a valid URL'),
  additionalImages: z.array(z.string().url()).optional(),
  specifications: z.record(z.any()).optional(),
});

export const updateProductSchema = z.object({
  name: z.string().min(2).optional(),
  description: z.string().optional(),
  brand: z.string().optional(),
  categoryId: z.string().optional(),
  mainImage: z.string().url().optional(),
  additionalImages: z.array(z.string().url()).optional(),
  specifications: z.record(z.any()).optional(),
  isAssignedToSmm: z.boolean().optional(),
});

export const assignSmmSchema = z.object({
  isAssigned: z.boolean({ required_error: 'isAssigned boolean is required' }),
});

