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
import { Skeleton } from "@/components/ui/skeleton";
import { Package, Tag, TrendingDown, Store, ExternalLink } from "lucide-react";
import { pmProductService } from "../product.service";
import { PM_PRODUCTS_QUERY_KEYS } from "../hooks/use-pm-products";

interface ProductDetailsDialogProps {
  productId: string | null;
  isOpen: boolean;
  onClose: () => void;
}

export function ProductDetailsDialog({
  productId,
  isOpen,
  onClose,
}: ProductDetailsDialogProps) {
  const { data: product, isLoading } = useQuery({
    queryKey: PM_PRODUCTS_QUERY_KEYS.detail(productId || ""),
    queryFn: () => pmProductService.getProductById(productId!),
    enabled: !!productId && isOpen,
  });

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-2xl max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-base">
            <Package className="h-4 w-4 text-primary" />
            <span>Product Details & Linked Offers</span>
          </DialogTitle>
          <DialogDescription className="text-xs">
            Complete specifications, merchant offer comparisons, and price benchmark history.
          </DialogDescription>
        </DialogHeader>

        {isLoading || !product ? (
          <div className="space-y-4 py-3">
            <Skeleton className="h-20 w-full" />
            <Skeleton className="h-32 w-full" />
            <Skeleton className="h-24 w-full" />
          </div>
        ) : (
          <div className="space-y-5 text-xs">
            {/* Header Product Card */}
            <div className="flex gap-4 p-4 rounded-xl bg-secondary/30 border">
              {product.mainImage && (
                <img
                  src={product.mainImage}
                  alt={product.name}
                  className="h-20 w-20 rounded-lg object-contain bg-white p-1 border shrink-0"
                />
              )}
              <div className="min-w-0 space-y-1.5 flex-1">
                <div className="flex items-center gap-2">
                  <Badge variant="deal" className="text-[10px]">
                    {product.status}
                  </Badge>
                  {product.isAssignedToSmm && (
                    <Badge variant="outline" className="text-[10px]">
                      SMM Assigned
                    </Badge>
                  )}
                </div>
                <h3 className="font-semibold text-sm text-foreground">{product.name}</h3>
                <p className="text-[11px] text-muted-foreground">
                  Slug: <span className="font-mono">{product.slug}</span> • Category:{" "}
                  <strong className="text-foreground">{product.category?.name}</strong>
                  {product.brand ? ` • Brand: ${product.brand}` : ""}
                </p>
                {product.description && (
                  <p className="text-xs text-muted-foreground/90 line-clamp-2">
                    {product.description}
                  </p>
                )}
              </div>
            </div>

            {/* Linked Merchant Offers */}
            <div className="space-y-2">
              <h4 className="font-semibold text-xs text-foreground flex items-center gap-1.5">
                <Tag className="h-3.5 w-3.5 text-primary" />
                <span>Associated Merchant Offers ({product.offers?.length || 0})</span>
              </h4>

              {(!product.offers || product.offers.length === 0) ? (
                <div className="rounded-lg border border-dashed p-4 text-center text-muted-foreground text-[11px]">
                  No merchant offers linked yet. Use the Offers section to create a deal for this product.
                </div>
              ) : (
                <div className="divide-y divide-border rounded-lg border bg-card">
                  {product.offers.map((offer) => (
                    <div key={offer.id} className="p-3 flex items-center justify-between gap-3 text-xs">
                      <div className="min-w-0 space-y-0.5">
                        <div className="flex items-center gap-2">
                          <span className="font-semibold text-foreground truncate">{offer.title}</span>
                          <Badge variant="outline" className="text-[10px] py-0">
                            {offer.merchant?.name || "Merchant"}
                          </Badge>
                          <Badge
                            variant={
                              offer.status === "PUBLISHED"
                                ? "deal"
                                : offer.status === "PENDING_APPROVAL"
                                ? "outline"
                                : "secondary"
                            }
                            className="text-[10px] py-0"
                          >
                            {offer.status}
                          </Badge>
                        </div>
                        <p className="text-[11px] text-muted-foreground">
                          Selling Price: <strong className="text-foreground">₹{Number(offer.sellingPrice).toLocaleString("en-IN")}</strong>{" "}
                          (MRP ₹{Number(offer.originalPrice).toLocaleString("en-IN")}) • Discount:{" "}
                          <strong className="text-emerald-600">{offer.discountPercentage}% OFF</strong>
                        </p>
                      </div>

                      <a
                        href={offer.originalUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-muted-foreground hover:text-foreground shrink-0 p-1"
                        title="View merchant link"
                      >
                        <ExternalLink className="h-3.5 w-3.5" />
                      </a>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Historical Price Points */}
            <div className="space-y-2">
              <h4 className="font-semibold text-xs text-foreground flex items-center gap-1.5">
                <TrendingDown className="h-3.5 w-3.5 text-amber-500" />
                <span>Recent Price Histories ({product.priceHistories?.length || 0})</span>
              </h4>

              {(!product.priceHistories || product.priceHistories.length === 0) ? (
                <div className="rounded-lg border border-dashed p-4 text-center text-muted-foreground text-[11px]">
                  No historical price records captured for this item yet.
                </div>
              ) : (
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                  {product.priceHistories.slice(0, 6).map((ph) => (
                    <div key={ph.id} className="rounded-lg border p-2 text-[11px] space-y-1 bg-secondary/20">
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-foreground">₹{Number(ph.price).toLocaleString("en-IN")}</span>
                        {ph.discountPercentage && (
                          <span className="text-emerald-600 font-semibold">{ph.discountPercentage}% OFF</span>
                        )}
                      </div>
                      <p className="text-[10px] text-muted-foreground">
                        {new Date(ph.recordedAt).toLocaleDateString()}
                      </p>
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
