"use client";

import React, { useState, useEffect } from "react";
import { StaffPageHeader } from "@/components/layout/staff";
import { Button } from "@/components/ui/button";
import {
  useRolesList,
  useRolePermissions,
  useSystemModules,
  useAllPermissions,
  useUpdateRolePermissions,
  RoleCards,
  PermissionMatrix,
} from "@/modules/admin/roles";
import { RefreshCw, Shield } from "lucide-react";

export default function AdminRolesPage() {
  const { data: roles = [], isLoading: isLoadingRoles, refetch: refetchRoles, isFetching } = useRolesList();
  const { data: modules = [], isLoading: isLoadingModules } = useSystemModules();
  const { data: allPermissions = [], isLoading: isLoadingAllPerms } = useAllPermissions();

  const [selectedRoleId, setSelectedRoleId] = useState<string | null>(null);

  useEffect(() => {
    if (roles.length > 0 && !selectedRoleId) {
      setSelectedRoleId(roles[0].id);
    }
  }, [roles, selectedRoleId]);

  const selectedRole = roles.find((r) => r.id === selectedRoleId) || roles[0];

  const {
    data: assignedPermissions = [],
    isLoading: isLoadingRolePerms,
    refetch: refetchPerms,
  } = useRolePermissions(selectedRole?.id);

  const updatePermissionsMutation = useUpdateRolePermissions();

  const handleSavePermissions = async (permissionIds: string[]) => {
    if (!selectedRole) return;
    await updatePermissionsMutation.mutateAsync({
      roleId: selectedRole.id,
      permissionIds,
    });
  };

  const handleRefresh = () => {
    refetchRoles();
    refetchPerms();
  };

  return (
    <div className="space-y-6">
      <StaffPageHeader
        title="Roles & Access Control Matrix"
        description="Inspect system roles, configure granular module permissions, and govern RBAC security boundaries."
        actions={
          <Button
            variant="outline"
            size="sm"
            onClick={handleRefresh}
            disabled={isFetching}
            className="text-xs h-8"
          >
            <RefreshCw className={`h-3.5 w-3.5 mr-1.5 ${isFetching ? "animate-spin" : ""}`} />
            Refresh Matrix
          </Button>
        }
      />

      {/* Role Selection Cards */}
      <div className="space-y-2">
        <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
          Configured Platform Roles
        </h3>
        <RoleCards
          roles={roles}
          selectedRoleId={selectedRole?.id || null}
          onSelectRole={(id) => setSelectedRoleId(id)}
          isLoading={isLoadingRoles}
        />
      </div>

      {/* Permission Matrix */}
      {selectedRole && (
        <PermissionMatrix
          role={selectedRole}
          assignedPermissions={assignedPermissions}
          modules={modules}
          allPermissions={allPermissions}
          isLoading={isLoadingRoles || isLoadingModules || isLoadingRolePerms || isLoadingAllPerms}
          onSave={handleSavePermissions}
          isSaving={updatePermissionsMutation.isPending}
        />
      )}
    </div>
  );
}
