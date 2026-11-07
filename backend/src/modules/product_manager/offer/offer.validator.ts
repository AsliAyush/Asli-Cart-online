import { z } from 'zod';

export const listOffersQuerySchema = z.object({
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
  productId: z.string().optional(),
  merchantId: z.string().optional(),
  status: z.enum(['DRAFT', 'PENDING_APPROVAL', 'APPROVED', 'PUBLISHED', 'REJECTED', 'PAUSED', 'EXPIRED']).optional(),
  search: z.string().optional(),
});

export const offerIdParamSchema = z.object({
  id: z.string().min(1, 'Offer ID is required'),
});

export const createOfferSchema = z.object({
  productId: z.string().min(1, 'Product ID is required'),
  merchantId: z.string().min(1, 'Merchant ID is required'),
  title: z.string().min(3, 'Offer title must be at least 3 characters'),
  originalPrice: z.number().min(0, 'Original price cannot be negative'),
  sellingPrice: z.number().min(0, 'Selling price cannot be negative'),
  currency: z.string().default('INR').optional(),
  couponCode: z.string().optional(),
  originalUrl: z.string().url('Must be a valid URL'),
  availability: z.enum(['IN_STOCK', 'OUT_OF_STOCK', 'PRE_ORDER']).optional(),
  startDate: z.string().datetime().optional(),
  endDate: z.string().datetime().optional(),
  priceSource: z.string().optional(),
});

export const updateOfferSchema = z.object({
  title: z.string().min(3).optional(),
  originalPrice: z.number().min(0).optional(),
  sellingPrice: z.number().min(0).optional(),
  currency: z.string().optional(),
  couponCode: z.string().optional(),
  originalUrl: z.string().url().optional(),
  availability: z.enum(['IN_STOCK', 'OUT_OF_STOCK', 'PRE_ORDER']).optional(),
  startDate: z.string().datetime().optional(),
  endDate: z.string().datetime().optional(),
});

export const updateOfferStatusSchema = z.object({
  status: z.enum(['PAUSED', 'EXPIRED'], {
    errorMap: () => ({
      message: 'Product Managers can only set status to PAUSED or EXPIRED. Approval/Publishing requires Admin review.',
    }),
  }),
});

