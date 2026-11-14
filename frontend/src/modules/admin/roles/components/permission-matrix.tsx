"use client";

import React, { useState, useEffect } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import type { AdminRole, RolePermissionAssignment, SystemModule, ModulePermissionDefinition } from "../types";
import { Lock, Check, ShieldAlert, Save, RotateCcw } from "lucide-react";
import { SavePermissionsDialog } from "./save-permissions-dialog";

interface PermissionMatrixProps {
  role: AdminRole;
  assignedPermissions: RolePermissionAssignment[];
  modules: SystemModule[];
  allPermissions: ModulePermissionDefinition[];
  isLoading: boolean;
  onSave: (permissionIds: string[]) => Promise<void>;
  isSaving: boolean;
}

const ACTION_COLUMNS = [
  { key: "view", label: "View" },
  { key: "create", label: "Create" },
  { key: "update", label: "Update" },
  { key: "delete", label: "Delete" },
  { key: "approve", label: "Approve" },
  { key: "reject", label: "Reject" },
  { key: "publish", label: "Publish" },
  { key: "assign", label: "Assign" },
  { key: "manage", label: "Manage" },
];

export function PermissionMatrix({
  role,
  assignedPermissions,
  modules,
  allPermissions,
  isLoading,
  onSave,
  isSaving,
}: PermissionMatrixProps) {
  const isSuperAdmin = role.name === "SUPER_ADMIN";
  const [selectedPermissionIds, setSelectedPermissionIds] = useState<Set<string>>(new Set());
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);

  useEffect(() => {
    setSelectedPermissionIds(new Set(assignedPermissions.map((p) => p.id)));
  }, [assignedPermissions, role.id]);

  const handleToggle = (permissionId: string) => {
    if (isSuperAdmin) return;
    const next = new Set(selectedPermissionIds);
    if (next.has(permissionId)) {
      next.delete(permissionId);
    } else {
      next.add(permissionId);
    }
    setSelectedPermissionIds(next);
  };

  const handleReset = () => {
    setSelectedPermissionIds(new Set(assignedPermissions.map((p) => p.id)));
  };

  const hasUnsavedChanges = (() => {
    const original = new Set(assignedPermissions.map((p) => p.id));
    if (original.size !== selectedPermissionIds.size) return true;
    for (const id of selectedPermissionIds) {
      if (!original.has(id)) return true;
    }
    return false;
  })();

  if (isLoading) {
    return (
      <div className="border rounded-lg bg-card p-6 space-y-4">
        <Skeleton className="h-6 w-48" />
        <Skeleton className="h-4 w-72" />
        <div className="space-y-2 pt-2">
          {Array.from({ length: 8 }).map((_, i) => (
            <Skeleton key={i} className="h-10 w-full" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Super Admin Immutable Alert */}
      {isSuperAdmin ? (
        <div className="flex items-center gap-2 p-3 rounded-lg bg-purple-500/10 border border-purple-500/20 text-purple-700 dark:text-purple-300 text-xs">
          <Lock className="h-4 w-4 shrink-0" />
          <span>
            <strong>System Security Rule:</strong> Role <span className="font-mono">SUPER_ADMIN</span> maintains immutable platform authorization. Its permissions cannot be stripped or modified.
          </span>
        </div>
      ) : hasUnsavedChanges ? (
        <div className="flex items-center justify-between p-3 rounded-lg bg-amber-500/10 border border-amber-500/20 text-xs">
          <div className="flex items-center gap-2 text-amber-700 dark:text-amber-300 font-medium">
            <ShieldAlert className="h-4 w-4 shrink-0" />
            <span>You have unsaved permission changes for role {role.name}.</span>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="sm" onClick={handleReset} className="h-7 text-xs">
              <RotateCcw className="h-3.5 w-3.5 mr-1" />
              Reset
            </Button>
            <Button size="sm" onClick={() => setIsConfirmOpen(true)} className="h-7 text-xs">
              <Save className="h-3.5 w-3.5 mr-1" />
              Save Matrix
            </Button>
          </div>
        </div>
      ) : null}

      {/* Permission Table */}
      <div className="border rounded-lg bg-card overflow-hidden shadow-2xs">
        <div className="p-4 border-b bg-muted/20 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h3 className="text-sm font-semibold text-foreground">
              Permission Matrix: {role.name.replace("_", " ")}
            </h3>
            <p className="text-xs text-muted-foreground mt-0.5">
              {selectedPermissionIds.size} permissions currently granted across {modules.length} modules.
            </p>
          </div>
          {!isSuperAdmin && (
            <Button
              size="sm"
              disabled={!hasUnsavedChanges || isSaving}
              onClick={() => setIsConfirmOpen(true)}
              className="text-xs h-8 shrink-0"
            >
              <Save className="h-3.5 w-3.5 mr-1.5" />
              Save Permissions
            </Button>
          )}
        </div>

        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow className="bg-muted/40">
                <TableHead className="min-w-[180px] font-semibold text-xs">Module</TableHead>
                {ACTION_COLUMNS.map((col) => (
                  <TableHead key={col.key} className="text-center font-semibold text-xs w-16">
                    {col.label}
                  </TableHead>
                ))}
              </TableRow>
            </TableHeader>
            <TableBody>
              {modules.map((module) => {
                const modulePerms = allPermissions.filter((p) => p.moduleId === module.id);

                return (
                  <TableRow key={module.id} className="hover:bg-muted/20">
                    <TableCell>
                      <div>
                        <span className="font-semibold text-xs text-foreground block font-mono">
                          {module.name}
                        </span>
                        <span className="text-[11px] text-muted-foreground line-clamp-1">
                          {module.description || "Platform module"}
                        </span>
                      </div>
                    </TableCell>

                    {ACTION_COLUMNS.map((col) => {
                      const perm = modulePerms.find((p) => p.permissionKey === col.key);

                      if (!perm) {
                        return (
                          <TableCell key={col.key} className="text-center text-muted-foreground/30 text-xs">
                            —
                          </TableCell>
                        );
                      }

                      const isChecked = selectedPermissionIds.has(perm.id);

                      return (
                        <TableCell key={col.key} className="text-center p-2">
                          {isSuperAdmin ? (
                            <span className="inline-flex items-center justify-center h-6 w-6 rounded-md bg-purple-500/10 text-purple-600 mx-auto">
                              <Lock className="h-3 w-3" />
                            </span>
                          ) : (
                            <input
                              type="checkbox"
                              checked={isChecked}
                              onChange={() => handleToggle(perm.id)}
                              className="h-4 w-4 rounded border-input text-primary focus:ring-ring cursor-pointer"
                              title={`${col.label} on ${module.name}: ${perm.description || perm.permissionName}`}
                            />
                          )}
                        </TableCell>
                      );
                    })}
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </div>
      </div>

      <SavePermissionsDialog
        open={isConfirmOpen}
        onOpenChange={setIsConfirmOpen}
        roleName={role.name}
        permissionCount={selectedPermissionIds.size}
        onConfirm={async () => {
          await onSave(Array.from(selectedPermissionIds));
          setIsConfirmOpen(false);
        }}
        isSaving={isSaving}
      />
    </div>
  );
}

