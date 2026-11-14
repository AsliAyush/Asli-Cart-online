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
import { ShieldCheck, Loader2 } from "lucide-react";

interface SavePermissionsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  roleName: string;
  permissionCount: number;
  onConfirm: () => Promise<void>;
  isSaving: boolean;
}

export function SavePermissionsDialog({
  open,
  onOpenChange,
  roleName,
  permissionCount,
  onConfirm,
  isSaving,
}: SavePermissionsDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-md bg-primary/10 text-primary">
              <ShieldCheck className="h-5 w-5" />
            </div>
            <div>
              <DialogTitle className="text-lg">Update Role Permissions</DialogTitle>
              <DialogDescription className="text-xs">
                Confirm permission matrix update for role {roleName}.
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <div className="py-2 text-xs text-muted-foreground space-y-2">
          <p>
            You are about to assign <strong className="text-foreground">{permissionCount} permissions</strong> to the <strong className="text-foreground">{roleName}</strong> role.
          </p>
          <p className="rounded-md bg-muted/40 p-3">
            <strong>Security Notice:</strong> All active sessions for users assigned to this role will continue until token refresh, after which the new permissions will immediately apply.
          </p>
        </div>

        <DialogFooter className="pt-2">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => onOpenChange(false)}
            disabled={isSaving}
          >
            Cancel
          </Button>
          <Button size="sm" onClick={onConfirm} disabled={isSaving}>
            {isSaving && <Loader2 className="h-3.5 w-3.5 mr-1.5 animate-spin" />}
            Confirm Changes
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

