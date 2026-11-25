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

// Image URL validator enforcing strict HTTPS protocol and rejecting unsafe schemes
export const httpsImageUrlSchema = z
  .string({ required_error: 'Image URL is required' })
  .trim()
  .min(1, 'Image URL cannot be empty')
  .max(2048, 'Image URL cannot exceed 2048 characters')
  .url('Must be a valid URL')
  .refine(
    (url) => {
      try {
        const parsed = new URL(url);
        return parsed.protocol === 'https:';
      } catch {
        return false;
      }
    },
    { message: 'Image URL must use secure HTTPS protocol' }
  );

/**
 * Safe, bounded specification values:
 * Accepts strings (max 1,000 chars), finite numbers, booleans, or lists of strings (max 20 items of max 100 chars).
 * Eliminates open z.any() to prevent arbitrarily deep recursive nesting or memory exhaustion.
 */
export const specificationValueSchema = z.union([
  z.string().max(1000, 'Specification string value cannot exceed 1000 characters'),
  z.number().finite('Specification number must be finite'),
  z.boolean(),
  z.array(z.string().max(100, 'Specification list item cannot exceed 100 characters')).max(20, 'Specification list cannot exceed 20 items'),
]);

/**
 * Pre-parse boundary check for specifications:
 * 1. Enforces input is a plain JSON object (not null, not array, prototype is Object.prototype or null).
 * 2. Enforces maximum of 100 own enumerable keys BEFORE passing input to downstream z.record() parser.
 * This guarantees that oversized records are rejected upfront before any per-entry or per-value parsing occurs.
 */
export const preRecordSpecificationsCheck = z.unknown().superRefine((val, ctx) => {
  if (typeof val !== 'object' || val === null || Array.isArray(val)) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: 'Product specifications must be a plain object',
      fatal: true,
    });
    return z.NEVER;
  }

  const proto = Object.getPrototypeOf(val);
  if (proto !== Object.prototype && proto !== null) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: 'Product specifications must be a plain object',
      fatal: true,
    });
    return z.NEVER;
  }

  const keys = Object.keys(val);
  if (keys.length > 100) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: 'Product specifications cannot exceed 100 entries',
      fatal: true,
    });
    return z.NEVER;
  }
});

export const productSpecificationsSchema = preRecordSpecificationsCheck.pipe(
  z.record(
    z.string().min(1, 'Specification attribute name cannot be empty').max(100, 'Specification attribute name cannot exceed 100 characters'),
    specificationValueSchema
  )
);

export const createProductSchema = z.object({
  name: z.string().min(2, 'Product name must be at least 2 characters').max(255, 'Product name cannot exceed 255 characters'),
  slug: z.string().max(255).optional(),
  description: z.string().max(10000, 'Description cannot exceed 10000 characters').optional(),
  brand: z.string().max(100).optional(),
  categoryId: z.string().min(1, 'Category ID is required'),
  mainImage: httpsImageUrlSchema,
  additionalImages: z.array(httpsImageUrlSchema).max(20, 'Cannot exceed 20 additional images').optional(),
  specifications: productSpecificationsSchema.optional(),
});

export const updateProductSchema = z.object({
  name: z.string().min(2).max(255).optional(),
  description: z.string().max(10000).optional(),
  brand: z.string().max(100).optional(),
  categoryId: z.string().optional(),
  mainImage: httpsImageUrlSchema.optional(),
  additionalImages: z.array(httpsImageUrlSchema).max(20, 'Cannot exceed 20 additional images').optional(),
  specifications: productSpecificationsSchema.optional(),
  isAssignedToSmm: z.boolean().optional(),
});

export const assignSmmSchema = z.object({
  isAssigned: z.boolean({ required_error: 'isAssigned boolean is required' }),
});

