import { z } from "zod";

export const createProductFormSchema = z.object({
  name: z.string().min(2, "Product name must be at least 2 characters"),
  slug: z
    .string()
    .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, "Slug must contain only lowercase letters, numbers, and hyphens")
    .optional()
    .or(z.literal("")),
  brand: z.string().optional(),
  categoryId: z.string().min(1, "Please select a category"),
  mainImage: z.string().url("Main image must be a valid image URL"),
  description: z.string().optional(),
  additionalImages: z.string().optional(), // Will split by newline in form
});

export type CreateProductFormValues = z.infer<typeof createProductFormSchema>;

export const editProductFormSchema = z.object({
  name: z.string().min(2, "Product name must be at least 2 characters"),
  brand: z.string().optional(),
  categoryId: z.string().min(1, "Please select a category"),
  mainImage: z.string().url("Main image must be a valid image URL"),
  description: z.string().optional(),
  isAssignedToSmm: z.boolean().optional(),
});

export type EditProductFormValues = z.infer<typeof editProductFormSchema>;

