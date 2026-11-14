"use client";

import React, { useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import {
  Store,
  ExternalLink,
  ShoppingBag,
  Tag,
  ShieldCheck,
  Calendar,
  AlertCircle,
  Copy,
  Check,
  ArrowLeft,
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
  useOfferDetails,
  useAddToCart,
  AffiliateRedirectDialog,
} from "@/modules/customer";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

export default function OfferDetailPage() {
  const params = useParams<{ id: string }>();
  const offerId = params.id;

  const { isAuthenticated, user } = useAuth();
  const isCustomer = isAuthenticated && user?.role === "CUSTOMER";

  const { data: offer, isLoading, isError } = useOfferDetails(offerId);
  const addToCartMutation = useAddToCart();

  const [isRedirectModalOpen, setIsRedirectModalOpen] = useState(false);
  const [copiedCoupon, setCopiedCoupon] = useState(false);
  const [showAuthDialog, setShowAuthDialog] = useState(false);

  const handleCopyCoupon = (code: string) => {
    navigator.clipboard.writeText(code);
    setCopiedCoupon(true);
    toast.success(`Coupon code ${code} copied!`);
    setTimeout(() => setCopiedCoupon(false), 2500);
  };

  const handleAddToCart = () => {
    if (!isCustomer) {
      setShowAuthDialog(true);
      return;
    }
    if (!offer) return;
    addToCartMutation.mutate({ offerId: offer.id, quantity: 1 });
  };

  if (isLoading) {
    return (
      <StorefrontLayout>
        <div className="container mx-auto py-8 px-4 sm:px-6 space-y-6 max-w-4xl">
          <Skeleton className="h-4 w-48" />
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Skeleton className="h-64 rounded-xl md:col-span-1" />
            <div className="space-y-4 md:col-span-2">
              <Skeleton className="h-6 w-32" />
              <Skeleton className="h-8 w-full" />
              <Skeleton className="h-10 w-48" />
              <Skeleton className="h-24 w-full" />
            </div>
          </div>
        </div>
      </StorefrontLayout>
    );
  }

  if (isError || !offer) {
    return (
      <StorefrontLayout>
        <div className="container mx-auto py-16 px-4 text-center max-w-md space-y-4">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-destructive/10 text-destructive">
            <AlertCircle className="h-7 w-7" />
          </div>
          <h2 className="text-xl font-bold text-foreground">Offer Not Available</h2>
          <p className="text-xs text-muted-foreground">
            This merchant offer has expired, reached its capacity, or is no longer published.
          </p>
          <Button variant="outline" size="sm" asChild>
            <Link href="/offers" className="gap-2">
              <ArrowLeft className="h-4 w-4" />
              <span>Browse Active Offers</span>
            </Link>
          </Button>
        </div>
      </StorefrontLayout>
    );
  }

  const isOutOfStock = offer.availability === "OUT_OF_STOCK";

  return (
    <StorefrontLayout>
      <div className="container mx-auto py-8 px-4 sm:px-6 space-y-6 max-w-4xl">
        <StorefrontBreadcrumbs />

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Left: Product Thumbnail & Merchant Badge */}
          <div className="space-y-4">
            <div className="relative aspect-square w-full overflow-hidden rounded-xl border border-border/80 bg-secondary/30 p-6 flex items-center justify-center">
              {offer.product.mainImage ? (
                <img
                  src={offer.product.mainImage}
                  alt={offer.product.name}
                  className="h-full w-full object-contain"
                />
              ) : (
                <Tag className="h-16 w-16 text-muted-foreground/40" />
              )}

              {offer.discountPercentage > 0 && (
                <div className="absolute left-3 top-3">
                  <Badge variant="deal" className="text-xs font-black px-2 py-0.5 shadow">
                    {offer.discountPercentage}% OFF
                  </Badge>
                </div>
              )}
            </div>

            {/* Merchant Info Card */}
            <Card className="border border-border/80 p-4 space-y-2">
              <div className="flex items-center gap-3">
                {offer.merchant.logoUrl ? (
                  <img
                    src={offer.merchant.logoUrl}
                    alt={offer.merchant.name}
                    className="h-10 w-10 rounded-lg object-contain bg-background border p-1"
                  />
                ) : (
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-primary font-bold">
                    <Store className="h-5 w-5" />
                  </div>
                )}
                <div>
                  <h4 className="font-bold text-sm text-foreground">
                    {offer.merchant.name}
                  </h4>
                  <span className="text-[11px] text-emerald-600 flex items-center gap-1">
                    <ShieldCheck className="h-3 w-3" />
                    <span>Verified Merchant</span>
                  </span>
                </div>
              </div>
            </Card>
          </div>

          {/* Right: Offer Details */}
          <div className="md:col-span-2 space-y-5">
            <div>
              <Link
                href={`/products/${offer.product.slug || offer.product.id}`}
                className="text-xs font-bold uppercase tracking-wider text-primary hover:underline"
              >
                {offer.product.brand || "Product Details"} &rarr;
              </Link>
              <h1 className="text-xl sm:text-2xl font-extrabold text-foreground mt-1">
                {offer.title}
              </h1>
              <p className="text-xs text-muted-foreground mt-1">
                For {offer.product.name}
              </p>
            </div>

            {/* Pricing Box */}
            <div className="rounded-xl border border-border/80 bg-secondary/20 p-5 space-y-3">
              <div className="flex items-baseline gap-3">
                <span className="text-3xl font-black text-foreground">
                  {formatCurrency(offer.sellingPrice)}
                </span>
                {offer.originalPrice > offer.sellingPrice && (
                  <span className="text-sm text-muted-foreground line-through">
                    {formatCurrency(offer.originalPrice)}
                  </span>
                )}
                {offer.savings > 0 && (
                  <span className="text-xs font-bold text-emerald-600">
                    Save {formatCurrency(offer.savings)} ({offer.discountPercentage}% off)
                  </span>
                )}
              </div>

              {/* Coupon code if present */}
              {offer.couponCode && (
                <div className="flex items-center gap-2 pt-1">
                  <span className="text-xs text-muted-foreground">Promo Code:</span>
                  <button
                    type="button"
                    onClick={() => handleCopyCoupon(offer.couponCode!)}
                    className="inline-flex items-center gap-1.5 rounded-lg border border-dashed border-primary/50 bg-primary/10 px-3 py-1 font-mono text-xs font-bold text-primary hover:bg-primary/20 transition-colors"
                  >
                    <span>{offer.couponCode}</span>
                    {copiedCoupon ? (
                      <Check className="h-3.5 w-3.5 text-emerald-600" />
                    ) : (
                      <Copy className="h-3.5 w-3.5 opacity-60" />
                    )}
                  </button>
                </div>
              )}

              {/* Verification & Expiry metadata */}
              <div className="flex flex-wrap items-center gap-3 text-xs text-muted-foreground pt-2 border-t border-border/50">
                {offer.priceVerifiedAt && (
                  <span className="flex items-center gap-1 text-emerald-600 font-medium">
                    <ShieldCheck className="h-3.5 w-3.5" />
                    <span>Price Verified</span>
                  </span>
                )}
                {offer.endDate && (
                  <span className="flex items-center gap-1">
                    <Calendar className="h-3.5 w-3.5" />
                    <span>Valid until {new Date(offer.endDate).toLocaleDateString()}</span>
                  </span>
                )}
                <Badge
                  variant="outline"
                  className={`text-[10px] ${
                    isOutOfStock
                      ? "text-rose-600 border-rose-300"
                      : "text-emerald-600 border-emerald-300"
                  }`}
                >
                  {isOutOfStock ? "Out of Stock" : "In Stock"}
                </Badge>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-3 pt-2">
              <Button
                variant="outline"
                size="lg"
                disabled={isOutOfStock || addToCartMutation.isPending}
                onClick={handleAddToCart}
                className="flex-1 gap-2 font-semibold"
              >
                <ShoppingBag className="h-4 w-4" />
                <span>Add to My Cart</span>
              </Button>

              <Button
                size="lg"
                disabled={isOutOfStock}
                onClick={() => setIsRedirectModalOpen(true)}
                className="flex-1 gap-2 font-bold shadow-md"
              >
                <span>Proceed to {offer.merchant.name}</span>
                <ExternalLink className="h-4 w-4" />
              </Button>
            </div>

            {/* Disclaimer */}
            <div className="rounded-lg border border-border/60 bg-muted/40 p-3 text-[11px] text-muted-foreground leading-relaxed">
              <span className="font-semibold text-foreground">Independent Merchant Fulfillment:</span>{" "}
              When you click Proceed, you are securely redirected to {offer.merchant.name} to complete payment and delivery. Asli Cart does not collect payment or fulfill customer orders.
            </div>
          </div>
        </div>

        {/* Affiliate Modal */}
        <AffiliateRedirectDialog
          open={isRedirectModalOpen}
          onOpenChange={setIsRedirectModalOpen}
          offer={{
            id: offer.id,
            title: offer.title,
            sellingPrice: offer.sellingPrice,
            merchant: offer.merchant,
          }}
        />

        {/* Guest Auth Dialog */}
        <Dialog open={showAuthDialog} onOpenChange={setShowAuthDialog}>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2 text-lg">
                <ShieldCheck className="h-5 w-5 text-primary" />
                <span>Sign In to Add to Cart</span>
              </DialogTitle>
              <DialogDescription className="text-xs text-muted-foreground pt-1">
                Please sign in with your verified customer account to add merchant deals to your shopping cart.
              </DialogDescription>
            </DialogHeader>
            <div className="rounded-lg bg-secondary/50 p-3 text-xs text-foreground space-y-1">
              <p className="font-semibold">{offer.title}</p>
            </div>
            <DialogFooter className="gap-2 sm:gap-0">
              <Button variant="outline" size="sm" onClick={() => setShowAuthDialog(false)}>
                Continue Browsing
              </Button>
              <Button size="sm" asChild>
                <Link href={`/customer/login?returnUrl=${encodeURIComponent(`/offers/${offerId}`)}`}>
                  Sign In Now
                </Link>
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </StorefrontLayout>
  );
}

