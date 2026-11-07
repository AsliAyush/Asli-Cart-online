import { z } from 'zod';

export const compareOffersParamsSchema = z.object({
  productId: z.string().min(1, 'Product ID is required'),
});

export const compareOffersQuerySchema = z.object({
  sort: z.enum(['price_asc', 'discount_desc']).optional(),
});

export const offerIdParamSchema = z.object({
  id: z.string().min(1, 'Offer ID is required'),
});

