import { apiClient } from "@/services/api";
import type { ApiResponse, HealthStatusResponse } from "@/types/api";
import type { BackendMeData } from "@/types/auth";

export const adminSettingsService = {
  /**
   * Fetch authenticated Super Admin profile details.
   * Endpoint: GET /api/v1/admin/auth/me
   */
  async getAdminProfile(): Promise<BackendMeData> {
    const response = await apiClient.get<ApiResponse<BackendMeData>>("/admin/auth/me");
    if (!response.data.data) {
      throw new Error(response.data.message || "Failed to fetch admin profile");
    }
    return response.data.data;
  },

  /**
   * Fetch live platform health and database connectivity.
   * Endpoint: GET /api/v1/health
   */
  async getHealthStatus(): Promise<HealthStatusResponse> {
    const response = await apiClient.get<HealthStatusResponse>("/health");
    return response.data;
  },
};
