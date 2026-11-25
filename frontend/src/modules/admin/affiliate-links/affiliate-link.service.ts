import { apiClient } from '@/services/api';
import type { ApiResponse, BackendPagination } from '@/types/api';
import type {
  AffiliateOfferItem,
  AffiliateLinksFilterParams,
  RetryConversionResponse,
} from './types';

export interface AffiliateLinkListResponse {
  items: AffiliateOfferItem[];
  pagination: BackendPagination;
}

export const adminAffiliateLinkService = {
  async listAffiliateLinks(
    params: AffiliateLinksFilterParams = {}
  ): Promise<AffiliateLinkListResponse> {
    const searchParams = new URLSearchParams();
    if (params.page) searchParams.set('page', String(params.page));
    if (params.limit) searchParams.set('limit', String(params.limit));
    if (params.conversionStatus) searchParams.set('conversionStatus', params.conversionStatus);
    if (params.isAffiliated !== undefined && params.isAffiliated !== '') {
      searchParams.set('isAffiliated', String(params.isAffiliated));
    }
    if (params.search) searchParams.set('search', params.search);
    if (params.merchantId) searchParams.set('merchantId', params.merchantId);

    const query = searchParams.toString();
    const url = `/admin/integrations/cuelinks/affiliate-links${query ? `?${query}` : ''}`;

    const response = await apiClient.get<
      ApiResponse<AffiliateOfferItem[]> & { pagination?: BackendPagination }
    >(url);

    return {
      items: response.data.data || [],
      pagination: (response.data as any).pagination || {
        page: params.page || 1,
        limit: params.limit || 20,
        total: (response.data.data || []).length,
        totalPages: 1,
      },
    };
  },

  async getAffiliateLinkById(id: string): Promise<AffiliateOfferItem> {
    const response = await apiClient.get<ApiResponse<AffiliateOfferItem>>(
      `/admin/integrations/cuelinks/affiliate-links/${id}`
    );

    if (!response.data.data) {
      throw new Error(response.data.message || 'Affiliate link not found');
    }

    return response.data.data;
  },

  async retryConversion(id: string): Promise<RetryConversionResponse> {
    const response = await apiClient.post<ApiResponse<RetryConversionResponse>>(
      `/admin/integrations/cuelinks/affiliate-links/${id}/retry`
    );

    if (!response.data.data) {
      throw new Error(response.data.message || 'Failed to retry conversion');
    }

    return response.data.data;
  },
};
