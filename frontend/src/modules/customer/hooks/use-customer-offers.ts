import { useQuery } from "@tanstack/react-query";
import { customerOffersService } from "../services";

export const CUSTOMER_OFFER_KEYS = {
  all: ["customer-offers"] as const,
  compare: (productId: string, sort?: string) =>
    [...CUSTOMER_OFFER_KEYS.all, "compare", productId, sort] as const,
  details: (offerId: string) =>
    [...CUSTOMER_OFFER_KEYS.all, "details", offerId] as const,
};

export function useCompareOffers(
  productId: string,
  sort?: "price_asc" | "discount_desc"
) {
  return useQuery({
    queryKey: CUSTOMER_OFFER_KEYS.compare(productId, sort),
    queryFn: () => customerOffersService.compareOffers(productId, sort),
    enabled: Boolean(productId),
    staleTime: 60 * 1000,
  });
}

export function useOfferDetails(offerId: string) {
  return useQuery({
    queryKey: CUSTOMER_OFFER_KEYS.details(offerId),
    queryFn: () => customerOffersService.getOfferById(offerId),
    enabled: Boolean(offerId),
    staleTime: 60 * 1000,
  });
}

