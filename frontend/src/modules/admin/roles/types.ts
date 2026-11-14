/**
 * Asli Cart Super Admin Role & Permission Types
 */

export interface AdminRole {
  id: string;
  name: string;
  description: string | null;
  isSystem: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface RolePermissionAssignment {
  id: string;
  moduleId: string;
  moduleName: string;
  permissionKey: string;
  permissionName: string;
  description: string | null;
  assignedAt: string;
}

export interface SystemModule {
  id: string;
  name: string;
  description: string | null;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  _count?: {
    modulePermissions: number;
  };
}

export interface ModulePermissionDefinition {
  id: string;
  moduleId: string;
  permissionKey: string;
  permissionName: string;
  description: string | null;
  createdAt: string;
  updatedAt: string;
  module?: {
    id: string;
    name: string;
  };
}

