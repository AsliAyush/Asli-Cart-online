import { apiClient } from '@/services/api';
import type { ApiResponse, BackendPagination } from '@/types/api';
import type {
  CuelinksCampaignItem,
  CampaignFilterParams,
  CampaignSyncSummary,
  CampaignSyncStatus,
} from './types';

export interface CampaignListResponse {
  campaigns: CuelinksCampaignItem[];
  pagination: BackendPagination;
}

export const adminCampaignService = {
  async listCampaigns(params: CampaignFilterParams = {}): Promise<CampaignListResponse> {
    const searchParams = new URLSearchParams();
    if (params.page) searchParams.set('page', String(params.page));
    if (params.limit) searchParams.set('limit', String(params.limit));
    if (params.search) searchParams.set('search', params.search);
    if (params.accessStatus) searchParams.set('accessStatus', params.accessStatus);
    if (params.category) searchParams.set('category', params.category);
    if (params.country) searchParams.set('country', params.country);
    if (params.sort) searchParams.set('sort', params.sort);
    if (params.order) searchParams.set('order', params.order);

    const query = searchParams.toString();
    const url = `/admin/integrations/cuelinks/campaigns${query ? `?${query}` : ''}`;

    const response = await apiClient.get<ApiResponse<CuelinksCampaignItem[]> & { pagination?: BackendPagination }>(url);

    return {
      campaigns: response.data.data || [],
      pagination: (response.data as any).pagination || {
        page: params.page || 1,
        limit: params.limit || 20,
        total: (response.data.data || []).length,
        totalPages: 1,
      },
    };
  },

  async getCampaignById(id: string): Promise<CuelinksCampaignItem> {
    const response = await apiClient.get<ApiResponse<CuelinksCampaignItem>>(
      `/admin/integrations/cuelinks/campaigns/${id}`
    );

    if (!response.data.data) {
      throw new Error(response.data.message || 'Campaign not found');
    }

    return response.data.data;
  },

  async syncCampaigns(payload?: {
    accessStatus?: string;
    page?: number;
    perPage?: number;
    maxPages?: number;
  }): Promise<CampaignSyncSummary> {
    const response = await apiClient.post<ApiResponse<CampaignSyncSummary>>(
      '/admin/integrations/cuelinks/campaigns/sync',
      payload || {}
    );

    if (!response.data.data) {
      throw new Error(response.data.message || 'Synchronization failed');
    }

    return response.data.data;
  },

  async requestAccess(id: string | number): Promise<{ success: boolean; message: string; status?: string }> {
    const response = await apiClient.post<ApiResponse<any>>(
      `/admin/integrations/cuelinks/campaigns/${id}/request-access`
    );

    return {
      success: response.data.success,
      message: response.data.message || 'Access request submitted',
      status: response.data.data?.status || 'pending',
    };
  },

  async getSyncStatus(): Promise<CampaignSyncStatus> {
    const response = await apiClient.get<ApiResponse<CampaignSyncStatus>>(
      '/admin/integrations/cuelinks/campaigns/sync-status'
    );

    if (!response.data.data) {
      throw new Error('Failed to retrieve sync status');
    }

    return response.data.data;
  },
};
