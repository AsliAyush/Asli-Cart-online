import { apiClient } from "@/services/api";
import type { ApiResponse, BackendPaginatedData } from "@/types/api";
import type {
  AdminUserListItem,
  ListUsersParams,
  CreateEmployeeInput,
  UpdateEmployeeInput,
} from "./types";

export const adminUserService = {
  /**
   * List users with pagination, role filter, status filter, and search.
   * Endpoint: GET /api/v1/admin/users
   */
  async listUsers(
    params: ListUsersParams = {}
  ): Promise<BackendPaginatedData<AdminUserListItem>> {
    const searchParams = new URLSearchParams();
    if (params.page) searchParams.set("page", String(params.page));
    if (params.limit) searchParams.set("limit", String(params.limit));
    if (params.roleId) searchParams.set("roleId", params.roleId);
    if (typeof params.isActive === "boolean") {
      searchParams.set("isActive", String(params.isActive));
    }
    if (params.search) searchParams.set("search", params.search);

    const query = searchParams.toString();
    const url = `/admin/users${query ? `?${query}` : ""}`;

    const response = await apiClient.get<
      ApiResponse<BackendPaginatedData<AdminUserListItem>>
    >(url);

    if (!response.data.data) {
      throw new Error(response.data.message || "Failed to fetch users");
    }

    return response.data.data;
  },

  /**
   * Get user details by ID.
   * Endpoint: GET /api/v1/admin/users/:id
   */
  async getUserById(id: string): Promise<AdminUserListItem> {
    const response = await apiClient.get<ApiResponse<AdminUserListItem>>(
      `/admin/users/${id}`
    );

    if (!response.data.data) {
      throw new Error(response.data.message || "User not found");
    }

    return response.data.data;
  },

  /**
   * Create a new employee/staff account.
   * Endpoint: POST /api/v1/admin/users
   */
  async createEmployee(input: CreateEmployeeInput): Promise<AdminUserListItem> {
    const response = await apiClient.post<ApiResponse<AdminUserListItem>>(
      "/admin/users",
      input
    );

    if (!response.data.data) {
      throw new Error(response.data.message || "Failed to create employee");
    }

    return response.data.data;
  },

  /**
   * Update employee profile fields (fullName).
   * Endpoint: PATCH /api/v1/admin/users/:id
   */
  async updateEmployee(
    id: string,
    input: UpdateEmployeeInput
  ): Promise<AdminUserListItem> {
    const response = await apiClient.patch<ApiResponse<AdminUserListItem>>(
      `/admin/users/${id}`,
      input
    );

    if (!response.data.data) {
      throw new Error(response.data.message || "Failed to update employee");
    }

    return response.data.data;
  },

  /**
   * Activate or deactivate user account.
   * Endpoint: PATCH /api/v1/admin/users/:id/status
   */
  async updateUserStatus(
    id: string,
    isActive: boolean
  ): Promise<AdminUserListItem> {
    const response = await apiClient.patch<ApiResponse<AdminUserListItem>>(
      `/admin/users/${id}/status`,
      { isActive }
    );

    if (!response.data.data) {
      throw new Error(response.data.message || "Failed to update user status");
    }

    return response.data.data;
  },

  /**
   * Reassign user role.
   * Endpoint: PATCH /api/v1/admin/users/:id/role
   */
  async updateUserRole(id: string, roleId: string): Promise<AdminUserListItem> {
    const response = await apiClient.patch<ApiResponse<AdminUserListItem>>(
      `/admin/users/${id}/role`,
      { roleId }
    );

    if (!response.data.data) {
      throw new Error(response.data.message || "Failed to update user role");
    }

    return response.data.data;
  },
};

