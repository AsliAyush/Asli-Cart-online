import { z } from "zod";

export const createOfferFormSchema = z.object({
  productId: z.string().min(1, "Please select an associated product"),
  merchantId: z.string().min(1, "Merchant ID is required"),
  title: z.string().min(3, "Offer title must be at least 3 characters"),
  originalPrice: z.coerce.number().min(0, "Original price cannot be negative"),
  sellingPrice: z.coerce.number().min(0, "Selling price cannot be negative"),
  currency: z.string().default("INR"),
  couponCode: z.string().optional(),
  originalUrl: z.string().url("Must be a valid merchant store URL"),
  availability: z.enum(["IN_STOCK", "OUT_OF_STOCK", "PRE_ORDER"]).default("IN_STOCK"),
  priceSource: z.string().default("manual"),
}).refine((data) => data.sellingPrice <= data.originalPrice, {
  message: "Selling price cannot be greater than original price (MRP)",
  path: ["sellingPrice"],
});

export type CreateOfferFormValues = z.infer<typeof createOfferFormSchema>;

export const editOfferFormSchema = z.object({
  title: z.string().min(3, "Offer title must be at least 3 characters").optional(),
  originalPrice: z.coerce.number().min(0, "Original price cannot be negative").optional(),
  sellingPrice: z.coerce.number().min(0, "Selling price cannot be negative").optional(),
  couponCode: z.string().optional(),
  originalUrl: z.string().url("Must be a valid URL").optional(),
  availability: z.enum(["IN_STOCK", "OUT_OF_STOCK", "PRE_ORDER"]).optional(),
}).refine(
  (data) => {
    if (data.sellingPrice !== undefined && data.originalPrice !== undefined) {
      return data.sellingPrice <= data.originalPrice;
    }
    return true;
  },
  {
    message: "Selling price cannot exceed original price",
    path: ["sellingPrice"],
  }
);

export type EditOfferFormValues = z.infer<typeof editOfferFormSchema>;

