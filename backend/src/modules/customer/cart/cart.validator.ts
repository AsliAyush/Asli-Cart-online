import { z } from 'zod';

export const addToCartSchema = z.object({
  offerId: z.string().min(1, 'Merchant offer ID is required'),
  quantity: z.number().int().min(1, 'Quantity must be at least 1').default(1).optional(),
});

export const updateCartItemSchema = z.object({
  quantity: z.number().int().min(1, 'Quantity must be at least 1'),
});

export const cartItemIdParamSchema = z.object({
  itemId: z.string().min(1, 'Cart item ID is required'),
});

export const merchantRedirectSchema = z.object({
  offerId: z.string().min(1, 'Offer ID is required'),
  source: z.string().default('cart').optional(),
});

