import React from "react";
import { useQuery } from "@tanstack/react-query";
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
import { Tag, ExternalLink, Link2, TrendingDown, Store } from "lucide-react";
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
  const { data: offer, isLoading } = useQuery({
    queryKey: PM_OFFERS_QUERY_KEYS.detail(offerId || ""),
    queryFn: () => pmOfferService.getOfferById(offerId!),
    enabled: !!offerId && isOpen,
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

            {/* Tracked Affiliate Links */}
            <div className="space-y-2">
              <h4 className="font-semibold text-xs text-foreground flex items-center gap-1.5">
                <Link2 className="h-3.5 w-3.5 text-primary" />
                <span>Generated Affiliate Links ({offer.affiliateLinks?.length || 0})</span>
              </h4>

              {(!offer.affiliateLinks || offer.affiliateLinks.length === 0) ? (
                <div className="rounded-lg border border-dashed p-3 text-center text-muted-foreground text-[11px]">
                  No affiliate tracking link generated yet for this offer.
                </div>
              ) : (
                <div className="rounded-lg border divide-y divide-border bg-card">
                  {offer.affiliateLinks.map((link) => (
                    <div key={link.id} className="p-2.5 flex items-center justify-between gap-2 text-[11px]">
                      <div className="min-w-0 flex-1 font-mono truncate text-muted-foreground">
                        {link.affiliateUrl}
                      </div>
                      <Badge variant="outline" className="text-[10px] shrink-0">
                        {link.provider}
                      </Badge>
                    </div>
                  ))}
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
