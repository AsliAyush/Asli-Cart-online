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
import { Send, Loader2 } from "lucide-react";
import type { PMOfferListItem } from "../types";

interface SubmitApprovalDialogProps {
  offer: PMOfferListItem | null;
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => Promise<void>;
  isSubmitting: boolean;
}

export function SubmitApprovalDialog({
  offer,
  isOpen,
  onClose,
  onConfirm,
  isSubmitting,
}: SubmitApprovalDialogProps) {
  if (!offer) return null;

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && !isSubmitting && onClose()}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-base">
            <Send className="h-4 w-4 text-purple-600" />
            <span>Submit Offer for Admin Approval</span>
          </DialogTitle>
          <DialogDescription className="text-xs">
            Send <strong>&quot;{offer.title}&quot;</strong> to the Super Admin review queue.
          </DialogDescription>
        </DialogHeader>

        <div className="py-2 text-xs text-muted-foreground space-y-2">
          <p>
            The offer will transition to <strong>PENDING_APPROVAL</strong>.
            Any prior rejection reason will be cleared.
          </p>
          <div className="rounded-lg bg-secondary/50 p-2.5 space-y-1">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Original Price:</span>
              <span className="font-semibold text-foreground">₹{Number(offer.originalPrice).toLocaleString("en-IN")}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Selling Price:</span>
              <span className="font-bold text-foreground">₹{Number(offer.sellingPrice).toLocaleString("en-IN")}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Discount:</span>
              <span className="font-bold text-emerald-600">{offer.discountPercentage}% OFF</span>
            </div>
          </div>
          <p className="text-[11px] text-muted-foreground">
            Once approved and published by Super Admin, this offer will become publicly visible to customers.
          </p>
        </div>

        <DialogFooter className="gap-2 sm:gap-0">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={onClose}
            disabled={isSubmitting}
          >
            Cancel
          </Button>
          <Button
            type="button"
            size="sm"
            onClick={onConfirm}
            disabled={isSubmitting}
            className="gap-1.5"
          >
            {isSubmitting && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
            <span>Confirm Submission</span>
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

