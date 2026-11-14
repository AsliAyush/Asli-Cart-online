import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { productDiscoveryService } from "../discovery.service";
import type { SearchDiscoveryParams } from "../types";
import { PM_DASHBOARD_QUERY_KEYS } from "../../dashboard/hooks/use-pm-dashboard";

export const PM_DISCOVERY_QUERY_KEYS = {
  search: (params: SearchDiscoveryParams) => ["pm", "discovery", "search", params] as const,
  detail: (externalId: string) => ["pm", "discovery", "detail", externalId] as const,
};

export function useProductDiscovery() {
  const queryClient = useQueryClient();
  const [filters, setFilters] = useState<SearchDiscoveryParams>({
    keyword: "",
    category: "",
    merchant: "",
    limit: 20,
  });

  const searchQuery = useQuery({
    queryKey: PM_DISCOVERY_QUERY_KEYS.search(filters),
    queryFn: () => productDiscoveryService.searchDiscovered(filters),
    staleTime: 30000,
  });

  const importMutation = useMutation({
    mutationFn: (externalId: string) =>
      productDiscoveryService.importProduct(externalId),
    onSuccess: (data) => {
      toast.success(data.message || "Product imported successfully into catalog!");
      // Invalidate relevant queries so the product and offer lists refresh
      queryClient.invalidateQueries({ queryKey: ["pm", "products"] });
      queryClient.invalidateQueries({ queryKey: ["pm", "offers"] });
      queryClient.invalidateQueries({ queryKey: PM_DASHBOARD_QUERY_KEYS.summary });
      queryClient.invalidateQueries({ queryKey: PM_DISCOVERY_QUERY_KEYS.search(filters) });
    },
    onError: (err: any) => {
      const msg =
        err?.response?.data?.message || err?.message || "Failed to import product";
      toast.error(msg);
    },
  });

  return {
    items: searchQuery.data || [],
    isLoading: searchQuery.isLoading,
    isError: searchQuery.isError,
    error: searchQuery.error,
    filters,
    setFilters,
    importProduct: importMutation.mutateAsync,
    isImporting: importMutation.isPending,
    refetch: searchQuery.refetch,
  };
}

