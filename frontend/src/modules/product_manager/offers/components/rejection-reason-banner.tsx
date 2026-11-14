import React from "react";
import { AlertCircle, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";

interface RejectionReasonBannerProps {
  reason: string;
  onEditClick?: () => void;
  onSubmitClick?: () => void;
}

export function RejectionReasonBanner({
  reason,
  onEditClick,
  onSubmitClick,
}: RejectionReasonBannerProps) {
  return (
    <div className="rounded-xl border border-destructive/40 bg-destructive/10 p-4 text-xs space-y-2">
      <div className="flex items-start gap-2.5">
        <AlertCircle className="h-4 w-4 text-destructive shrink-0 mt-0.5" />
        <div className="space-y-1 flex-1">
          <p className="font-semibold text-destructive">
            Offer Rejected by Super Admin
          </p>
          <p className="text-destructive/90 leading-relaxed bg-background/60 p-2.5 rounded-lg border border-destructive/20 font-mono text-[11px]">
            &quot;{reason}&quot;
          </p>
          <p className="text-[11px] text-muted-foreground">
            Please correct the identified pricing or affiliate parameters using Edit Offer, then resubmit for approval.
          </p>
        </div>
      </div>

      {(onEditClick || onSubmitClick) && (
        <div className="flex items-center justify-end gap-2 pt-1 border-t border-destructive/20">
          {onEditClick && (
            <Button
              variant="outline"
              size="sm"
              onClick={onEditClick}
              className="h-7 text-xs border-destructive/30 text-destructive hover:bg-destructive/10"
            >
              Edit & Correct Offer
            </Button>
          )}
          {onSubmitClick && (
            <Button
              size="sm"
              onClick={onSubmitClick}
              className="h-7 text-xs gap-1"
            >
              <span>Resubmit for Review</span>
              <ArrowRight className="h-3 w-3" />
            </Button>
          )}
        </div>
      )}
    </div>
  );
}

