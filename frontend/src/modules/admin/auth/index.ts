import { z } from "zod";

export const staffLoginSchema = z.object({
  email: z.string().email("Please enter a valid work email address"),
  password: z.string().min(1, "Password is required"),
});

export type StaffLoginFormValues = z.infer<typeof staffLoginSchema>;

