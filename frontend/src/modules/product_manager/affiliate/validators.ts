import { z } from "zod";

export const convertAffiliateSchema = z.object({
  originalUrl: z.string().url("Must be a valid merchant URL (e.g. https://www.amazon.in/dp/...)"),
  offerId: z.string().optional(),
  subId1: z.string().optional(),
  subId2: z.string().optional(),
});

export type ConvertAffiliateFormValues = z.infer<typeof convertAffiliateSchema>;

