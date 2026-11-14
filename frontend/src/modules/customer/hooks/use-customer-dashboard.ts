import { useQuery } from "@tanstack/react-query";
import { customerDashboardService } from "../services";
import { useAuth } from "@/hooks/use-auth";

export const CUSTOMER_DASHBOARD_KEYS = {
  all: ["customer-dashboard"] as const,
  summary: () => [...CUSTOMER_DASHBOARD_KEYS.all, "summary"] as const,
};

export function useCustomerDashboardSummary() {
  const { isAuthenticated, user } = useAuth();
  const isCustomer = isAuthenticated && user?.role === "CUSTOMER";

  return useQuery({
    queryKey: CUSTOMER_DASHBOARD_KEYS.summary(),
    queryFn: () => customerDashboardService.getSummary(),
    enabled: isCustomer,
    staleTime: 30 * 1000,
  });
}

