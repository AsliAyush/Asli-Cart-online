"use client";

import React from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { useUpdateUserStatus } from "../hooks/use-admin-users";
import type { AdminUserListItem } from "../types";
import { AlertCircle, CheckCircle2, Loader2 } from "lucide-react";

interface UserStatusModalProps {
  user: AdminUserListItem | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function UserStatusModal({ user, open, onOpenChange }: UserStatusModalProps) {
  const updateStatusMutation = useUpdateUserStatus();

  if (!user) return null;

  const targetStatus = !user.isActive;

  const handleConfirm = async () => {
    try {
      await updateStatusMutation.mutateAsync({ id: user.id, isActive: targetStatus });
      onOpenChange(false);
    } catch {
      // Toast handled by mutation
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <div className="flex items-center gap-2">
            <div
              className={`p-2 rounded-md ${
                targetStatus
                  ? "bg-emerald-500/10 text-emerald-600"
                  : "bg-destructive/10 text-destructive"
              }`}
            >
              {targetStatus ? (
                <CheckCircle2 className="h-5 w-5" />
              ) : (
                <AlertCircle className="h-5 w-5" />
              )}
            </div>
            <div>
              <DialogTitle className="text-lg">
                {targetStatus ? "Activate Account" : "Deactivate Account"}
              </DialogTitle>
              <DialogDescription className="text-xs">
                Confirm status modification for {user.fullName} ({user.email}).
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <div className="py-2 text-xs text-muted-foreground space-y-2">
          {targetStatus ? (
            <p>
              Activating this user will restore their ability to log in and access authorized platform modules.
            </p>
          ) : (
            <div className="space-y-2">
              <p className="text-destructive font-medium">
                Deactivating this user will immediately revoke all active refresh tokens and terminate all current sessions across all devices.
              </p>
              {user.role?.name === "SUPER_ADMIN" && (
                <p className="text-amber-600 dark:text-amber-400">
                  Note: The backend will reject deactivation if this is the last active Super Admin.
                </p>
              )}
            </div>
          )}
        </div>

        <DialogFooter className="pt-2">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => onOpenChange(false)}
            disabled={updateStatusMutation.isPending}
          >
            Cancel
          </Button>
          <Button
            variant={targetStatus ? "default" : "destructive"}
            size="sm"
            onClick={handleConfirm}
            disabled={updateStatusMutation.isPending}
          >
            {updateStatusMutation.isPending && (
              <Loader2 className="h-3.5 w-3.5 mr-1.5 animate-spin" />
            )}
            {targetStatus ? "Activate Account" : "Deactivate Account"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

