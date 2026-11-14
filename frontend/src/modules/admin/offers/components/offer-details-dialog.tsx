"use client";

import React from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { useOfferDetails } from "../hooks/use-admin-offers";
import {
  Tag,
  Store,
  DollarSign,
  TrendingDown,
  Link as LinkIcon,
  CheckCircle2,
  AlertCircle,
  ExternalLink,
  Calendar,
  User,
  ShieldCheck,
} from "lucide-react";

interface OfferDetailsDialogProps {
  offerId: string | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function OfferDetailsDialog({
  offerId,
  open,
  onOpenChange,
}: OfferDetailsDialogProps) {
  const { data: offer, isLoading } = useOfferDetails(offerId);

  if (!offerId) return null;

  const getStatusBadge = (status?: string) => {
    switch (status) {
      case "PUBLISHED":
        return <Badge className="bg-emerald-500/10 text-emerald-600 border-emerald-500/20">Published</Badge>;
      case "PENDING_APPROVAL":
        return <Badge className="bg-amber-500/10 text-amber-600 border-amber-500/20">Pending Review</Badge>;
      case "APPROVED":
        return <Badge className="bg-blue-500/10 text-blue-600 border-blue-500/20">Approved</Badge>;
      case "DRAFT":
        return <Badge variant="secondary">Draft</Badge>;
      case "PAUSED":
        return <Badge variant="outline" className="text-amber-600">Paused</Badge>;
      case "EXPIRED":
        return <Badge variant="outline" className="text-muted-foreground">Expired</Badge>;
      case "REJECTED":
      default:
        return <Badge variant="destructive">Rejected</Badge>;
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-center justify-between gap-4">
            <div>
              <DialogTitle className="text-lg">Merchant Offer Review</DialogTitle>
              <DialogDescription className="text-xs font-mono">
                Offer ID: {offerId}
              </DialogDescription>
            </div>
            {offer && getStatusBadge(offer.status)}
          </div>
        </DialogHeader>

        {isLoading || !offer ? (
          <div className="space-y-4 py-4">
            <Skeleton className="h-20 w-full rounded-lg" />
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-24 w-full" />
          </div>
        ) : (
          <div className="space-y-5 py-2">
            {/* Offer Header Summary */}
            <div className="p-4 rounded-lg bg-muted/30 border space-y-2">
              <div className="flex items-center gap-2">
                <Badge variant="outline" className="text-[10px] font-semibold">
                  {offer.merchant?.name || "Merchant"}
                </Badge>
                <span className="text-xs text-muted-foreground">
                  Product: {offer.product?.name}
                </span>
              </div>
              <h3 className="text-base font-bold text-foreground">{offer.title}</h3>

              {/* Price Callout */}
              <div className="flex items-baseline gap-3 pt-1">
                <span className="text-2xl font-extrabold text-foreground tracking-tight">
                  {offer.currency || "INR"} {Number(offer.sellingPrice).toLocaleString()}
                </span>
                <span className="text-sm text-muted-foreground line-through">
                  {offer.currency || "INR"} {Number(offer.originalPrice).toLocaleString()}
                </span>
                {Number(offer.discountPercentage) > 0 && (
                  <Badge variant="deal" className="text-xs">
                    {Number(offer.discountPercentage)}% Discount
                  </Badge>
                )}
                {offer.couponCode && (
                  <Badge variant="secondary" className="font-mono text-xs">
                    Code: {offer.couponCode}
                  </Badge>
                )}
              </div>
            </div>

            {/* Lifecycle & Attribution Metadata */}
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 text-xs">
              <div className="p-2.5 rounded-md border bg-card">
                <div className="flex items-center gap-1.5 text-muted-foreground mb-1">
                  <User className="h-3.5 w-3.5" />
                  <span>Curator / Submitter</span>
                </div>
                <p className="font-medium text-foreground truncate">
                  {offer.createdBy?.fullName || "Staff Member"}
                </p>
              </div>

              <div className="p-2.5 rounded-md border bg-card">
                <div className="flex items-center gap-1.5 text-muted-foreground mb-1">
                  <Calendar className="h-3.5 w-3.5" />
                  <span>Price Verified At</span>
                </div>
                <p className="font-medium text-foreground">
                  {new Date(offer.priceVerifiedAt).toLocaleDateString()}
                </p>
              </div>

              <div className="p-2.5 rounded-md border bg-card col-span-2 sm:col-span-1">
                <div className="flex items-center gap-1.5 text-muted-foreground mb-1">
                  <Tag className="h-3.5 w-3.5" />
                  <span>Stock Availability</span>
                </div>
                <p className="font-medium text-foreground">{offer.availability}</p>
              </div>
            </div>

            {/* Affiliate Monetization Engine Status */}
            <div className="p-3.5 rounded-lg border bg-card space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <LinkIcon className="h-4 w-4 text-primary" />
                  <h4 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                    Affiliate Monetization Engine
                  </h4>
                </div>
                {offer.affiliateUrl ? (
                  <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-600">
                    <CheckCircle2 className="h-3.5 w-3.5" />
                    Monetized Affiliate Link Active
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-amber-600">
                    <AlertCircle className="h-3.5 w-3.5" />
                    Unmonetized Direct Link
                  </span>
                )}
              </div>

              <div className="space-y-1.5 text-xs pt-1">
                <div>
                  <span className="text-muted-foreground block text-[11px]">Original Merchant URL:</span>
                  <a
                    href={offer.originalUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-primary hover:underline font-mono text-[11px] truncate block"
                  >
                    {offer.originalUrl}
                  </a>
                </div>

                {offer.affiliateUrl && (
                  <div>
                    <span className="text-muted-foreground block text-[11px]">Auto-Generated Monetized Link:</span>
                    <p className="font-mono text-[11px] text-foreground truncate bg-muted/50 p-1.5 rounded-md">
                      {offer.affiliateUrl}
                    </p>
                  </div>
                )}
              </div>
            </div>

            {/* Historical Price Logs */}
            {offer.priceHistories && offer.priceHistories.length > 0 && (
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <TrendingDown className="h-4 w-4 text-primary" />
                  <h4 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                    Historical Price Benchmark Records
                  </h4>
                </div>
                <div className="border rounded-lg divide-y bg-card text-xs">
                  {offer.priceHistories.slice(0, 5).map((history) => (
                    <div key={history.id} className="p-2.5 flex items-center justify-between">
                      <span className="text-muted-foreground">
                        {new Date(history.recordedAt).toLocaleDateString(undefined, {
                          month: "short",
                          day: "numeric",
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </span>
                      <div className="flex items-center gap-2">
                        <Badge variant="secondary" className="font-mono text-[10px]">
                          {history.source}
                        </Badge>
                        <span className="font-bold text-foreground">
                          ₹{Number(history.price).toLocaleString()}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}

