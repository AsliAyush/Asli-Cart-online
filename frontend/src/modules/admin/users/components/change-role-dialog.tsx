"use client";

import React, { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { useRolesList } from "@/modules/admin/roles/hooks/use-admin-roles";
import { useUpdateUserRole } from "../hooks/use-admin-users";
import type { AdminUserListItem } from "../types";
import { Shield, AlertTriangle, Loader2 } from "lucide-react";

interface ChangeRoleDialogProps {
  user: AdminUserListItem | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function ChangeRoleDialog({ user, open, onOpenChange }: ChangeRoleDialogProps) {
  const { data: roles = [], isLoading: isLoadingRoles } = useRolesList();
  const updateRoleMutation = useUpdateUserRole();
  const [selectedRoleId, setSelectedRoleId] = useState<string>("");

  React.useEffect(() => {
    if (user) {
      setSelectedRoleId(user.roleId);
    }
  }, [user]);

  if (!user) return null;

  // Only internal staff roles (PRODUCT_MANAGER, SOCIAL_MEDIA_MANAGER) are assignable through staff role management
  const availableRoles = roles.filter(
    (r) => r.name === "PRODUCT_MANAGER" || r.name === "SOCIAL_MEDIA_MANAGER"
  );

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedRoleId || selectedRoleId === user.roleId) {
      onOpenChange(false);
      return;
    }

    try {
      await updateRoleMutation.mutateAsync({ id: user.id, roleId: selectedRoleId });
      onOpenChange(false);
    } catch {
      // Toast handled by mutation
    }
  };

  const isDemotingSuperAdmin = user.role?.name === "SUPER_ADMIN" && selectedRoleId !== user.roleId;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-md bg-purple-500/10 text-purple-600">
              <Shield className="h-5 w-5" />
            </div>
            <div>
              <DialogTitle className="text-lg">Reassign User Role</DialogTitle>
              <DialogDescription className="text-xs">
                Update authorization scope and permissions for {user.fullName}.
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 py-2">
          <div className="space-y-1.5">
            <Label htmlFor="role-select" className="text-xs font-semibold">
              Select New Role
            </Label>
            <select
              id="role-select"
              value={selectedRoleId}
              onChange={(e) => setSelectedRoleId(e.target.value)}
              className="w-full h-9 px-3 rounded-md border border-input bg-background text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
              disabled={isLoadingRoles}
            >
              {availableRoles.map((role) => (
                <option key={role.id} value={role.id}>
                  {role.name.replace("_", " ")} {role.isSystem ? "(System)" : ""}
                </option>
              ))}
            </select>
          </div>

          {isDemotingSuperAdmin && (
            <div className="flex items-start gap-2 p-3 rounded-md bg-amber-500/10 border border-amber-500/20 text-amber-700 dark:text-amber-400 text-xs">
              <AlertTriangle className="h-4 w-4 shrink-0 mt-0.5" />
              <span>
                <strong>Warning:</strong> You are demoting a Super Admin. The backend will block this if this is the last active Super Admin. All existing sessions will be immediately invalidated.
              </span>
            </div>
          )}

          <div className="rounded-md bg-muted/40 p-3 text-xs text-muted-foreground space-y-1">
            <p className="font-semibold text-foreground">Session Security Notice:</p>
            <p>
              Assigning a new role immediately revokes all active refresh tokens for this user. The user will be required to log in again to receive updated JWT claims.
            </p>
          </div>

          <DialogFooter className="pt-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => onOpenChange(false)}
              disabled={updateRoleMutation.isPending}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              size="sm"
              disabled={updateRoleMutation.isPending || selectedRoleId === user.roleId}
            >
              {updateRoleMutation.isPending && (
                <Loader2 className="h-3.5 w-3.5 mr-1.5 animate-spin" />
              )}
              Confirm Role Change
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

