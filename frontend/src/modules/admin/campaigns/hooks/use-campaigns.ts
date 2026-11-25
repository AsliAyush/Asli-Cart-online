import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { adminCampaignService } from '../campaign.service';
import type { CampaignFilterParams } from '../types';

export const CAMPAIGN_QUERY_KEYS = {
  all: ['admin-cuelinks-campaigns'] as const,
  list: (params: CampaignFilterParams) => ['admin-cuelinks-campaigns', 'list', params] as const,
  detail: (id: string) => ['admin-cuelinks-campaigns', 'detail', id] as const,
  syncStatus: ['admin-cuelinks-campaigns', 'sync-status'] as const,
};

export function useCampaigns(params: CampaignFilterParams = {}) {
  return useQuery({
    queryKey: CAMPAIGN_QUERY_KEYS.list(params),
    queryFn: () => adminCampaignService.listCampaigns(params),
    placeholderData: (previousData) => previousData,
    staleTime: 30000,
  });
}

export function useCampaignDetail(id: string | null) {
  return useQuery({
    queryKey: CAMPAIGN_QUERY_KEYS.detail(id || ''),
    queryFn: () => adminCampaignService.getCampaignById(id!),
    enabled: Boolean(id),
  });
}

export function useSyncStatus() {
  return useQuery({
    queryKey: CAMPAIGN_QUERY_KEYS.syncStatus,
    queryFn: () => adminCampaignService.getSyncStatus(),
    refetchInterval: (query) => {
      // Poll every 3 seconds if synchronization is currently in progress
      return query.state.data?.status === 'IN_PROGRESS' ? 3000 : false;
    },
  });
}

export function useSyncCampaigns() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload?: { accessStatus?: string; page?: number; perPage?: number; maxPages?: number }) =>
      adminCampaignService.syncCampaigns(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: CAMPAIGN_QUERY_KEYS.all });
      queryClient.invalidateQueries({ queryKey: CAMPAIGN_QUERY_KEYS.syncStatus });
    },
  });
}

export function useRequestAccess() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string | number) => adminCampaignService.requestAccess(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: CAMPAIGN_QUERY_KEYS.all });
    },
  });
}
