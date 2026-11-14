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
import { useProductDetails } from "../hooks/use-admin-products";
import {
  Package,
  Tag,
  TrendingDown,
  User,
  Calendar,
  Layers,
  Store,
  ExternalLink,
} from "lucide-react";

interface ProductDetailsDialogProps {
  productId: string | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function ProductDetailsDialog({
  productId,
  open,
  onOpenChange,
}: ProductDetailsDialogProps) {
  const { data: product, isLoading } = useProductDetails(productId);

  if (!productId) return null;

  const getStatusBadge = (status?: string) => {
    switch (status) {
      case "APPROVED":
        return <Badge className="bg-emerald-500/10 text-emerald-600 border-emerald-500/20">Approved</Badge>;
      case "PENDING_APPROVAL":
        return <Badge className="bg-amber-500/10 text-amber-600 border-amber-500/20">Pending Review</Badge>;
      case "DRAFT":
        return <Badge variant="secondary">Draft</Badge>;
      case "REJECTED":
        return <Badge variant="destructive">Rejected</Badge>;
      case "ARCHIVED":
      default:
        return <Badge variant="outline">Archived</Badge>;
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-center justify-between gap-4">
            <div>
              <DialogTitle className="text-lg">Product Details & Oversight</DialogTitle>
              <DialogDescription className="text-xs font-mono">
                ID: {productId}
              </DialogDescription>
            </div>
            {product && getStatusBadge(product.status)}
          </div>
        </DialogHeader>

        {isLoading || !product ? (
          <div className="space-y-4 py-4">
            <div className="flex gap-4">
              <Skeleton className="h-28 w-28 rounded-lg" />
              <div className="flex-1 space-y-2">
                <Skeleton className="h-5 w-48" />
                <Skeleton className="h-4 w-32" />
                <Skeleton className="h-4 w-64" />
              </div>
            </div>
          </div>
        ) : (
          <div className="space-y-5 py-2">
            {/* Header info */}
            <div className="flex flex-col sm:flex-row gap-4 p-4 rounded-lg bg-muted/30 border">
              <div className="h-28 w-28 rounded-lg overflow-hidden border bg-background shrink-0 flex items-center justify-center">
                {product.mainImage ? (
                  <img
                    src={product.mainImage}
                    alt={product.name}
                    className="h-full w-full object-contain p-1"
                  />
                ) : (
                  <Package className="h-10 w-10 text-muted-foreground/40" />
                )}
              </div>
              <div className="min-w-0 flex-1 space-y-1.5">
                <div className="flex items-center gap-2 flex-wrap">
                  <Badge variant="outline" className="text-[10px]">
                    {product.category?.name || "Uncategorized"}
                  </Badge>
                  {product.brand && (
                    <span className="text-xs font-semibold text-muted-foreground">
                      Brand: {product.brand}
                    </span>
                  )}
                </div>
                <h3 className="text-base font-bold text-foreground leading-snug">
                  {product.name}
                </h3>
                <p className="text-xs text-muted-foreground font-mono truncate">
                  Slug: {product.slug}
                </p>
                {product.description && (
                  <p className="text-xs text-muted-foreground line-clamp-2 pt-1">
                    {product.description}
                  </p>
                )}
              </div>
            </div>

            {/* Meta attributes */}
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 text-xs">
              <div className="p-2.5 rounded-md border bg-card">
                <div className="flex items-center gap-1.5 text-muted-foreground mb-1">
                  <User className="h-3.5 w-3.5" />
                  <span>Product Manager</span>
                </div>
                <p className="font-medium text-foreground truncate">
                  {product.createdBy?.fullName || "System Admin"}
                </p>
              </div>

              <div className="p-2.5 rounded-md border bg-card">
                <div className="flex items-center gap-1.5 text-muted-foreground mb-1">
                  <Tag className="h-3.5 w-3.5" />
                  <span>Merchant Deals</span>
                </div>
                <p className="font-medium text-foreground">
                  {product.offers?.length || 0} active offers
                </p>
              </div>

              <div className="p-2.5 rounded-md border bg-card col-span-2 sm:col-span-1">
                <div className="flex items-center gap-1.5 text-muted-foreground mb-1">
                  <Calendar className="h-3.5 w-3.5" />
                  <span>Onboarded Date</span>
                </div>
                <p className="font-medium text-foreground">
                  {new Date(product.createdAt).toLocaleDateString()}
                </p>
              </div>
            </div>

            {/* Associated Merchant Offers */}
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <Store className="h-4 w-4 text-primary" />
                <h4 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  Associated Merchant Deals ({product.offers?.length || 0})
                </h4>
              </div>

              {!product.offers || product.offers.length === 0 ? (
                <div className="p-4 rounded-lg border border-dashed text-center text-xs text-muted-foreground">
                  No merchant offers linked to this product yet.
                </div>
              ) : (
                <div className="border rounded-lg divide-y bg-card text-xs">
                  {product.offers.map((offer) => (
                    <div key={offer.id} className="p-3 flex items-center justify-between gap-4">
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2">
                          <span className="font-semibold text-foreground truncate">
                            {offer.merchant?.name || "Merchant"}
                          </span>
                          <Badge variant="outline" className="text-[10px]">
                            {offer.status}
                          </Badge>
                        </div>
                        <p className="text-muted-foreground truncate text-[11px] mt-0.5">
                          {offer.title}
                        </p>
                      </div>
                      <div className="text-right shrink-0">
                        <div className="text-sm font-bold text-foreground">
                          {offer.currency || "INR"} {Number(offer.sellingPrice).toLocaleString()}
                        </div>
                        <span className="text-[11px] text-muted-foreground line-through">
                          {offer.currency || "INR"} {Number(offer.originalPrice).toLocaleString()}
                        </span>
                        {Number(offer.discountPercentage) > 0 && (
                          <span className="text-[11px] text-emerald-600 font-semibold ml-1.5">
                            {Number(offer.discountPercentage)}% OFF
                          </span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Price History Preview */}
            {product.priceHistories && product.priceHistories.length > 0 && (
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <TrendingDown className="h-4 w-4 text-primary" />
                  <h4 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                    Recent Benchmark Pricing Records
                  </h4>
                </div>
                <div className="border rounded-lg divide-y bg-card text-xs">
                  {product.priceHistories.slice(0, 5).map((history) => (
                    <div key={history.id} className="p-2.5 flex items-center justify-between">
                      <span className="text-muted-foreground">
                        {new Date(history.recordedAt).toLocaleDateString(undefined, {
                          month: "short",
                          day: "numeric",
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </span>
                      <div className="flex items-center gap-3">
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

