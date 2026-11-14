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
import { Badge } from "@/components/ui/badge";
import {
  useUpdateOfferStatus,
  useSubmitOfferApproval,
} from "../hooks/use-admin-offers";
import type { AdminOfferListItem } from "../types";
import {
  CheckCircle2,
  PauseCircle,
  XCircle,
  Clock,
  ShieldAlert,
  Loader2,
  Info,
} from "lucide-react";

interface OfferStatusModalProps {
  offer: AdminOfferListItem | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function OfferStatusModal({
  offer,
  open,
  onOpenChange,
}: OfferStatusModalProps) {
  const updateStatusMutation = useUpdateOfferStatus();
  const submitApprovalMutation = useSubmitOfferApproval();

  if (!offer) return null;

  const handlePause = async () => {
    try {
      await updateStatusMutation.mutateAsync({ id: offer.id, status: "PAUSED" });
      onOpenChange(false);
    } catch {
      // Handled by toast
    }
  };

  const handleExpire = async () => {
    try {
      await updateStatusMutation.mutateAsync({ id: offer.id, status: "EXPIRED" });
      onOpenChange(false);
    } catch {
      // Handled by toast
    }
  };

  const handleSubmitForReview = async () => {
    try {
      await submitApprovalMutation.mutateAsync(offer.id);
      onOpenChange(false);
    } catch {
      // Handled by toast
    }
  };

  const isPendingMutation =
    updateStatusMutation.isPending || submitApprovalMutation.isPending;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-md bg-amber-500/10 text-amber-600">
              <Clock className="h-5 w-5" />
            </div>
            <div>
              <DialogTitle className="text-lg">Offer Status Management</DialogTitle>
              <DialogDescription className="text-xs">
                Manage publishing lifecycle for: {offer.title}
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <div className="space-y-4 py-2 text-xs">
          {/* Current State Info */}
          <div className="p-3 rounded-lg bg-muted/40 flex items-center justify-between">
            <div>
              <span className="text-muted-foreground block text-[11px]">Current Lifecycle State</span>
              <span className="font-bold text-foreground text-sm">{offer.status}</span>
            </div>
            <div className="text-right">
              <span className="text-muted-foreground block text-[11px]">Merchant</span>
              <span className="font-semibold text-foreground">{offer.merchant?.name}</span>
            </div>
          </div>

          {/* Backend Status Note */}
          <div className="p-3 rounded-md bg-blue-500/10 border border-blue-500/20 text-blue-700 dark:text-blue-300 space-y-1">
            <div className="flex items-center gap-1.5 font-semibold">
              <Info className="h-4 w-4 shrink-0" />
              <span>Backend Lifecycle Enforcement</span>
            </div>
            <p className="text-[11px] leading-relaxed">
              In accordance with Asli Cart MVP specifications, offers are submitted by Product Managers and reviewed by Super Admin.
              The backend currently implements lifecycle endpoints for submitting to approval (<code className="font-mono">PENDING_APPROVAL</code>), pausing (<code className="font-mono">PAUSED</code>), and retiring expired deals (<code className="font-mono">EXPIRED</code>).
            </p>
          </div>

          {/* Action Trigger Buttons */}
          <div className="space-y-2 pt-1">
            {offer.status === "DRAFT" && (
              <Button
                className="w-full justify-start text-xs h-9"
                onClick={handleSubmitForReview}
                disabled={isPendingMutation}
              >
                <Clock className="h-4 w-4 mr-2" />
                Submit to Admin Approval Queue
              </Button>
            )}

            {offer.status === "PUBLISHED" && (
              <Button
                variant="outline"
                className="w-full justify-start text-xs h-9 text-amber-600 hover:text-amber-700 hover:bg-amber-50 dark:hover:bg-amber-950/30"
                onClick={handlePause}
                disabled={isPendingMutation}
              >
                <PauseCircle className="h-4 w-4 mr-2" />
                Pause Published Offer
              </Button>
            )}

            {offer.status !== "EXPIRED" && (
              <Button
                variant="outline"
                className="w-full justify-start text-xs h-9 text-muted-foreground hover:text-foreground"
                onClick={handleExpire}
                disabled={isPendingMutation}
              >
                <XCircle className="h-4 w-4 mr-2" />
                Mark Offer as Expired
              </Button>
            )}
          </div>
        </div>

        <DialogFooter className="pt-2">
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => onOpenChange(false)}
            disabled={isPendingMutation}
          >
            Close
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

