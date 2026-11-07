import { z } from 'zod';

export const addToWishlistSchema = z.object({
  productId: z.string().min(1, 'Product ID is required'),
});

export const wishlistItemIdParamSchema = z.object({
  itemId: z.string().min(1, 'Wishlist item ID is required'),
});

