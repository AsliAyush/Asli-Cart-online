import { z } from "zod";

export const createProductFormSchema = z.object({
  name: z.string().min(2, "Product name must be at least 2 characters").max(255, "Product name cannot exceed 255 characters"),
  slug: z
    .string()
    .max(255, "Slug cannot exceed 255 characters")
    .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, "Slug must contain only lowercase letters, numbers, and hyphens")
    .optional()
    .or(z.literal("")),
  brand: z.string().max(100, "Brand cannot exceed 100 characters").optional(),
  categoryId: z.string().min(1, "Please select a category"),
  mainImage: z.string().url("Main image must be a valid image URL").max(2048, "Image URL cannot exceed 2048 characters"),
  description: z.string().max(10000, "Description cannot exceed 10000 characters").optional(),
  additionalImages: z.string().max(10000, "Additional images list exceeds maximum length").optional(), // Will split by newline in form
});

export type CreateProductFormValues = z.infer<typeof createProductFormSchema>;

export const editProductFormSchema = z.object({
  name: z.string().min(2, "Product name must be at least 2 characters").max(255, "Product name cannot exceed 255 characters"),
  brand: z.string().max(100, "Brand cannot exceed 100 characters").optional(),
  categoryId: z.string().min(1, "Please select a category"),
  mainImage: z.string().url("Main image must be a valid image URL").max(2048, "Image URL cannot exceed 2048 characters"),
  description: z.string().max(10000, "Description cannot exceed 10000 characters").optional(),
  isAssignedToSmm: z.boolean().optional(),
});

export type EditProductFormValues = z.infer<typeof editProductFormSchema>;

