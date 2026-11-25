import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { adminAffiliateLinkService } from '../affiliate-link.service';
import type { AffiliateLinksFilterParams } from '../types';

export const AFFILIATE_LINKS_QUERY_KEYS = {
  all: ['admin-cuelinks-affiliate-links'] as const,
  list: (params: AffiliateLinksFilterParams) =>
    ['admin-cuelinks-affiliate-links', 'list', params] as const,
  detail: (id: string) =>
    ['admin-cuelinks-affiliate-links', 'detail', id] as const,
};

export function useAffiliateLinks(params: AffiliateLinksFilterParams = {}) {
  return useQuery({
    queryKey: AFFILIATE_LINKS_QUERY_KEYS.list(params),
    queryFn: () => adminAffiliateLinkService.listAffiliateLinks(params),
    placeholderData: (previousData) => previousData,
    staleTime: 30000,
  });
}

export function useAffiliateLinkDetail(id: string | null) {
  return useQuery({
    queryKey: AFFILIATE_LINKS_QUERY_KEYS.detail(id || ''),
    queryFn: () => adminAffiliateLinkService.getAffiliateLinkById(id!),
    enabled: Boolean(id),
  });
}

export function useRetryAffiliateLink() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => adminAffiliateLinkService.retryConversion(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: AFFILIATE_LINKS_QUERY_KEYS.all });
    },
  });
}
