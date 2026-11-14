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
import { Archive, Loader2 } from "lucide-react";
import type { PMProductListItem } from "../types";

interface ArchiveProductDialogProps {
  product: PMProductListItem | null;
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => Promise<void>;
  isArchiving: boolean;
}

export function ArchiveProductDialog({
  product,
  isOpen,
  onClose,
  onConfirm,
  isArchiving,
}: ArchiveProductDialogProps) {
  if (!product) return null;

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && !isArchiving && onClose()}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-base text-destructive">
            <Archive className="h-4 w-4" />
            <span>Archive Product</span>
          </DialogTitle>
          <DialogDescription className="text-xs">
            Are you sure you want to archive <strong>&quot;{product.name}&quot;</strong>?
          </DialogDescription>
        </DialogHeader>

        <div className="py-2 text-xs text-muted-foreground space-y-2">
          <p>
            This action will soft-delete the product by updating its status to <strong>ARCHIVED</strong>.
            All associated merchant deals and public storefront entries will be removed from customer view.
          </p>
          <p className="text-[11px] text-muted-foreground/80">
            Note: As per Asli Cart compliance rules, catalog items are never permanently destroyed from the database.
          </p>
        </div>

        <DialogFooter className="gap-2 sm:gap-0">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={onClose}
            disabled={isArchiving}
          >
            Cancel
          </Button>
          <Button
            type="button"
            variant="destructive"
            size="sm"
            onClick={onConfirm}
            disabled={isArchiving}
            className="gap-1.5"
          >
            {isArchiving && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
            <span>Confirm Archive</span>
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

