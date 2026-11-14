import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { adminUserService } from "../user.service";
import type {
  ListUsersParams,
  CreateEmployeeInput,
  UpdateEmployeeInput,
} from "../types";
import { toast } from "sonner";

export const ADMIN_USERS_QUERY_KEYS = {
  all: ["admin", "users"] as const,
  list: (params: ListUsersParams) => [...ADMIN_USERS_QUERY_KEYS.all, "list", params] as const,
  detail: (id: string) => [...ADMIN_USERS_QUERY_KEYS.all, "detail", id] as const,
};

export function useUsersList(params: ListUsersParams = {}) {
  return useQuery({
    queryKey: ADMIN_USERS_QUERY_KEYS.list(params),
    queryFn: () => adminUserService.listUsers(params),
    staleTime: 15 * 1000,
  });
}

export function useUserDetails(id?: string | null) {
  return useQuery({
    queryKey: ADMIN_USERS_QUERY_KEYS.detail(id || ""),
    queryFn: () => adminUserService.getUserById(id!),
    enabled: Boolean(id),
  });
}

export function useCreateEmployee() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input: CreateEmployeeInput) => adminUserService.createEmployee(input),
    onSuccess: (newUser) => {
      queryClient.invalidateQueries({ queryKey: ADMIN_USERS_QUERY_KEYS.all });
      toast.success(`Account created for ${newUser.fullName}`);
    },
    onError: (error: any) => {
      const message = error.response?.data?.message || error.message || "Failed to create employee account";
      toast.error(message);
    },
  });
}

export function useUpdateEmployee() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, input }: { id: string; input: UpdateEmployeeInput }) =>
      adminUserService.updateEmployee(id, input),
    onSuccess: (updated) => {
      queryClient.invalidateQueries({ queryKey: ADMIN_USERS_QUERY_KEYS.all });
      toast.success(`User updated: ${updated.fullName}`);
    },
    onError: (error: any) => {
      const message = error.response?.data?.message || error.message || "Failed to update employee account";
      toast.error(message);
    },
  });
}

export function useUpdateUserStatus() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, isActive }: { id: string; isActive: boolean }) =>
      adminUserService.updateUserStatus(id, isActive),
    onSuccess: (updated) => {
      queryClient.invalidateQueries({ queryKey: ADMIN_USERS_QUERY_KEYS.all });
      toast.success(`User ${updated.fullName} has been ${updated.isActive ? "activated" : "deactivated"}`);
    },
    onError: (error: any) => {
      const message = error.response?.data?.message || error.message || "Failed to update user status";
      toast.error(message);
    },
  });
}

export function useUpdateUserRole() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, roleId }: { id: string; roleId: string }) =>
      adminUserService.updateUserRole(id, roleId),
    onSuccess: (updated) => {
      queryClient.invalidateQueries({ queryKey: ADMIN_USERS_QUERY_KEYS.all });
      toast.success(`Role updated for ${updated.fullName}`);
    },
    onError: (error: any) => {
      const message = error.response?.data?.message || error.message || "Failed to update user role";
      toast.error(message);
    },
  });
}

