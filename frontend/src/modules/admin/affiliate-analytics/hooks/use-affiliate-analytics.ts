import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { adminAnalyticsService } from '../analytics.service';
import type {
  TransactionFilterParams,
  PerformanceReportFilterParams,
  EarningsReportFilterParams,
} from '../types';

export const ANALYTICS_QUERY_KEYS = {
  all: ['admin-cuelinks-analytics'] as const,
  dashboard: ['admin-cuelinks-analytics', 'dashboard-summary'] as const,
  performance: (params: PerformanceReportFilterParams) =>
    ['admin-cuelinks-analytics', 'performance', params] as const,
  earnings: (params: EarningsReportFilterParams) =>
    ['admin-cuelinks-analytics', 'earnings', params] as const,
  transactions: (params: TransactionFilterParams) =>
    ['admin-cuelinks-analytics', 'transactions', params] as const,
  transactionDetail: (id: string) =>
    ['admin-cuelinks-analytics', 'transaction-detail', id] as const,
  syncStatus: ['admin-cuelinks-analytics', 'sync-status'] as const,
};

export function useDashboardSummary() {
  return useQuery({
    queryKey: ANALYTICS_QUERY_KEYS.dashboard,
    queryFn: () => adminAnalyticsService.getDashboardSummary(),
    staleTime: 60000,
  });
}

export function usePerformanceReport(params: PerformanceReportFilterParams = {}) {
  return useQuery({
    queryKey: ANALYTICS_QUERY_KEYS.performance(params),
    queryFn: () => adminAnalyticsService.getPerformanceReport(params),
    placeholderData: (prev) => prev,
    staleTime: 60000,
  });
}

export function useEarningsReport(params: EarningsReportFilterParams = {}) {
  return useQuery({
    queryKey: ANALYTICS_QUERY_KEYS.earnings(params),
    queryFn: () => adminAnalyticsService.getEarningsReport(params),
    placeholderData: (prev) => prev,
    staleTime: 60000,
  });
}

export function useTransactions(params: TransactionFilterParams = {}) {
  return useQuery({
    queryKey: ANALYTICS_QUERY_KEYS.transactions(params),
    queryFn: () => adminAnalyticsService.listTransactions(params),
    placeholderData: (prev) => prev,
    staleTime: 30000,
  });
}

export function useTransactionDetail(id: string | null) {
  return useQuery({
    queryKey: ANALYTICS_QUERY_KEYS.transactionDetail(id || ''),
    queryFn: () => adminAnalyticsService.getTransactionById(id!),
    enabled: Boolean(id),
  });
}

export function useTransactionSyncStatus() {
  return useQuery({
    queryKey: ANALYTICS_QUERY_KEYS.syncStatus,
    queryFn: () => adminAnalyticsService.getSyncStatus(),
    refetchInterval: (query) => {
      // Poll every 3 seconds if synchronization is active
      return query.state.data?.isSyncInProgress ? 3000 : false;
    },
  });
}

export function useSyncTransactions() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload?: { fullSync?: boolean; updatedSince?: string; maxPages?: number }) =>
      adminAnalyticsService.syncTransactions(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ANALYTICS_QUERY_KEYS.all });
    },
  });
}
