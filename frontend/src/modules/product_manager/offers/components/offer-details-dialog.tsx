import React from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Tag,
  ExternalLink,
  Link2,
  TrendingDown,
  Store,
  RotateCw,
  CheckCircle2,
  AlertTriangle,
} from "lucide-react";
import { toast } from "sonner";
import { pmOfferService } from "../offer.service";
import { PM_OFFERS_QUERY_KEYS } from "../hooks/use-pm-offers";
import { RejectionReasonBanner } from "./rejection-reason-banner";

interface OfferDetailsDialogProps {
  offerId: string | null;
  isOpen: boolean;
  onClose: () => void;
  onEditClick?: () => void;
  onSubmitApprovalClick?: () => void;
}

export function OfferDetailsDialog({
  offerId,
  isOpen,
  onClose,
  onEditClick,
  onSubmitApprovalClick,
}: OfferDetailsDialogProps) {
  const queryClient = useQueryClient();
  const { data: offer, isLoading } = useQuery({
    queryKey: PM_OFFERS_QUERY_KEYS.detail(offerId || ""),
    queryFn: () => pmOfferService.getOfferById(offerId!),
    enabled: !!offerId && isOpen,
  });

  const convertMutation = useMutation({
    mutationFn: () => pmOfferService.convertAffiliateLink(offerId!),
    onSuccess: (data) => {
      toast.success(`Affiliate status: ${data.conversionStatus}`);
      queryClient.invalidateQueries({ queryKey: PM_OFFERS_QUERY_KEYS.detail(offerId!) });
      queryClient.invalidateQueries({ queryKey: ["pm", "offers"] });
    },
    onError: (err: any) => {
      toast.error(err?.response?.data?.message || err?.message || "Failed to convert affiliate link");
    },
  });

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-2xl max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-base">
            <Tag className="h-4 w-4 text-primary" />
            <span>Merchant Offer Details</span>
          </DialogTitle>
          <DialogDescription className="text-xs">
            Review status, rejection rationales, verified pricing, and tracked affiliate links.
          </DialogDescription>
        </DialogHeader>

        {isLoading || !offer ? (
          <div className="space-y-4 py-3">
            <Skeleton className="h-20 w-full" />
            <Skeleton className="h-32 w-full" />
            <Skeleton className="h-24 w-full" />
          </div>
        ) : (
          <div className="space-y-4 text-xs">
            {/* Rejection Reason Notice if REJECTED */}
            {offer.status === "REJECTED" && offer.rejectionReason && (
              <RejectionReasonBanner
                reason={offer.rejectionReason}
                onEditClick={onEditClick}
                onSubmitClick={onSubmitApprovalClick}
              />
            )}

            {/* Offer Overview Card */}
            <div className="rounded-xl border bg-secondary/30 p-4 space-y-3">
              <div className="flex items-center justify-between">
                <span className="font-semibold text-sm text-foreground">{offer.title}</span>
                <Badge
                  variant={
                    offer.status === "PUBLISHED"
                      ? "deal"
                      : offer.status === "APPROVED"
                      ? "default"
                      : offer.status === "PENDING_APPROVAL"
                      ? "outline"
                      : offer.status === "REJECTED"
                      ? "destructive"
                      : "secondary"
                  }
                  className="text-[10px]"
                >
                  {offer.status}
                </Badge>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
                <div className="rounded-lg bg-background p-2 border">
                  <span className="text-[11px] text-muted-foreground block">MRP</span>
                  <span className="font-bold text-foreground">
                    ₹{Number(offer.originalPrice).toLocaleString("en-IN")}
                  </span>
                </div>
                <div className="rounded-lg bg-background p-2 border">
                  <span className="text-[11px] text-muted-foreground block">Selling</span>
                  <span className="font-bold text-foreground">
                    ₹{Number(offer.sellingPrice).toLocaleString("en-IN")}
                  </span>
                </div>
                <div className="rounded-lg bg-background p-2 border">
                  <span className="text-[11px] text-muted-foreground block">Discount</span>
                  <span className="font-bold text-emerald-600">
                    {offer.discountPercentage}% OFF
                  </span>
                </div>
                <div className="rounded-lg bg-background p-2 border">
                  <span className="text-[11px] text-muted-foreground block">Store</span>
                  <span className="font-bold text-primary truncate block">
                    {offer.merchant?.name || "Merchant"}
                  </span>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 pt-1 border-t text-[11px] text-muted-foreground">
                <span>
                  Linked Product: <strong className="text-foreground">{offer.product?.name}</strong>
                </span>
                <a
                  href={offer.originalUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-primary hover:underline flex items-center gap-1 font-medium"
                >
                  <span>Open Merchant URL</span>
                  <ExternalLink className="h-3 w-3" />
                </a>
              </div>
            </div>

            {/* Tracked Affiliate Links & Cuelinks Conversion */}
            <div className="space-y-3 p-3 rounded-xl border bg-card">
              <div className="flex items-center justify-between">
                <h4 className="font-semibold text-xs text-foreground flex items-center gap-1.5">
                  <Link2 className="h-3.5 w-3.5 text-primary" />
                  <span>Cuelinks V3 Affiliate Status</span>
                </h4>
                <div className="flex items-center gap-2">
                  <Badge
                    variant={
                      (offer as any).conversionStatus === "CONVERTED"
                        ? "default"
                        : (offer as any).conversionStatus === "FAILED"
                        ? "destructive"
                        : "secondary"
                    }
                    className="text-[10px]"
                  >
                    {(offer as any).conversionStatus || "PENDING"}
                  </Badge>
                  <Button
                    variant="outline"
                    size="sm"
                    className="h-7 text-xs gap-1"
                    onClick={() => convertMutation.mutate()}
                    disabled={convertMutation.isPending}
                  >
                    <RotateCw className={`h-3 w-3 ${convertMutation.isPending ? "animate-spin" : ""}`} />
                    <span>Convert / Retry</span>
                  </Button>
                </div>
              </div>

              {(offer as any).affiliateUrl ? (
                <div className="p-2.5 bg-primary/5 border border-primary/20 rounded-lg font-mono text-[11px] break-all flex items-center justify-between gap-2">
                  <span className="text-primary font-medium">{(offer as any).affiliateUrl}</span>
                  <a
                    href={(offer as any).affiliateUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-primary hover:underline shrink-0"
                    title="Open tracking URL"
                  >
                    <ExternalLink className="h-3.5 w-3.5" />
                  </a>
                </div>
              ) : (
                <div className="p-2 bg-muted/30 border border-dashed rounded text-muted-foreground italic text-[11px]">
                  No affiliate link generated. Traffic routes to original URL.
                </div>
              )}

              {(offer as any).conversionError && (
                <div className="flex items-center gap-1.5 text-[11px] text-destructive bg-destructive/10 p-2 rounded">
                  <AlertTriangle className="h-3 w-3 shrink-0" />
                  <span>Notice: {(offer as any).conversionError}</span>
                </div>
              )}
            </div>

            {/* Price History Points */}
            <div className="space-y-2">
              <h4 className="font-semibold text-xs text-foreground flex items-center gap-1.5">
                <TrendingDown className="h-3.5 w-3.5 text-amber-500" />
                <span>Offer Price Drops ({offer.priceHistories?.length || 0})</span>
              </h4>

              {(!offer.priceHistories || offer.priceHistories.length === 0) ? (
                <div className="rounded-lg border border-dashed p-3 text-center text-muted-foreground text-[11px]">
                  No historical price records linked to this offer yet.
                </div>
              ) : (
                <div className="grid grid-cols-2 gap-2">
                  {offer.priceHistories.slice(0, 4).map((ph) => (
                    <div key={ph.id} className="rounded border p-2 text-[11px] bg-secondary/20">
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-foreground">₹{Number(ph.price).toLocaleString("en-IN")}</span>
                        <span className="text-[10px] text-muted-foreground">
                          {new Date(ph.recordedAt).toLocaleDateString()}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
