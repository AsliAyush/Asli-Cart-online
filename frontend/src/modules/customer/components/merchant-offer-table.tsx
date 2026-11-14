"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  Store,
  ExternalLink,
  ShoppingBag,
  Tag,
  ShieldCheck,
  Copy,
  Check,
  CheckCircle2,
} from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { formatCurrency } from "@/lib/utils";
import { useAuth } from "@/hooks/use-auth";
import { useAddToCart } from "../hooks/use-customer-cart";
import { AffiliateRedirectDialog } from "./affiliate-redirect-dialog";
import type { CustomerProductOffer } from "../types";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

interface MerchantOfferTableProps {
  offers: CustomerProductOffer[];
  productName: string;
}

export function MerchantOfferTable({ offers, productName }: MerchantOfferTableProps) {
  const { isAuthenticated, user } = useAuth();
  const isCustomer = isAuthenticated && user?.role === "CUSTOMER";
  const addToCartMutation = useAddToCart();

  const [selectedOfferForRedirect, setSelectedOfferForRedirect] =
    useState<CustomerProductOffer | null>(null);
  const [copiedCoupon, setCopiedCoupon] = useState<string | null>(null);
  const [showAuthDialog, setShowAuthDialog] = useState(false);

  const handleCopyCoupon = (code: string) => {
    navigator.clipboard.writeText(code);
    setCopiedCoupon(code);
    toast.success(`Coupon code ${code} copied to clipboard!`);
    setTimeout(() => setCopiedCoupon(null), 2500);
  };

  const handleAddToCart = (offer: CustomerProductOffer) => {
    if (!isCustomer) {
      setShowAuthDialog(true);
      return;
    }
    addToCartMutation.mutate({ offerId: offer.id, quantity: 1 });
  };

  const handleProceedToStore = (offer: CustomerProductOffer) => {
    setSelectedOfferForRedirect(offer);
  };

  if (!offers || offers.length === 0) {
    return (
      <div className="rounded-xl border border-border/80 bg-card p-8 text-center text-xs text-muted-foreground">
        No active merchant offers are currently available for this product.
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="rounded-xl border border-border/80 bg-card overflow-hidden shadow-sm">
        <Table>
          <TableHeader>
            <TableRow className="bg-secondary/40 hover:bg-secondary/40">
              <TableHead className="font-semibold text-xs">Merchant Store</TableHead>
              <TableHead className="font-semibold text-xs">Deal Offer</TableHead>
              <TableHead className="font-semibold text-xs text-right">Price</TableHead>
              <TableHead className="font-semibold text-xs">Coupon</TableHead>
              <TableHead className="font-semibold text-xs">Availability</TableHead>
              <TableHead className="font-semibold text-xs text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {offers.map((offer, index) => {
              const isBestPrice = index === 0;
              const isOutOfStock = offer.availability === "OUT_OF_STOCK";

              return (
                <TableRow
                  key={offer.id}
                  className={`transition-colors ${
                    isBestPrice ? "bg-amber-500/5 hover:bg-amber-500/10" : "hover:bg-secondary/20"
                  }`}
                >
                  {/* Merchant Info */}
                  <TableCell className="align-middle">
                    <div className="flex items-center gap-2.5">
                      {offer.merchant.logoUrl ? (
                        <img
                          src={offer.merchant.logoUrl}
                          alt={offer.merchant.name}
                          className="h-8 w-8 rounded-lg object-contain bg-background border p-0.5"
                        />
                      ) : (
                        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-secondary text-primary font-bold text-xs">
                          <Store className="h-4 w-4" />
                        </div>
                      )}
                      <div>
                        <div className="flex items-center gap-1.5">
                          <span className="font-semibold text-xs text-foreground">
                            {offer.merchant.name}
                          </span>
                          {isBestPrice && (
                            <Badge variant="deal" className="text-[9px] py-0 px-1 font-bold">
                              Lowest Price
                            </Badge>
                          )}
                        </div>
                        {offer.priceVerifiedAt && (
                          <span className="flex items-center gap-1 text-[10px] text-emerald-600 font-medium">
                            <ShieldCheck className="h-3 w-3" />
                            <span>Verified</span>
                          </span>
                        )}
                      </div>
                    </div>
                  </TableCell>

                  {/* Title & Offer Description */}
                  <TableCell className="align-middle max-w-xs">
                    <p className="text-xs font-medium text-foreground line-clamp-2">
                      {offer.title}
                    </p>
                    <Link
                      href={`/offers/${offer.id}`}
                      className="text-[11px] text-primary hover:underline font-medium inline-block mt-0.5"
                    >
                      View offer details
                    </Link>
                  </TableCell>

                  {/* Price & Savings */}
                  <TableCell className="align-middle text-right">
                    <div className="flex flex-col items-end">
                      <span className="text-sm font-bold text-foreground">
                        {formatCurrency(offer.sellingPrice)}
                      </span>
                      {offer.originalPrice > offer.sellingPrice && (
                        <div className="flex items-center gap-1.5 text-[11px]">
                          <span className="text-muted-foreground line-through">
                            {formatCurrency(offer.originalPrice)}
                          </span>
                          <span className="font-semibold text-emerald-600">
                            {offer.discountPercentage}% OFF
                          </span>
                        </div>
                      )}
                    </div>
                  </TableCell>

                  {/* Coupon Code */}
                  <TableCell className="align-middle">
                    {offer.couponCode ? (
                      <button
                        type="button"
                        onClick={() => handleCopyCoupon(offer.couponCode!)}
                        className="inline-flex items-center gap-1.5 rounded-md border border-dashed border-primary/40 bg-primary/5 px-2 py-1 text-[11px] font-mono font-medium text-primary hover:bg-primary/10 transition-colors"
                        title="Click to copy coupon code"
                      >
                        <Tag className="h-3 w-3" />
                        <span>{offer.couponCode}</span>
                        {copiedCoupon === offer.couponCode ? (
                          <Check className="h-3 w-3 text-emerald-600" />
                        ) : (
                          <Copy className="h-3 w-3 opacity-60" />
                        )}
                      </button>
                    ) : (
                      <span className="text-xs text-muted-foreground">—</span>
                    )}
                  </TableCell>

                  {/* Availability */}
                  <TableCell className="align-middle">
                    {isOutOfStock ? (
                      <Badge variant="outline" className="text-[10px] text-rose-600 border-rose-300">
                        Out of Stock
                      </Badge>
                    ) : (
                      <Badge variant="outline" className="text-[10px] text-emerald-600 border-emerald-300">
                        In Stock
                      </Badge>
                    )}
                  </TableCell>

                  {/* Action Buttons */}
                  <TableCell className="align-middle text-right">
                    <div className="flex items-center justify-end gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleAddToCart(offer)}
                        disabled={isOutOfStock || addToCartMutation.isPending}
                        className="h-8 text-xs gap-1.5"
                      >
                        <ShoppingBag className="h-3.5 w-3.5" />
                        <span className="hidden sm:inline">Add to Cart</span>
                      </Button>

                      <Button
                        size="sm"
                        onClick={() => handleProceedToStore(offer)}
                        disabled={isOutOfStock}
                        className="h-8 text-xs gap-1.5 font-semibold"
                      >
                        <span>Go to Store</span>
                        <ExternalLink className="h-3.5 w-3.5" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </div>

      {/* Outbound Affiliate Redirect Confirmation Modal */}
      <AffiliateRedirectDialog
        open={Boolean(selectedOfferForRedirect)}
        onOpenChange={(open) => {
          if (!open) setSelectedOfferForRedirect(null);
        }}
        offer={selectedOfferForRedirect}
      />

      {/* Guest Authentication Prompt Dialog */}
      <Dialog open={showAuthDialog} onOpenChange={setShowAuthDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-lg">
              <ShieldCheck className="h-5 w-5 text-primary" />
              <span>Sign In to Add to Cart</span>
            </DialogTitle>
            <DialogDescription className="text-xs text-muted-foreground pt-1">
              Please sign in with your verified customer account to add merchant deals to your shopping collection.
            </DialogDescription>
          </DialogHeader>
          <div className="rounded-lg bg-secondary/50 p-3 text-xs text-foreground space-y-1">
            <p className="font-semibold">{productName}</p>
          </div>
          <DialogFooter className="gap-2 sm:gap-0">
            <Button variant="outline" size="sm" onClick={() => setShowAuthDialog(false)}>
              Continue Browsing
            </Button>
            <Button size="sm" asChild>
              <Link href={`/customer/login?returnUrl=${encodeURIComponent(typeof window !== "undefined" ? window.location.pathname : "/")}`}>
                Sign In Now
              </Link>
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

