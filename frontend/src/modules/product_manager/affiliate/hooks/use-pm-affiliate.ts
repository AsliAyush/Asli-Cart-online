import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { pmAffiliateService } from "../affiliate.service";
import type { ConvertAffiliateInput, AffiliateLinkItem } from "../types";

export function usePMAffiliate() {
  const queryClient = useQueryClient();
  const [lastConverted, setLastConverted] = useState<AffiliateLinkItem | null>(null);

  const convertMutation = useMutation({
    mutationFn: (data: ConvertAffiliateInput) => pmAffiliateService.convertUrl(data),
    onSuccess: (link) => {
      setLastConverted(link);
      toast.success("Affiliate deep link generated successfully!");
      queryClient.invalidateQueries({ queryKey: ["pm", "affiliate", "links"] });
    },
    onError: (err: any) => {
      toast.error(err?.response?.data?.message || err?.message || "Failed to convert affiliate URL");
    },
  });

  return {
    lastConverted,
    convertUrl: convertMutation.mutateAsync,
    isConverting: convertMutation.isPending,
  };
}

