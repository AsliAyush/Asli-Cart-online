import { useQuery } from "@tanstack/react-query";
import { adminAuditLogService } from "../audit-log.service";
import type { ListAuditLogsParams } from "../types";

export const ADMIN_AUDIT_LOG_QUERY_KEYS = {
  all: ["admin", "audit-logs"] as const,
  list: (params: ListAuditLogsParams) => [...ADMIN_AUDIT_LOG_QUERY_KEYS.all, "list", params] as const,
  detail: (id: string) => [...ADMIN_AUDIT_LOG_QUERY_KEYS.all, "detail", id] as const,
};

export function useAuditLogsList(params: ListAuditLogsParams = {}) {
  return useQuery({
    queryKey: ADMIN_AUDIT_LOG_QUERY_KEYS.list(params),
    queryFn: () => adminAuditLogService.listLogs(params),
    staleTime: 15 * 1000,
  });
}

export function useAuditLogDetails(id?: string | null) {
  return useQuery({
    queryKey: ADMIN_AUDIT_LOG_QUERY_KEYS.detail(id || ""),
    queryFn: () => adminAuditLogService.getLogById(id!),
    enabled: Boolean(id),
  });
}

