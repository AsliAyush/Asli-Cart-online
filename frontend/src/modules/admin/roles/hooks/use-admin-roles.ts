import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { adminRoleService } from "../role.service";
import { toast } from "sonner";

export const ADMIN_ROLES_QUERY_KEYS = {
  all: ["admin", "roles"] as const,
  list: () => [...ADMIN_ROLES_QUERY_KEYS.all, "list"] as const,
  detail: (id: string) => [...ADMIN_ROLES_QUERY_KEYS.all, "detail", id] as const,
  permissions: (roleId: string) => [...ADMIN_ROLES_QUERY_KEYS.all, "permissions", roleId] as const,
  modules: () => ["admin", "modules", "list"] as const,
  modulePermissions: (moduleId: string) => ["admin", "modules", "permissions", moduleId] as const,
};

export function useRolesList() {
  return useQuery({
    queryKey: ADMIN_ROLES_QUERY_KEYS.list(),
    queryFn: () => adminRoleService.listRoles(),
    staleTime: 60 * 1000,
  });
}

export function useRoleDetails(id?: string | null) {
  return useQuery({
    queryKey: ADMIN_ROLES_QUERY_KEYS.detail(id || ""),
    queryFn: () => adminRoleService.getRoleById(id!),
    enabled: Boolean(id),
  });
}

export function useRolePermissions(roleId?: string | null) {
  return useQuery({
    queryKey: ADMIN_ROLES_QUERY_KEYS.permissions(roleId || ""),
    queryFn: () => adminRoleService.getRolePermissions(roleId!),
    enabled: Boolean(roleId),
  });
}

export function useSystemModules() {
  return useQuery({
    queryKey: ADMIN_ROLES_QUERY_KEYS.modules(),
    queryFn: () => adminRoleService.listModules(),
    staleTime: 5 * 60 * 1000,
  });
}

export function useAllPermissions() {
  return useQuery({
    queryKey: ["admin", "modules", "all-permissions"] as const,
    queryFn: () => adminRoleService.getAllModulePermissions(),
    staleTime: 5 * 60 * 1000,
  });
}

export function useUpdateRolePermissions() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ roleId, permissionIds }: { roleId: string; permissionIds: string[] }) =>
      adminRoleService.updateRolePermissions(roleId, permissionIds),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: ADMIN_ROLES_QUERY_KEYS.permissions(variables.roleId),
      });
      queryClient.invalidateQueries({ queryKey: ADMIN_ROLES_QUERY_KEYS.list() });
      toast.success("Role permissions successfully updated");
    },
    onError: (error: any) => {
      const message =
        error.response?.data?.message || error.message || "Failed to update role permissions";
      toast.error(message);
    },
  });
}
