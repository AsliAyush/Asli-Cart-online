import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { adminOfferService } from "../offer.service";
import type { ListOffersParams } from "../types";
import { toast } from "sonner";

export const ADMIN_OFFERS_QUERY_KEYS = {
  all: ["admin", "offers"] as const,
  list: (params: ListOffersParams) => [...ADMIN_OFFERS_QUERY_KEYS.all, "list", params] as const,
  detail: (id: string) => [...ADMIN_OFFERS_QUERY_KEYS.all, "detail", id] as const,
};

export function useOffersList(params: ListOffersParams = {}) {
  return useQuery({
    queryKey: ADMIN_OFFERS_QUERY_KEYS.list(params),
    queryFn: () => adminOfferService.listOffers(params),
    staleTime: 15 * 1000,
  });
}

export function useOfferDetails(id?: string | null) {
  return useQuery({
    queryKey: ADMIN_OFFERS_QUERY_KEYS.detail(id || ""),
    queryFn: () => adminOfferService.getOfferById(id!),
    enabled: Boolean(id),
  });
}

export function useUpdateOfferStatus() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, status }: { id: string; status: string }) =>
      adminOfferService.updateStatus(id, status),
    onSuccess: (updated) => {
      queryClient.invalidateQueries({ queryKey: ADMIN_OFFERS_QUERY_KEYS.all });
      toast.success(`Offer status changed to ${updated.status}`);
    },
    onError: (error: any) => {
      const message =
        error.response?.data?.message ||
        error.message ||
        "Failed to update offer status";
      toast.error(message);
    },
  });
}

export function useSubmitOfferApproval() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => adminOfferService.submitForApproval(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ADMIN_OFFERS_QUERY_KEYS.all });
      toast.success("Offer submitted for approval queue");
    },
    onError: (error: any) => {
      const message =
        error.response?.data?.message ||
        error.message ||
        "Failed to submit offer for approval";
      toast.error(message);
    },
  });
}

