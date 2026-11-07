import { z } from 'zod';

export const calculatePricingSchema = z.object({
  originalPrice: z.number().min(0, 'Original price cannot be negative'),
  sellingPrice: z.number().min(0, 'Selling price cannot be negative'),
});

export const productIdParamSchema = z.object({
  productId: z.string().min(1, 'Product ID is required'),
});

