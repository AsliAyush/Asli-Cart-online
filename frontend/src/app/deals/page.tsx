"use client";

import React, { Suspense, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { Flame, ChevronLeft, ChevronRight, Tag } from "lucide-react";
import { Button } from "@/components/ui/button";
import { SectionHeading } from "@/components/shared/section-heading";
import { StorefrontLayout, StorefrontBreadcrumbs } from "@/components/layout/storefront";
import {
  ProductGrid,
  ProductFilters,
  useCustomerProducts,
  useCustomerWishlist,
  type ListCustomerProductsParams,
} from "@/modules/customer";

function DealsContent() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [filters, setFilters] = useState<ListCustomerProductsParams>({
    page: Number(searchParams.get("page") || "1"),
    limit: 16,
    search: searchParams.get("search") || "",
    category: searchParams.get("category") || undefined,
    minDiscount: searchParams.get("minDiscount")
      ? Number(searchParams.get("minDiscount"))
      : 10, // Default to genuine 10%+ discounts
    sort: "discount_desc",
  });

  const { data, isLoading, isError, refetch } = useCustomerProducts(filters);
  const { data: wishlistData } = useCustomerWishlist();
  const wishlistProductIds = new Set(
    wishlistData?.items.map((i) => i.productId) || []
  );

  const updateFilters = (newFilters: Partial<ListCustomerProductsParams>) => {
    setFilters((prev) => ({ ...prev, ...newFilters }));
  };

  const handleReset = () => {
    setFilters({ page: 1, limit: 16, minDiscount: 10, sort: "discount_desc" });
  };

  const pagination = data?.pagination || {
    page: 1,
    limit: 16,
    total: 0,
    totalPages: 1,
  };

  return (
    <div className="container mx-auto py-8 px-4 sm:px-6 space-y-6">
      <StorefrontBreadcrumbs />

      <SectionHeading
        badge="Hot Deals"
        title="Verified Discount Drops"
        subtitle="Exclusive price drops filtered directly from published merchant feeds. No expired codes or pre-inflated festive prices."
      />

      <ProductFilters
        filters={filters}
        onFilterChange={updateFilters}
        onReset={handleReset}
      />

      <ProductGrid
        products={data?.items || []}
        isLoading={isLoading}
        isError={isError}
        onRetry={refetch}
        wishlistProductIds={wishlistProductIds}
        emptyTitle="No hot deals found"
        emptyDescription="We could not find any active deals matching your criteria. Try lowering the minimum discount filter."
      />

      {pagination.totalPages > 1 && (
        <div className="flex items-center justify-between border-t border-border/60 pt-6">
          <Button
            variant="outline"
            size="sm"
            disabled={pagination.page <= 1 || isLoading}
            onClick={() => updateFilters({ page: pagination.page - 1 })}
            className="gap-1 text-xs"
          >
            <ChevronLeft className="h-3.5 w-3.5" />
            <span>Previous</span>
          </Button>

          <span className="text-xs text-muted-foreground font-medium">
            Page {pagination.page} of {pagination.totalPages}
          </span>

          <Button
            variant="outline"
            size="sm"
            disabled={pagination.page >= pagination.totalPages || isLoading}
            onClick={() => updateFilters({ page: pagination.page + 1 })}
            className="gap-1 text-xs"
          >
            <span>Next</span>
            <ChevronRight className="h-3.5 w-3.5" />
          </Button>
        </div>
      )}
    </div>
  );
}

export default function DealsPage() {
  return (
    <StorefrontLayout>
      <Suspense fallback={<div className="container mx-auto py-12 px-4 text-center">Loading hot deals...</div>}>
        <DealsContent />
      </Suspense>
    </StorefrontLayout>
  );
}

