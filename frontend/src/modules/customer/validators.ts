import { z } from "zod";

export const updateCustomerProfileSchema = z.object({
  fullName: z
    .string()
    .min(2, "Full name must be at least 2 characters")
    .max(100, "Full name cannot exceed 100 characters"),
  phone: z
    .string()
    .optional()
    .refine(
      (val) => !val || (val.length >= 10 && val.length <= 15),
      "Phone number must be between 10 and 15 digits"
    ),
  avatarUrl: z
    .string()
    .url("Must be a valid URL")
    .optional()
    .or(z.literal("")),
});

export const changeCustomerPasswordSchema = z
  .object({
    currentPassword: z.string().min(1, "Current password is required"),
    newPassword: z
      .string()
      .min(8, "Password must be at least 8 characters")
      .regex(/[A-Z]/, "Password must contain at least one uppercase letter")
      .regex(/[a-z]/, "Password must contain at least one lowercase letter")
      .regex(/[0-9]/, "Password must contain at least one number")
      .regex(
        /[^A-Za-z0-9]/,
        "Password must contain at least one special character"
      ),
    confirmPassword: z.string().min(1, "Please confirm your new password"),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: "New passwords do not match",
    path: ["confirmPassword"],
  });

export type UpdateCustomerProfileFormValues = z.infer<
  typeof updateCustomerProfileSchema
>;
export type ChangeCustomerPasswordFormValues = z.infer<
  typeof changeCustomerPasswordSchema
>;

