import { z } from "zod";

export const customerLoginSchema = z.object({
  email: z.string().email("Please enter a valid email address"),
  password: z.string().min(1, "Password is required"),
});

export const customerRegisterSchema = z.object({
  fullName: z
    .string()
    .min(2, "Full name must be at least 2 characters")
    .max(100, "Full name cannot exceed 100 characters"),
  email: z
    .string()
    .email("Please enter a valid email address")
    .max(255, "Email is too long"),
  password: z
    .string()
    .min(8, "Password must be at least 8 characters")
    .regex(/[A-Z]/, "Password must contain at least one uppercase letter")
    .regex(/[a-z]/, "Password must contain at least one lowercase letter")
    .regex(/[0-9]/, "Password must contain at least one number")
    .regex(
      /[^A-Za-z0-9]/,
      "Password must contain at least one special character"
    ),
  phone: z
    .string()
    .optional()
    .refine(
      (val) => !val || (val.length >= 10 && val.length <= 15),
      "Phone number must be between 10 and 15 digits"
    ),
});

export type CustomerLoginFormValues = z.infer<typeof customerLoginSchema>;
export type CustomerRegisterFormValues = z.infer<typeof customerRegisterSchema>;

