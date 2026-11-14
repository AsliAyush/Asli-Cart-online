"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  ShoppingBag,
  Store,
  Trash2,
  ArrowRight,
  ShieldCheck,
  AlertCircle,
  Sparkles,
} from "lucide-react";
import { AuthGuard } from "@/components/shared/auth-guard";
import { StorefrontBreadcrumbs } from "@/components/layout/storefront";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { formatCurrency } from "@/lib/utils";
import {
  useCustomerCart,
  useClearCart,
  CartMerchantGroupCard,
} from "@/modules/customer";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

export default function CustomerCartPage() {
  const { data: cart, isLoading, isError } = useCustomerCart();
  const clearCartMutation = useClearCart();
  const [showClearDialog, setShowClearDialog] = useState(false);

  const itemsCount = cart?.itemsCount || 0;
  const merchantGroups = cart?.merchantGroups || [];

  const handleClearCart = () => {
    clearCartMutation.mutate(undefined, {
      onSuccess: () => setShowClearDialog(false),
    });
  };

  return (
    <AuthGuard allowedRoles={["CUSTOMER"]} portalType="customer">
      <div className="container mx-auto py-8 px-4 sm:px-6 max-w-5xl space-y-8">
        <StorefrontBreadcrumbs />

        {/* Page Heading */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <h1 className="text-2xl sm:text-3xl font-extrabold text-foreground">
                Your Deal Collection
              </h1>
              {itemsCount > 0 && (
                <Badge variant="outline" className="text-xs font-semibold">
                  {itemsCount} {itemsCount === 1 ? "Item" : "Items"}
                </Badge>
              )}
            </div>
            <p className="text-xs text-muted-foreground">
              Review saved merchant deals and proceed to each retailer&apos;s checkout separately.
            </p>
          </div>

          {itemsCount > 0 && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowClearDialog(true)}
              disabled={clearCartMutation.isPending}
              className="text-xs text-muted-foreground hover:text-destructive self-start sm:self-auto gap-1.5"
            >
              <Trash2 className="h-3.5 w-3.5" />
              <span>Clear Cart</span>
            </Button>
          )}
        </div>

        {isLoading ? (
          <div className="space-y-6">
            <Skeleton className="h-40 w-full rounded-xl" />
            <Skeleton className="h-40 w-full rounded-xl" />
          </div>
        ) : isError ? (
          <div className="rounded-xl border border-destructive/20 bg-destructive/5 p-8 text-center space-y-2">
            <AlertCircle className="h-8 w-8 text-destructive mx-auto" />
            <p className="text-xs text-destructive font-semibold">
              Unable to load your cart. Please try again.
            </p>
          </div>
        ) : itemsCount === 0 ? (
          /* Empty Cart State */
          <Card className="border-border/80 shadow-sm text-center py-16 px-6">
            <CardHeader className="space-y-3">
              <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-primary/10 text-primary">
                <ShoppingBag className="h-8 w-8" />
              </div>
              <CardTitle className="text-xl font-bold">Your Cart is Empty</CardTitle>
              <CardDescription className="text-xs max-w-md mx-auto leading-relaxed">
                You haven&apos;t added any merchant deals to your collection yet. Compare prices across certified retailers and start saving!
              </CardDescription>
            </CardHeader>
            <CardContent className="pt-2">
              <Button size="sm" asChild className="gap-2 font-semibold">
                <Link href="/deals">
                  <Sparkles className="h-4 w-4" />
                  <span>Discover Verified Deals</span>
                  <ArrowRight className="h-3.5 w-3.5" />
                </Link>
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-8">
            {/* Overview Summary Bar */}
            <div className="rounded-xl border border-border/80 bg-secondary/30 p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="space-y-0.5">
                <span className="text-xs font-semibold text-primary uppercase">
                  Multi-Store Collection
                </span>
                <p className="text-xs text-muted-foreground">
                  Saved across {merchantGroups.length}{" "}
                  {merchantGroups.length === 1 ? "merchant store" : "merchant stores"}.
                </p>
              </div>

              <div className="flex items-center gap-4 self-end sm:self-auto">
                <div className="text-right">
                  <span className="text-[10px] text-muted-foreground uppercase font-medium block">
                    Combined Value
                  </span>
                  <span className="text-lg font-black text-foreground">
                    {formatCurrency(cart?.subtotal || 0)}
                  </span>
                </div>
              </div>
            </div>

            {/* Merchant Groups */}
            <div className="space-y-6">
              {merchantGroups.map((group) => (
                <CartMerchantGroupCard
                  key={group.merchant.id}
                  group={group}
                />
              ))}
            </div>

            {/* Architecture Explanatory Notice */}
            <div className="rounded-xl border border-primary/20 bg-primary/5 p-4 sm:p-6 text-xs text-muted-foreground space-y-2">
              <h4 className="font-bold text-foreground text-sm flex items-center gap-2">
                <ShieldCheck className="h-4 w-4 text-primary" />
                <span>Why are merchant checkouts separate?</span>
              </h4>
              <p className="leading-relaxed">
                Asli Cart is an authentic deal discovery and comparison engine. We do not process customer payments, hold warehouse inventory, or bundle checkout across competing stores. Clicking <strong>Proceed to Store</strong> connects you directly to the merchant&apos;s verified checkout page with your deal reference attached.
              </p>
            </div>
          </div>
        )}

        {/* Clear Cart Confirmation Dialog */}
        <Dialog open={showClearDialog} onOpenChange={setShowClearDialog}>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle className="text-lg font-bold">Clear entire cart?</DialogTitle>
              <DialogDescription className="text-xs text-muted-foreground pt-1">
                Are you sure you want to remove all saved offers from your cart across all merchants?
              </DialogDescription>
            </DialogHeader>
            <DialogFooter className="gap-2 sm:gap-0">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowClearDialog(false)}
              >
                Keep Items
              </Button>
              <Button
                variant="destructive"
                size="sm"
                onClick={handleClearCart}
                disabled={clearCartMutation.isPending}
              >
                Clear Cart
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </AuthGuard>
  );
}
