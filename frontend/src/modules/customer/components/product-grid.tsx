"use client";

import React from "react";
import { ProductCard } from "./product-card";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { ShoppingBag, RefreshCw } from "lucide-react";
import type { CustomerProductItem } from "../types";

interface ProductGridProps {
  products: CustomerProductItem[];
  isLoading?: boolean;
  isError?: boolean;
  onRetry?: () => void;
  emptyTitle?: string;
  emptyDescription?: string;
  wishlistProductIds?: Set<string>;
}

export function ProductGrid({
  products,
  isLoading = false,
  isError = false,
  onRetry,
  emptyTitle = "No products found",
  emptyDescription = "Try adjusting your search keywords, category filters, or price range.",
  wishlistProductIds = new Set(),
}: ProductGridProps) {
  if (isLoading) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
        {Array.from({ length: 8 }).map((_, i) => (
          <Card key={i} className="flex flex-col overflow-hidden rounded-xl border border-border/60">
            <Skeleton className="aspect-square w-full rounded-none" />
            <CardContent className="p-4 space-y-3">
              <div className="flex justify-between">
                <Skeleton className="h-3 w-16" />
                <Skeleton className="h-3 w-12" />
              </div>
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-3/4" />
              <div className="pt-2 border-t border-border/40 flex justify-between items-center">
                <Skeleton className="h-5 w-24" />
                <Skeleton className="h-3 w-16" />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  if (isError) {
    return (
      <div className="rounded-xl border border-destructive/20 bg-destructive/5 p-8 text-center space-y-4 max-w-md mx-auto my-8">
        <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-destructive/10 text-destructive">
          <RefreshCw className="h-6 w-6" />
        </div>
        <div className="space-y-1">
          <h3 className="font-semibold text-foreground">Failed to load products</h3>
          <p className="text-xs text-muted-foreground">
            We encountered an issue retrieving verified deals from the catalog.
          </p>
        </div>
        {onRetry && (
          <Button variant="outline" size="sm" onClick={onRetry} className="gap-2">
            <RefreshCw className="h-3.5 w-3.5" />
            <span>Try Again</span>
          </Button>
        )}
      </div>
    );
  }

  if (products.length === 0) {
    return (
      <div className="rounded-xl border border-border/80 bg-card p-12 text-center space-y-4 max-w-md mx-auto my-8">
        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-secondary text-muted-foreground">
          <ShoppingBag className="h-7 w-7" />
        </div>
        <div className="space-y-1.5">
          <h3 className="text-lg font-semibold text-foreground">{emptyTitle}</h3>
          <p className="text-xs text-muted-foreground max-w-sm mx-auto">
            {emptyDescription}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
      {products.map((product) => (
        <ProductCard
          key={product.id}
          product={product}
          isInWishlist={wishlistProductIds.has(product.id)}
        />
      ))}
    </div>
  );
}

