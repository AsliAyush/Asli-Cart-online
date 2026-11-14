import { z } from 'zod';

export const listAdminOffersQuerySchema = z.object({
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
  status: z
    .enum([
      'DRAFT',
      'PENDING_APPROVAL',
      'APPROVED',
      'PUBLISHED',
      'REJECTED',
      'PAUSED',
      'EXPIRED',
    ])
    .optional(),
  search: z.string().optional(),
});

export const adminOfferIdParamSchema = z.object({
  id: z.string().min(1, 'Offer ID is required'),
});

export const rejectOfferSchema = z
  .object({
    reason: z.string().max(500, 'Rejection reason cannot exceed 500 characters').optional(),
    rejectionReason: z.string().max(500, 'Rejection reason cannot exceed 500 characters').optional(),
  })
  .refine(
    (data) =>
      Boolean(
        (data.reason && data.reason.trim().length > 0) ||
          (data.rejectionReason && data.rejectionReason.trim().length > 0)
      ),
    {
      message: 'Rejection reason is required',
      path: ['reason'],
    }
  );

export type ListAdminOffersQueryInput = z.infer<typeof listAdminOffersQuerySchema>;
export type AdminOfferIdParamInput = z.infer<typeof adminOfferIdParamSchema>;
export type RejectOfferInput = z.infer<typeof rejectOfferSchema>;

