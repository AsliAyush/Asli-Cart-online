"use client";

import React from "react";
import Link from "next/link";
import { Trash2, ShoppingBag, Store, ArrowRight, Loader2 } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { formatCurrency } from "@/lib/utils";
import { useRemoveFromWishlist } from "../hooks/use-customer-wishlist";
import type { CustomerWishlistItem } from "../types";

interface WishlistItemCardProps {
  item: CustomerWishlistItem;
}

export function WishlistItemCard({ item }: WishlistItemCardProps) {
  const removeMutation = useRemoveFromWishlist();
  const productUrl = `/products/${item.slug || item.productId}`;
  const [hasImageError, setHasImageError] = React.useState<boolean>(false);

  return (
    <Card className="flex flex-col sm:flex-row items-start sm:items-center justify-between p-4 gap-4 border-border/80 shadow-sm hover:border-primary/40 transition-colors">
      <div className="flex items-center gap-4 flex-1 min-w-0">
        <Link
          href={productUrl}
          className="relative h-20 w-20 shrink-0 overflow-hidden rounded-lg border border-border/70 bg-secondary/30 p-1 flex items-center justify-center"
        >
          {item.mainImage && !hasImageError ? (
            <img
              src={item.mainImage}
              alt={item.name}
              className="h-full w-full object-contain"
              onError={() => setHasImageError(true)}
            />
          ) : (
            <ShoppingBag className="h-8 w-8 text-muted-foreground/60" />
          )}

          {item.discountPercentage > 0 && (
            <div className="absolute top-1 left-1">
              <Badge variant="deal" className="text-[9px] py-0 px-1 font-bold">
                {item.discountPercentage}% OFF
              </Badge>
            </div>
          )}
        </Link>

        <div className="space-y-1 min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <span className="text-[11px] font-semibold text-primary uppercase">
              {item.brand || "Verified Brand"}
            </span>
            {item.category && (
              <span className="text-[10px] text-muted-foreground bg-secondary px-1.5 py-0.5 rounded">
                {item.category.name}
              </span>
            )}
          </div>

          <Link
            href={productUrl}
            className="block text-sm font-semibold text-foreground hover:text-primary transition-colors line-clamp-1"
          >
            {item.name}
          </Link>

          <div className="flex items-baseline gap-2 pt-0.5">
            {item.bestPrice !== null ? (
              <>
                <span className="text-base font-bold text-foreground">
                  {formatCurrency(item.bestPrice)}
                </span>
                {item.originalPrice && item.originalPrice > item.bestPrice && (
                  <span className="text-xs text-muted-foreground line-through">
                    {formatCurrency(item.originalPrice)}
                  </span>
                )}
              </>
            ) : (
              <span className="text-xs text-muted-foreground">Price unverified</span>
            )}

            {item.merchantName && (
              <span className="text-xs text-muted-foreground flex items-center gap-1 ml-2">
                <Store className="h-3 w-3 text-primary" />
                <span>{item.merchantName}</span>
              </span>
            )}
          </div>
        </div>
      </div>

      <div className="flex items-center gap-2 w-full sm:w-auto justify-end pt-2 sm:pt-0 border-t sm:border-t-0 border-border/40">
        <Button size="sm" asChild className="h-8 text-xs gap-1.5 font-semibold">
          <Link href={productUrl}>
            <span>View Deal Offers</span>
            <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        </Button>

        <Button
          type="button"
          variant="outline"
          size="icon"
          className="h-8 w-8 text-muted-foreground hover:text-destructive hover:border-destructive/30"
          disabled={removeMutation.isPending}
          onClick={() => removeMutation.mutate(item.itemId)}
          title="Remove from wishlist"
        >
          {removeMutation.isPending ? (
            <Loader2 className="h-3.5 w-3.5 animate-spin" />
          ) : (
            <Trash2 className="h-3.5 w-3.5" />
          )}
        </Button>
      </div>
    </Card>
  );
}

