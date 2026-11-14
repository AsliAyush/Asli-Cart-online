"use client";

import React, { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { Heart, ShoppingBag, Store, ShieldCheck, Tag } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { formatCurrency, truncateText } from "@/lib/utils";
import { useAuth } from "@/hooks/use-auth";
import { useAddToWishlist } from "../hooks/use-customer-wishlist";
import type { CustomerProductItem } from "../types";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

interface ProductCardProps {
  product: CustomerProductItem;
  isInWishlist?: boolean;
}

export function ProductCard({ product, isInWishlist = false }: ProductCardProps) {
  const { isAuthenticated, user } = useAuth();
  const isCustomer = isAuthenticated && user?.role === "CUSTOMER";
  const addToWishlistMutation = useAddToWishlist();
  const [showAuthDialog, setShowAuthDialog] = useState(false);

  const handleWishlistClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    if (!isCustomer) {
      setShowAuthDialog(true);
      return;
    }

    addToWishlistMutation.mutate(product.id);
  };

  const hasDiscount = product.discountPercentage > 0;
  const productUrl = `/products/${product.slug || product.id}`;

  return (
    <>
      <Card className="group relative flex flex-col overflow-hidden rounded-xl border border-border/80 bg-card transition-all duration-200 hover:-translate-y-1 hover:border-primary/40 hover:shadow-md">
        {/* Wishlist toggle button */}
        <button
          type="button"
          onClick={handleWishlistClick}
          disabled={addToWishlistMutation.isPending}
          className="absolute right-3 top-3 z-10 flex h-8 w-8 items-center justify-center rounded-full bg-background/80 backdrop-blur border border-border/60 text-muted-foreground transition-colors hover:text-rose-500 hover:border-rose-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
          aria-label={isInWishlist ? "In your wishlist" : "Add to wishlist"}
          title={isInWishlist ? "Saved in wishlist" : "Save to wishlist"}
        >
          <Heart
            className={`h-4 w-4 transition-transform ${isInWishlist ? "fill-rose-500 text-rose-500" : ""
              }`}
          />
        </button>

        {/* Product Image */}
        <Link href={productUrl} className="relative aspect-square w-full overflow-hidden bg-secondary/30 p-4 flex items-center justify-center">
          {product.mainImage ? (
            <Image
              src={product.mainImage}
              alt={product.name}
              fill
              sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, (max-width: 1280px) 33vw, 25vw"
              className="object-contain p-2 transition-transform duration-300 group-hover:scale-105"
              loading="lazy"
            />
          ) : (
            <div className="flex flex-col items-center justify-center text-muted-foreground/60 space-y-1">
              <ShoppingBag className="h-10 w-10 stroke-[1.5]" />
              <span className="text-[11px] font-medium">Asli Deal</span>
            </div>
          )}

          {/* Discount badge */}
          {hasDiscount && (
            <div className="absolute left-3 top-3">
              <Badge variant="deal" className="text-[11px] font-extrabold px-2 py-0.5 shadow-sm">
                {product.discountPercentage}% OFF
              </Badge>
            </div>
          )}
        </Link>

        {/* Content */}
        <CardContent className="flex flex-1 flex-col p-4 space-y-3">
          {/* Brand & Category */}
          <div className="flex items-center justify-between text-[11px] text-muted-foreground">
            <span className="font-semibold text-primary uppercase tracking-wider truncate max-w-[140px]">
              {product.brand || "Verified Brand"}
            </span>
            {product.category && (
              <span className="truncate max-w-[120px] bg-secondary/80 px-1.5 py-0.5 rounded text-[10px]">
                {product.category.name}
              </span>
            )}
          </div>

          {/* Title */}
          <Link href={productUrl} className="block group-hover:text-primary transition-colors">
            <h3 className="line-clamp-2 text-sm font-semibold leading-snug text-foreground">
              {product.name}
            </h3>
          </Link>

          {/* Pricing Section */}
          <div className="mt-auto pt-2 border-t border-border/50">
            {product.bestPrice !== null ? (
              <div className="flex items-baseline gap-2">
                <span className="text-lg font-bold text-foreground">
                  {formatCurrency(product.bestPrice)}
                </span>
                {product.originalPrice && product.originalPrice > product.bestPrice && (
                  <span className="text-xs text-muted-foreground line-through">
                    {formatCurrency(product.originalPrice)}
                  </span>
                )}
              </div>
            ) : (
              <span className="text-xs font-medium text-muted-foreground">
                Pricing on request
              </span>
            )}

            {/* Merchant Highlights */}
            <div className="mt-2 flex items-center justify-between text-xs text-muted-foreground">
              {product.merchantName ? (
                <div className="flex items-center gap-1.5 truncate">
                  <Store className="h-3.5 w-3.5 text-primary shrink-0" />
                  <span className="truncate font-medium text-foreground/80">
                    {product.merchantName}
                  </span>
                </div>
              ) : (
                <span className="text-[11px]">Compare stores</span>
              )}

              {product.totalOffers > 1 && (
                <Badge variant="outline" className="text-[10px] py-0 px-1.5 font-normal">
                  {product.totalOffers} stores
                </Badge>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Guest Authentication Prompt Dialog */}
      <Dialog open={showAuthDialog} onOpenChange={setShowAuthDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-lg">
              <ShieldCheck className="h-5 w-5 text-primary" />
              <span>Customer Sign In Required</span>
            </DialogTitle>
            <DialogDescription className="text-xs text-muted-foreground pt-1">
              Sign in with your verified customer account to add items to your wishlist, track price drops, and manage your deals.
            </DialogDescription>
          </DialogHeader>
          <div className="rounded-lg bg-secondary/50 p-3 text-xs text-foreground space-y-1">
            <p className="font-semibold">{product.name}</p>
            {product.bestPrice && (
              <p className="text-primary font-bold">{formatCurrency(product.bestPrice)}</p>
            )}
          </div>
          <DialogFooter className="gap-2 sm:gap-0">
            <Button variant="outline" size="sm" onClick={() => setShowAuthDialog(false)}>
              Continue Browsing
            </Button>
            <Button size="sm" asChild>
              <Link href={`/customer/login?returnUrl=${encodeURIComponent(productUrl)}`}>
                Sign In to Save
              </Link>
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}

