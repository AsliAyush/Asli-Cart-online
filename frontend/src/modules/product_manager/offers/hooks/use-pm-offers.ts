import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { pmOfferService } from "../offer.service";
import { pmProductService } from "../../products/product.service";
import type {
  ListPMOffersParams,
  CreateOfferInput,
  UpdateOfferInput,
} from "../types";
import { PM_DASHBOARD_QUERY_KEYS } from "../../dashboard/hooks/use-pm-dashboard";

export const PM_OFFERS_QUERY_KEYS = {
  list: (params: ListPMOffersParams) => ["pm", "offers", "list", params] as const,
  detail: (id: string) => ["pm", "offers", "detail", id] as const,
};

export function usePMOffers() {
  const queryClient = useQueryClient();
  const [params, setParams] = useState<ListPMOffersParams>({
    page: 1,
    limit: 10,
    search: "",
    status: "",
  });

  const offersQuery = useQuery({
    queryKey: PM_OFFERS_QUERY_KEYS.list(params),
    queryFn: () => pmOfferService.listOffers(params),
    staleTime: 30000,
  });

  // Query products for dropdown when creating offers
  const productsQuery = useQuery({
    queryKey: ["pm", "products", "dropdown"],
    queryFn: () => pmProductService.listProducts({ page: 1, limit: 50 }),
    staleTime: 60000,
  });

  const createMutation = useMutation({
    mutationFn: (data: CreateOfferInput) => pmOfferService.createOffer(data),
    onSuccess: (newOffer) => {
      toast.success(`Merchant offer "${newOffer.title}" created in DRAFT status!`);
      queryClient.invalidateQueries({ queryKey: ["pm", "offers"] });
      queryClient.invalidateQueries({ queryKey: PM_DASHBOARD_QUERY_KEYS.summary });
    },
    onError: (err: any) => {
      toast.error(err?.response?.data?.message || err?.message || "Failed to create offer");
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateOfferInput }) =>
      pmOfferService.updateOffer(id, data),
    onSuccess: (updated) => {
      toast.success(`Offer "${updated.title}" updated successfully!`);
      queryClient.invalidateQueries({ queryKey: ["pm", "offers"] });
      queryClient.invalidateQueries({ queryKey: PM_OFFERS_QUERY_KEYS.detail(updated.id) });
    },
    onError: (err: any) => {
      toast.error(err?.response?.data?.message || err?.message || "Failed to update offer");
    },
  });

  const submitApprovalMutation = useMutation({
    mutationFn: (id: string) => pmOfferService.submitForApproval(id),
    onSuccess: (item) => {
      toast.success(`Offer "${item.title}" submitted for Super Admin review!`);
      queryClient.invalidateQueries({ queryKey: ["pm", "offers"] });
      queryClient.invalidateQueries({ queryKey: PM_OFFERS_QUERY_KEYS.detail(item.id) });
      queryClient.invalidateQueries({ queryKey: PM_DASHBOARD_QUERY_KEYS.summary });
    },
    onError: (err: any) => {
      toast.error(err?.response?.data?.message || err?.message || "Failed to submit offer");
    },
  });

  const updateStatusMutation = useMutation({
    mutationFn: ({ id, status }: { id: string; status: "PAUSED" | "EXPIRED" }) =>
      pmOfferService.updateStatus(id, status),
    onSuccess: (updated, vars) => {
      toast.success(`Offer status updated to ${vars.status}`);
      queryClient.invalidateQueries({ queryKey: ["pm", "offers"] });
      queryClient.invalidateQueries({ queryKey: PM_OFFERS_QUERY_KEYS.detail(updated.id) });
      queryClient.invalidateQueries({ queryKey: PM_DASHBOARD_QUERY_KEYS.summary });
    },
    onError: (err: any) => {
      toast.error(err?.response?.data?.message || err?.message || "Failed to update offer status");
    },
  });

  const convertAffiliateMutation = useMutation({
    mutationFn: (id: string) => pmOfferService.convertAffiliateLink(id),
    onSuccess: (res, offerId) => {
      toast.success(`Affiliate conversion status: ${res.conversionStatus}`);
      queryClient.invalidateQueries({ queryKey: ["pm", "offers"] });
      queryClient.invalidateQueries({ queryKey: PM_OFFERS_QUERY_KEYS.detail(offerId) });
    },
    onError: (err: any) => {
      toast.error(err?.response?.data?.message || err?.message || "Failed to convert affiliate link");
    },
  });

  return {
    items: offersQuery.data?.items || [],
    pagination: offersQuery.data?.pagination || { page: 1, limit: 10, total: 0, totalPages: 1 },
    isLoading: offersQuery.isLoading,
    isError: offersQuery.isError,
    error: offersQuery.error,
    params,
    setParams,

    products: productsQuery.data?.items || [],
    isLoadingProducts: productsQuery.isLoading,

    createOffer: createMutation.mutateAsync,
    isCreating: createMutation.isPending,

    updateOffer: updateMutation.mutateAsync,
    isUpdating: updateMutation.isPending,

    submitForApproval: submitApprovalMutation.mutateAsync,
    isSubmitting: submitApprovalMutation.isPending,

    updateStatus: updateStatusMutation.mutateAsync,
    isUpdatingStatus: updateStatusMutation.isPending,

    convertAffiliateLink: convertAffiliateMutation.mutateAsync,
    isConvertingAffiliate: convertAffiliateMutation.isPending,

    refetch: offersQuery.refetch,
  };
}

