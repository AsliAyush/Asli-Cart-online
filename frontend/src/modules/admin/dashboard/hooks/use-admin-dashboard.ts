import { useQuery } from "@tanstack/react-query";
import { adminDashboardService } from "../dashboard.service";

export const ADMIN_DASHBOARD_QUERY_KEYS = {
  all: ["admin", "dashboard"] as const,
  summary: () => [...ADMIN_DASHBOARD_QUERY_KEYS.all, "summary"] as const,
  metrics: () => [...ADMIN_DASHBOARD_QUERY_KEYS.all, "metrics"] as const,
};

export function useAdminDashboardMetrics() {
  return useQuery({
    queryKey: ADMIN_DASHBOARD_QUERY_KEYS.metrics(),
    queryFn: () => adminDashboardService.getConsolidatedMetrics(),
    staleTime: 30 * 1000, // 30 seconds
  });
}

