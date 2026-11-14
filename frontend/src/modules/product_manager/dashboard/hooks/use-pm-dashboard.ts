import { useQuery } from "@tanstack/react-query";
import { productManagerDashboardService } from "../dashboard.service";

export const PM_DASHBOARD_QUERY_KEYS = {
  summary: ["pm", "dashboard", "summary"] as const,
  recentActivity: ["pm", "dashboard", "recent-activity"] as const,
  pendingReviews: ["pm", "dashboard", "pending-reviews"] as const,
};

export function useProductManagerDashboard() {
  const summaryQuery = useQuery({
    queryKey: PM_DASHBOARD_QUERY_KEYS.summary,
    queryFn: () => productManagerDashboardService.getSummary(),
    staleTime: 30000,
  });

  const recentActivityQuery = useQuery({
    queryKey: PM_DASHBOARD_QUERY_KEYS.recentActivity,
    queryFn: () => productManagerDashboardService.getRecentActivity(8),
    staleTime: 30000,
  });

  const pendingReviewsQuery = useQuery({
    queryKey: PM_DASHBOARD_QUERY_KEYS.pendingReviews,
    queryFn: () => productManagerDashboardService.getPendingReviews(),
    staleTime: 30000,
  });

  return {
    summary: summaryQuery.data,
    isLoadingSummary: summaryQuery.isLoading,
    isErrorSummary: summaryQuery.isError,
    summaryError: summaryQuery.error,

    recentActivity: recentActivityQuery.data,
    isLoadingActivity: recentActivityQuery.isLoading,

    pendingReviews: pendingReviewsQuery.data,
    isLoadingPending: pendingReviewsQuery.isLoading,

    refetchAll: () => {
      summaryQuery.refetch();
      recentActivityQuery.refetch();
      pendingReviewsQuery.refetch();
    },
  };
}

