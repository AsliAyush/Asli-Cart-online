/**
 * Asli Cart Super Admin User Management Types
 */

export interface AdminRoleSummary {
  id: string;
  name: string;
  description: string | null;
  isSystem: boolean;
}

export interface AdminUserListItem {
  id: string;
  fullName: string;
  email: string;
  phone: string | null;
  avatarUrl: string | null;
  roleId: string;
  isActive: boolean;
  emailVerified: boolean;
  createdAt: string;
  updatedAt: string;
  role: AdminRoleSummary;
}

export interface ListUsersParams {
  page?: number;
  limit?: number;
  roleId?: string;
  isActive?: boolean;
  search?: string;
}

export interface CreateEmployeeInput {
  fullName: string;
  email: string;
  password: string;
  roleId: string;
}

export interface UpdateEmployeeInput {
  fullName: string;
}

