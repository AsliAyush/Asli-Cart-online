"use client";

import React from "react";
import Link from "next/link";
import { Heart, ShoppingBag, ArrowRight, AlertCircle, Sparkles } from "lucide-react";
import { AuthGuard } from "@/components/shared/auth-guard";
import { StorefrontBreadcrumbs } from "@/components/layout/storefront";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import {
  useCustomerWishlist,
  WishlistItemCard,
} from "@/modules/customer";

export default function CustomerWishlistPage() {
  const { data: wishlist, isLoading, isError } = useCustomerWishlist();

  const itemsCount = wishlist?.itemsCount || 0;
  const items = wishlist?.items || [];

  return (
    <AuthGuard allowedRoles={["CUSTOMER"]} portalType="customer">
      <div className="container mx-auto py-8 px-4 sm:px-6 max-w-4xl space-y-6">
        <StorefrontBreadcrumbs />

        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <h1 className="text-2xl sm:text-3xl font-extrabold text-foreground">
                My Saved Wishlist
              </h1>
              {itemsCount > 0 && (
                <Badge variant="outline" className="text-xs font-semibold">
                  {itemsCount} {itemsCount === 1 ? "Product" : "Products"}
                </Badge>
              )}
            </div>
            <p className="text-xs text-muted-foreground">
              Track authentic price drops and compare store offers for your favorite products.
            </p>
          </div>

          <Button size="sm" variant="outline" asChild className="self-start sm:self-auto gap-1.5 text-xs">
            <Link href="/products">
              <ShoppingBag className="h-3.5 w-3.5" />
              <span>Browse Products</span>
            </Link>
          </Button>
        </div>

        {isLoading ? (
          <div className="space-y-4">
            {Array.from({ length: 3 }).map((_, i) => (
              <Skeleton key={i} className="h-24 w-full rounded-xl" />
            ))}
          </div>
        ) : isError ? (
          <div className="rounded-xl border border-destructive/20 bg-destructive/5 p-8 text-center space-y-2">
            <AlertCircle className="h-8 w-8 text-destructive mx-auto" />
            <p className="text-xs text-destructive font-semibold">
              Unable to load your saved wishlist items.
            </p>
          </div>
        ) : itemsCount === 0 ? (
          <Card className="border-border/80 shadow-sm text-center py-16 px-6">
            <CardHeader className="space-y-3">
              <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-rose-500/10 text-rose-500">
                <Heart className="h-8 w-8" />
              </div>
              <CardTitle className="text-xl font-bold">Your Wishlist is Empty</CardTitle>
              <CardDescription className="text-xs max-w-md mx-auto leading-relaxed">
                Save products you are interested in by clicking the heart icon on any product card to monitor them for price drops.
              </CardDescription>
            </CardHeader>
            <CardContent className="pt-2">
              <Button size="sm" asChild className="gap-2 font-semibold">
                <Link href="/products">
                  <Sparkles className="h-4 w-4" />
                  <span>Discover Products</span>
                  <ArrowRight className="h-3.5 w-3.5" />
                </Link>
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-3">
            {items.map((item) => (
              <WishlistItemCard key={item.itemId} item={item} />
            ))}
          </div>
        )}
      </div>
    </AuthGuard>
  );
}
