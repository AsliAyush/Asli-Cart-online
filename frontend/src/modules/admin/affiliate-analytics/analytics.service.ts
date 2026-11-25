import { apiClient } from '@/services/api';
import type { ApiResponse, BackendPagination } from '@/types/api';
import type {
  CuelinksTransactionItem,
  TransactionFilterParams,
  TransactionSyncStatus,
  TransactionSyncSummary,
  PerformanceReportItem,
  PerformanceReportFilterParams,
  EarningsReportItem,
  EarningsReportFilterParams,
  DashboardSummary,
} from './types';

export interface TransactionListResponse {
  items: CuelinksTransactionItem[];
  pagination: BackendPagination;
}

export const adminAnalyticsService = {
  async listTransactions(
    params: TransactionFilterParams = {}
  ): Promise<TransactionListResponse> {
    const searchParams = new URLSearchParams();
    if (params.page) searchParams.set('page', String(params.page));
    if (params.limit) searchParams.set('limit', String(params.limit));
    if (params.startDate) searchParams.set('startDate', params.startDate);
    if (params.endDate) searchParams.set('endDate', params.endDate);
    if (params.status) searchParams.set('status', params.status);
    if (params.campaignId) searchParams.set('campaignId', String(params.campaignId));
    if (params.subId) searchParams.set('subId', params.subId);
    if (params.invoiceNumber) searchParams.set('invoiceNumber', params.invoiceNumber);
    if (params.search) searchParams.set('search', params.search);
    if (params.sort) searchParams.set('sort', params.sort);
    if (params.order) searchParams.set('order', params.order);

    const query = searchParams.toString();
    const url = `/admin/integrations/cuelinks/transactions${query ? `?${query}` : ''}`;

    const response = await apiClient.get<
      ApiResponse<CuelinksTransactionItem[]> & { pagination?: BackendPagination }
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

  async getTransactionById(id: string): Promise<CuelinksTransactionItem> {
    const response = await apiClient.get<ApiResponse<CuelinksTransactionItem>>(
      `/admin/integrations/cuelinks/transactions/${id}`
    );

    if (!response.data.data) {
      throw new Error(response.data.message || 'Transaction not found');
    }

    return response.data.data;
  },

  async getSyncStatus(): Promise<TransactionSyncStatus> {
    const response = await apiClient.get<ApiResponse<TransactionSyncStatus>>(
      '/admin/integrations/cuelinks/transactions/sync-status'
    );

    return (
      response.data.data || {
        isSyncInProgress: false,
        totalTransactions: 0,
        latestLog: null,
        lastSuccessfulSyncAt: null,
      }
    );
  },

  async syncTransactions(payload?: {
    fullSync?: boolean;
    updatedSince?: string;
    maxPages?: number;
  }): Promise<TransactionSyncSummary> {
    const response = await apiClient.post<ApiResponse<TransactionSyncSummary>>(
      '/admin/integrations/cuelinks/transactions/sync',
      payload || {}
    );

    if (!response.data.data) {
      throw new Error(response.data.message || 'Failed to trigger transaction sync');
    }

    return response.data.data;
  },

  async getPerformanceReport(
    params: PerformanceReportFilterParams = {}
  ): Promise<{ data: PerformanceReportItem[]; pagination?: any }> {
    const searchParams = new URLSearchParams();
    if (params.start_date) searchParams.set('start_date', params.start_date);
    if (params.end_date) searchParams.set('end_date', params.end_date);
    if (params.campaign_id) searchParams.set('campaign_id', String(params.campaign_id));
    if (params.channel_id) searchParams.set('channel_id', String(params.channel_id));
    if (params.sort) searchParams.set('sort', params.sort);
    if (params.order) searchParams.set('order', params.order);
    if (params.page) searchParams.set('page', String(params.page));
    if (params.per_page) searchParams.set('per_page', String(params.per_page));

    const query = searchParams.toString();
    const url = `/admin/integrations/cuelinks/reports/performance${query ? `?${query}` : ''}`;

    const response = await apiClient.get<
      ApiResponse<PerformanceReportItem[]> & { pagination?: any }
    >(url);

    return {
      data: response.data.data || [],
      pagination: (response.data as any).pagination,
    };
  },

  async getEarningsReport(
    params: EarningsReportFilterParams = {}
  ): Promise<{ data: EarningsReportItem[]; pagination?: any }> {
    const searchParams = new URLSearchParams();
    if (params.start_date) searchParams.set('start_date', params.start_date);
    if (params.end_date) searchParams.set('end_date', params.end_date);
    if (params.sort) searchParams.set('sort', params.sort);
    if (params.order) searchParams.set('order', params.order);
    if (params.page) searchParams.set('page', String(params.page));
    if (params.per_page) searchParams.set('per_page', String(params.per_page));

    const query = searchParams.toString();
    const url = `/admin/integrations/cuelinks/reports/earnings${query ? `?${query}` : ''}`;

    const response = await apiClient.get<
      ApiResponse<EarningsReportItem[]> & { pagination?: any }
    >(url);

    return {
      data: response.data.data || [],
      pagination: (response.data as any).pagination,
    };
  },

  async getDashboardSummary(): Promise<DashboardSummary> {
    const response = await apiClient.get<ApiResponse<DashboardSummary>>(
      '/admin/integrations/cuelinks/dashboard-summary'
    );

    return (
      response.data.data || {
        isLiveAvailable: false,
        currency: 'INR',
        totalClicks: 0,
        totalTransactions: 0,
        totalSaleAmount: '0.00',
        totalCommission: '0.00',
        pendingCommission: '0.00',
        validatedCommission: '0.00',
        payableCommission: '0.00',
        claimedCommission: '0.00',
        rejectedCommission: '0.00',
        lastSuccessfulSyncAt: null,
      }
    );
  },
};
