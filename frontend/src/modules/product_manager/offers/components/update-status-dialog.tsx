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
import { PauseCircle, Clock, Loader2 } from "lucide-react";
import type { PMOfferListItem } from "../types";

interface UpdateStatusDialogProps {
  offer: PMOfferListItem | null;
  targetStatus: "PAUSED" | "EXPIRED" | null;
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => Promise<void>;
  isUpdating: boolean;
}

export function UpdateStatusDialog({
  offer,
  targetStatus,
  isOpen,
  onClose,
  onConfirm,
  isUpdating,
}: UpdateStatusDialogProps) {
  if (!offer || !targetStatus) return null;

  const isPause = targetStatus === "PAUSED";
  const Icon = isPause ? PauseCircle : Clock;

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && !isUpdating && onClose()}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-base">
            <Icon className={`h-4 w-4 ${isPause ? "text-amber-500" : "text-muted-foreground"}`} />
            <span>{isPause ? "Pause Live Offer" : "Expire Merchant Offer"}</span>
          </DialogTitle>
          <DialogDescription className="text-xs">
            Change lifecycle status of <strong>&quot;{offer.title}&quot;</strong> to <strong>{targetStatus}</strong>.
          </DialogDescription>
        </DialogHeader>

        <div className="py-2 text-xs text-muted-foreground space-y-2">
          <p>
            {isPause
              ? "Pausing will temporarily hide this deal from customer comparison pages and outbound redirects until reactivated."
              : "Expiring marks the merchant deal as permanently finished or coupon exhausted. The deal will no longer be visible to shoppers."}
          </p>
        </div>

        <DialogFooter className="gap-2 sm:gap-0">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={onClose}
            disabled={isUpdating}
          >
            Cancel
          </Button>
          <Button
            type="button"
            size="sm"
            onClick={onConfirm}
            disabled={isUpdating}
            className="gap-1.5"
          >
            {isUpdating && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
            <span>Confirm {isPause ? "Pause" : "Expire"}</span>
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

