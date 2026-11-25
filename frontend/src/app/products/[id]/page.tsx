"use client";

import React, { useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import {
  Heart,
  Store,
  ShieldCheck,
  Tag,
  ArrowLeft,
  ShoppingBag,
  ExternalLink,
  Layers,
  AlertCircle,
  Clock,
  Sparkles,
} from "lucide-react";
import { StorefrontLayout, StorefrontBreadcrumbs } from "@/components/layout/storefront";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { formatCurrency } from "@/lib/utils";
import { useAuth } from "@/hooks/use-auth";
import {
  useCustomerProductDetails,
  useCustomerWishlist,
  useAddToWishlist,
  useRemoveFromWishlist,
  MerchantOfferTable,
} from "@/modules/customer";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

export default function ProductDetailPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const idOrSlug = params.id;

  const { isAuthenticated, user } = useAuth();
  const isCustomer = isAuthenticated && user?.role === "CUSTOMER";

  const { data: product, isLoading, isError } = useCustomerProductDetails(idOrSlug);
  const { data: wishlistData } = useCustomerWishlist();
  const addToWishlistMutation = useAddToWishlist();
  const removeFromWishlistMutation = useRemoveFromWishlist();

  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const [showAuthDialog, setShowAuthDialog] = useState(false);
  const [hasImageError, setHasImageError] = useState(false);

  const wishlistItem = wishlistData?.items.find((i) => i.productId === product?.id);
  const isWishlisted = Boolean(wishlistItem);

  const handleWishlistToggle = () => {
    if (!isCustomer) {
      setShowAuthDialog(true);
      return;
    }

    if (!product) return;

    if (isWishlisted && wishlistItem) {
      removeFromWishlistMutation.mutate(wishlistItem.itemId);
    } else {
      addToWishlistMutation.mutate(product.id);
    }
  };

  if (isLoading) {
    return (
      <StorefrontLayout>
        <div className="container mx-auto py-8 px-4 sm:px-6 space-y-8 max-w-6xl">
          <Skeleton className="h-4 w-48" />
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <Skeleton className="aspect-square w-full rounded-xl" />
            <div className="space-y-4">
              <Skeleton className="h-4 w-24" />
              <Skeleton className="h-8 w-3/4" />
              <Skeleton className="h-6 w-32" />
              <Skeleton className="h-20 w-full" />
              <Skeleton className="h-10 w-full" />
            </div>
          </div>
        </div>
      </StorefrontLayout>
    );
  }

  if (isError || !product) {
    return (
      <StorefrontLayout>
        <div className="container mx-auto py-16 px-4 text-center max-w-md space-y-4">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-destructive/10 text-destructive">
            <AlertCircle className="h-7 w-7" />
          </div>
          <h2 className="text-xl font-bold text-foreground">Product Unavailable</h2>
          <p className="text-xs text-muted-foreground">
            This product could not be found or has no active merchant offers available.
          </p>
          <Button variant="outline" size="sm" asChild>
            <Link href="/products" className="gap-2">
              <ArrowLeft className="h-4 w-4" />
              <span>Back to Products</span>
            </Link>
          </Button>
        </div>
      </StorefrontLayout>
    );
  }

  const allImages = [
    ...(product.mainImage ? [product.mainImage] : []),
    ...(product.additionalImages || []),
  ];
  const currentImage = allImages[activeImageIndex] || product.mainImage;
  const bestOffer = product.offers[0] || null;

  return (
    <StorefrontLayout>
      <div className="container mx-auto py-8 px-4 sm:px-6 space-y-8 max-w-6xl">
        {/* Navigation Breadcrumbs */}
        <StorefrontBreadcrumbs />

        {/* Product Overview Section */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 lg:gap-12">
          {/* Left: Image Gallery */}
          <div className="space-y-4">
            <div className="relative aspect-square w-full overflow-hidden rounded-2xl border border-border/80 bg-secondary/20 p-6 flex items-center justify-center shadow-sm">
              {currentImage && !hasImageError ? (
                <img
                  src={currentImage}
                  alt={product.name}
                  className="h-full w-full object-contain"
                  onError={() => setHasImageError(true)}
                />
              ) : (
                <ShoppingBag className="h-20 w-20 text-muted-foreground/40" />
              )}

              {product.maxDiscount > 0 && (
                <div className="absolute left-4 top-4">
                  <Badge variant="deal" className="text-xs font-black px-2.5 py-1 shadow">
                    UP TO {product.maxDiscount}% OFF
                  </Badge>
                </div>
              )}
            </div>

            {/* Thumbnail row */}
            {allImages.length > 1 && (
              <div className="flex gap-2 overflow-x-auto pb-2">
                {allImages.map((img, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => setActiveImageIndex(idx)}
                    className={`h-16 w-16 shrink-0 rounded-lg border bg-secondary/30 p-1 overflow-hidden transition-all ${
                      activeImageIndex === idx
                        ? "border-primary ring-2 ring-primary/20"
                        : "border-border/60 opacity-70 hover:opacity-100"
                    }`}
                  >
                    <img
                      src={img}
                      alt={`Thumbnail ${idx + 1}`}
                      className="h-full w-full object-contain"
                    />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Right: Product Details & Best Price Highlight */}
          <div className="flex flex-col space-y-5">
            {/* Brand & Category tags */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="font-bold text-xs uppercase tracking-wider text-primary">
                  {product.brand || "Verified Brand"}
                </span>
                {product.category && (
                  <Badge variant="outline" className="text-[10px] font-medium">
                    {product.category.name}
                  </Badge>
                )}
              </div>

              {/* Wishlist button */}
              <Button
                variant="outline"
                size="sm"
                onClick={handleWishlistToggle}
                disabled={
                  addToWishlistMutation.isPending ||
                  removeFromWishlistMutation.isPending
                }
                className={`gap-1.5 text-xs ${
                  isWishlisted
                    ? "text-rose-500 border-rose-300 bg-rose-500/5 hover:bg-rose-500/10"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                <Heart
                  className={`h-4 w-4 ${isWishlisted ? "fill-rose-500" : ""}`}
                />
                <span>{isWishlisted ? "Saved in Wishlist" : "Save to Wishlist"}</span>
              </Button>
            </div>

            {/* Title */}
            <h1 className="text-xl sm:text-2xl md:text-3xl font-extrabold text-foreground tracking-tight leading-tight">
              {product.name}
            </h1>

            {/* Best Deal Card */}
            {bestOffer && (
              <div className="rounded-xl border border-primary/30 bg-primary/5 p-4 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-primary uppercase flex items-center gap-1.5">
                    <Sparkles className="h-3.5 w-3.5 text-amber-500" />
                    <span>Best Price Today</span>
                  </span>
                  <span className="text-xs text-muted-foreground">
                    Available on <strong className="text-foreground">{bestOffer.merchant.name}</strong>
                  </span>
                </div>

                <div className="flex items-baseline gap-3">
                  <span className="text-3xl font-black text-foreground">
                    {formatCurrency(bestOffer.sellingPrice)}
                  </span>
                  {bestOffer.originalPrice > bestOffer.sellingPrice && (
                    <span className="text-sm text-muted-foreground line-through">
                      {formatCurrency(bestOffer.originalPrice)}
                    </span>
                  )}
                  {bestOffer.discountPercentage > 0 && (
                    <Badge variant="deal" className="font-bold text-xs">
                      {bestOffer.discountPercentage}% OFF
                    </Badge>
                  )}
                </div>

                {bestOffer.priceVerifiedAt && (
                  <p className="text-[11px] text-emerald-600 font-medium flex items-center gap-1 pt-1">
                    <ShieldCheck className="h-3.5 w-3.5" />
                    <span>Price verified by Asli Cart</span>
                  </p>
                )}
              </div>
            )}

            {/* Description */}
            {product.description && (
              <div className="space-y-1 pt-2">
                <h3 className="text-xs font-semibold uppercase text-muted-foreground tracking-wider">
                  Description
                </h3>
                <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
                  {product.description}
                </p>
              </div>
            )}

            {/* Technical Specifications */}
            {product.specifications && Object.keys(product.specifications).length > 0 && (
              <div className="space-y-2 pt-2 border-t border-border/60">
                <h3 className="text-xs font-semibold uppercase text-muted-foreground tracking-wider">
                  Specifications
                </h3>
                <div className="grid grid-cols-2 gap-2 text-xs">
                  {Object.entries(product.specifications).map(([key, val]) => (
                    <div key={key} className="rounded-lg bg-secondary/40 p-2 space-y-0.5">
                      <span className="text-[10px] text-muted-foreground uppercase font-semibold">
                        {key}
                      </span>
                      <p className="font-medium text-foreground truncate">
                        {String(val)}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Multi-Merchant Offer Comparison Table Section */}
        <section className="space-y-4 pt-8 border-t border-border/60">
          <div className="space-y-1">
            <h2 className="text-xl font-bold tracking-tight text-foreground flex items-center gap-2">
              <Store className="h-5 w-5 text-primary" />
              <span>Compare Store Offers ({product.offers.length})</span>
            </h2>
            <p className="text-xs text-muted-foreground">
              Real-time prices across verified Indian merchants. Choose your preferred store to add to cart or proceed to buy.
            </p>
          </div>

          <MerchantOfferTable
            offers={product.offers}
            productName={product.name}
          />
        </section>

        {/* Guest Auth Dialog */}
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
            </div>
            <DialogFooter className="gap-2 sm:gap-0">
              <Button variant="outline" size="sm" onClick={() => setShowAuthDialog(false)}>
                Continue Browsing
              </Button>
              <Button size="sm" asChild>
                <Link href={`/customer/login?returnUrl=${encodeURIComponent(`/products/${idOrSlug}`)}`}>
                  Sign In to Save
                </Link>
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </StorefrontLayout>
  );
}

