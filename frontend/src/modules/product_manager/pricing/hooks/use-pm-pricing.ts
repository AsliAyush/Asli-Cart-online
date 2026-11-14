import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { pricingService } from "../pricing.service";
import { pmProductService } from "../../products/product.service";
import type { PriceCalculationResult } from "../types";

export const PM_PRICING_QUERY_KEYS = {
  history: (productId: string) => ["pm", "pricing", "history", productId] as const,
  productList: ["pm", "pricing", "products"] as const,
};

export function usePMPricing() {
  const queryClient = useQueryClient();
  const [selectedProductId, setSelectedProductId] = useState<string>("");
  const [calculationResult, setCalculationResult] = useState<PriceCalculationResult | null>(null);

  // Fetch product list for the price history selector dropdown
  const productsQuery = useQuery({
    queryKey: PM_PRICING_QUERY_KEYS.productList,
    queryFn: () => pmProductService.listProducts({ page: 1, limit: 50 }),
    staleTime: 60000,
  });

  // Fetch price history for selected product
  const historyQuery = useQuery({
    queryKey: PM_PRICING_QUERY_KEYS.history(selectedProductId),
    queryFn: () => pricingService.getPriceHistory(selectedProductId),
    enabled: !!selectedProductId,
    staleTime: 30000,
  });

  // Backend discount calculation mutation
  const calculateMutation = useMutation({
    mutationFn: ({ originalPrice, sellingPrice }: { originalPrice: number; sellingPrice: number }) =>
      pricingService.calculateDiscount(originalPrice, sellingPrice),
    onSuccess: (data) => {
      setCalculationResult(data);
    },
    onError: (err: any) => {
      toast.error(err?.response?.data?.message || err?.message || "Calculation failed");
    },
  });

  // Offer price update mutation
  const updatePriceMutation = useMutation({
    mutationFn: ({ offerId, originalPrice, sellingPrice }: { offerId: string; originalPrice: number; sellingPrice: number }) =>
      pricingService.updateOfferPrice(offerId, { originalPrice, sellingPrice }),
    onSuccess: () => {
      toast.success("Offer pricing updated successfully!");
      queryClient.invalidateQueries({ queryKey: ["pm", "offers"] });
      if (selectedProductId) {
        queryClient.invalidateQueries({ queryKey: PM_PRICING_QUERY_KEYS.history(selectedProductId) });
      }
    },
    onError: (err: any) => {
      toast.error(err?.response?.data?.message || err?.message || "Failed to update offer price");
    },
  });

  return {
    products: productsQuery.data?.items || [],
    isLoadingProducts: productsQuery.isLoading,
    selectedProductId,
    setSelectedProductId,
    priceHistory: historyQuery.data || [],
    isLoadingHistory: historyQuery.isLoading,
    isErrorHistory: historyQuery.isError,

    calculationResult,
    calculateDiscount: calculateMutation.mutateAsync,
    isCalculating: calculateMutation.isPending,

    updateOfferPrice: updatePriceMutation.mutateAsync,
    isUpdatingPrice: updatePriceMutation.isPending,
  };
}
