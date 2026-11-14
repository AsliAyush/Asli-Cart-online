import { apiClient } from "@/services/api";
import type { ApiResponse } from "@/types/api";
import type {
  AdminRole,
  RolePermissionAssignment,
  SystemModule,
  ModulePermissionDefinition,
} from "./types";

export const adminRoleService = {
  /**
   * List all system and custom roles.
   * Endpoint: GET /api/v1/admin/roles
   */
  async listRoles(): Promise<AdminRole[]> {
    const response = await apiClient.get<ApiResponse<AdminRole[]>>("/admin/roles");
    if (!response.data.data) {
      throw new Error(response.data.message || "Failed to fetch roles");
    }
    return response.data.data;
  },

  /**
   * Get role details by ID.
   * Endpoint: GET /api/v1/admin/roles/:id
   */
  async getRoleById(id: string): Promise<AdminRole> {
    const response = await apiClient.get<ApiResponse<AdminRole>>(`/admin/roles/${id}`);
    if (!response.data.data) {
      throw new Error(response.data.message || "Role not found");
    }
    return response.data.data;
  },

  /**
   * Get all permissions assigned to a given role.
   * Endpoint: GET /api/v1/admin/roles/:id/permissions
   */
  async getRolePermissions(roleId: string): Promise<RolePermissionAssignment[]> {
    const response = await apiClient.get<ApiResponse<RolePermissionAssignment[]>>(
      `/admin/roles/${roleId}/permissions`
    );
    if (!response.data.data) {
      throw new Error(response.data.message || "Failed to fetch role permissions");
    }
    return response.data.data;
  },

  /**
   * Replace role permissions.
   * Endpoint: PUT /api/v1/admin/roles/:id/permissions
   */
  async updateRolePermissions(
    roleId: string,
    permissionIds: string[]
  ): Promise<RolePermissionAssignment[]> {
    const response = await apiClient.put<ApiResponse<RolePermissionAssignment[]>>(
      `/admin/roles/${roleId}/permissions`,
      { permissionIds }
    );
    if (!response.data.data) {
      throw new Error(response.data.message || "Failed to update role permissions");
    }
    return response.data.data;
  },

  /**
   * List all platform modules.
   * Endpoint: GET /api/v1/admin/modules
   */
  async listModules(): Promise<SystemModule[]> {
    const response = await apiClient.get<ApiResponse<SystemModule[]>>("/admin/modules");
    if (!response.data.data) {
      throw new Error(response.data.message || "Failed to fetch system modules");
    }
    return response.data.data;
  },

  /**
   * List all permission definitions for a specific module.
   * Endpoint: GET /api/v1/admin/modules/:id/permissions
   */
  async getModulePermissions(moduleId: string): Promise<ModulePermissionDefinition[]> {
    const response = await apiClient.get<ApiResponse<ModulePermissionDefinition[]>>(
      `/admin/modules/${moduleId}/permissions`
    );
    if (!response.data.data) {
      throw new Error(response.data.message || "Failed to fetch module permissions");
    }
    return response.data.data;
  },

  /**
   * List all permission definitions across all registered modules.
   */
  async getAllModulePermissions(): Promise<ModulePermissionDefinition[]> {
    const modules = await this.listModules();
    const permissionsByModule = await Promise.all(
      modules.map((m) => this.getModulePermissions(m.id))
    );
    return permissionsByModule.flat();
  },
};
