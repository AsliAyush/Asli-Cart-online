import React from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Share2, Loader2 } from "lucide-react";
import type { PMProductListItem } from "../types";

interface AssignSmmDialogProps {
  product: PMProductListItem | null;
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => Promise<void>;
  isAssigning: boolean;
}

export function AssignSmmDialog({
  product,
  isOpen,
  onClose,
  onConfirm,
  isAssigning,
}: AssignSmmDialogProps) {
  if (!product) return null;

  const nextAction = product.isAssignedToSmm ? "Unassign from" : "Assign to";

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && !isAssigning && onClose()}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-base">
            <Share2 className="h-4 w-4 text-primary" />
            <span>{nextAction} Social Media Manager</span>
          </DialogTitle>
          <DialogDescription className="text-xs">
            Manage SMM broadcast queue status for <strong>&quot;{product.name}&quot;</strong>.
          </DialogDescription>
        </DialogHeader>

        <div className="py-2 text-xs text-muted-foreground space-y-2">
          <p>
            {product.isAssignedToSmm
              ? "This will remove this product from the Social Media Manager's queue."
              : "This marks the product as queued for the Social Media Manager module (isAssignedToSmm = true)."}
          </p>
          <div className="rounded-lg bg-secondary/60 p-2.5 text-[11px] space-y-1 border">
            <span className="font-semibold text-foreground block">Module Deferred Notice:</span>
            <span>
              The Social Media Manager (SMM) module is currently deferred to Phase 6. No social media posts, messages, or external broadcasts are generated or published by this queue assignment operation.
            </span>
          </div>
        </div>

        <DialogFooter className="gap-2 sm:gap-0">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={onClose}
            disabled={isAssigning}
          >
            Cancel
          </Button>
          <Button
            type="button"
            size="sm"
            onClick={onConfirm}
            disabled={isAssigning}
            className="gap-1.5"
          >
            {isAssigning && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
            <span>Confirm {nextAction} SMM</span>
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

