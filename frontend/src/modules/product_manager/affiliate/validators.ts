import { z } from "zod";

export const convertAffiliateSchema = z.object({
  originalUrl: z.string().url("Must be a valid merchant URL (e.g. https://www.amazon.in/dp/...)").max(2048, "URL cannot exceed 2048 characters"),
  offerId: z.string().max(100).optional(),
  subId1: z.string().max(100).optional(),
  subId2: z.string().max(100).optional(),
});

export type ConvertAffiliateFormValues = z.infer<typeof convertAffiliateSchema>;

