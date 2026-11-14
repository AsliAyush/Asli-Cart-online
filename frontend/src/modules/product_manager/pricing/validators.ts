import { z } from "zod";

export const calculateDiscountSchema = z.object({
  originalPrice: z.coerce.number().min(0, "Original price cannot be negative"),
  sellingPrice: z.coerce.number().min(0, "Selling price cannot be negative"),
}).refine((data) => data.sellingPrice <= data.originalPrice, {
  message: "Selling price cannot be greater than original price (MRP)",
  path: ["sellingPrice"],
});

export type CalculateDiscountValues = z.infer<typeof calculateDiscountSchema>;

export const updateOfferPriceSchema = z.object({
  originalPrice: z.coerce.number().min(0, "Original price cannot be negative"),
  sellingPrice: z.coerce.number().min(0, "Selling price cannot be negative"),
}).refine((data) => data.sellingPrice <= data.originalPrice, {
  message: "Selling price cannot exceed original price",
  path: ["sellingPrice"],
});

export type UpdateOfferPriceValues = z.infer<typeof updateOfferPriceSchema>;

