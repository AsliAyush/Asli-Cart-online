import { apiClient } from "@/services/api";
import type { ApiResponse, BackendPaginatedData } from "@/types/api";
import type { AdminAuditLog, ListAuditLogsParams } from "./types";

export const adminAuditLogService = {
  /**
   * List audit logs with server-side filtering and pagination.
   * Endpoint: GET /api/v1/admin/audit-logs
   */
  async listLogs(
    params: ListAuditLogsParams = {}
  ): Promise<BackendPaginatedData<AdminAuditLog>> {
    const searchParams = new URLSearchParams();
    if (params.page) searchParams.set("page", String(params.page));
    if (params.limit) searchParams.set("limit", String(params.limit));
    if (params.moduleName) searchParams.set("moduleName", params.moduleName);
    if (params.action) searchParams.set("action", params.action);
    if (params.actorUserId) searchParams.set("actorUserId", params.actorUserId);

    const query = searchParams.toString();
    const url = `/admin/audit-logs${query ? `?${query}` : ""}`;

    const response = await apiClient.get<
      ApiResponse<BackendPaginatedData<AdminAuditLog>>
    >(url);

    if (!response.data.data) {
      throw new Error(response.data.message || "Failed to fetch audit logs");
    }

    return response.data.data;
  },

  /**
   * Get audit log detail by ID.
   * Endpoint: GET /api/v1/admin/audit-logs/:id
   */
  async getLogById(id: string): Promise<AdminAuditLog> {
    const response = await apiClient.get<ApiResponse<AdminAuditLog>>(
      `/admin/audit-logs/${id}`
    );

    if (!response.data.data) {
      throw new Error(response.data.message || "Audit log entry not found");
    }

    return response.data.data;
  },
};

