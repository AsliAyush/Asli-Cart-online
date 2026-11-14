"use client";

import React, { Suspense, useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { ChevronLeft, ChevronRight, Package, RefreshCw } from "lucide-react";
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

function ProductsContent() {
  const router = useRouter();
  const searchParams = useSearchParams();

  // Derive filters directly from URL searchParams as single source of truth
  const filters: ListCustomerProductsParams = React.useMemo(
    () => ({
      page: Number(searchParams.get("page") || "1"),
      limit: 16,
      search: searchParams.get("search") || "",
      category: searchParams.get("category") || undefined,
      minDiscount: searchParams.get("minDiscount")
        ? Number(searchParams.get("minDiscount"))
        : undefined,
      sort: (searchParams.get("sort") as any) || "newest",
    }),
    [searchParams]
  );

  // Real backend query with server-side filters
  const { data, isLoading, isError, refetch } = useCustomerProducts(filters);

  const { data: wishlistData } = useCustomerWishlist();
  const wishlistProductIds = React.useMemo(
    () => new Set(wishlistData?.items.map((i) => i.productId) || []),
    [wishlistData]
  );

  const updateFiltersAndUrl = (newFilters: Partial<ListCustomerProductsParams>) => {
    const updated = { ...filters, ...newFilters };

    // Sync to URL
    const params = new URLSearchParams();
    if (updated.page && updated.page > 1) params.set("page", String(updated.page));
    if (updated.search) params.set("search", updated.search);
    if (updated.category) params.set("category", updated.category);
    if (updated.minDiscount) params.set("minDiscount", String(updated.minDiscount));
    if (updated.sort && updated.sort !== "newest") params.set("sort", updated.sort);

    const qs = params.toString();
    router.push(qs ? `/products?${qs}` : "/products");
  };

  const handleReset = () => {
    router.push("/products");
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

      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <SectionHeading
          badge="Product Catalog"
          title="Explore Verified Products"
          subtitle="Discover authentic products with multi-merchant price tracking across top Indian retailers."
        />
        <div className="text-xs text-muted-foreground self-start sm:self-auto">
          {pagination.total > 0 && (
            <span>
              Showing {(pagination.page - 1) * pagination.limit + 1}–
              {Math.min(pagination.page * pagination.limit, pagination.total)} of{" "}
              {pagination.total} products
            </span>
          )}
        </div>
      </div>

      {/* Filter toolbar */}
      <ProductFilters
        filters={filters}
        onFilterChange={updateFiltersAndUrl}
        onReset={handleReset}
      />

      {/* Product Grid */}
      <ProductGrid
        products={data?.items || []}
        isLoading={isLoading}
        isError={isError}
        onRetry={refetch}
        wishlistProductIds={wishlistProductIds}
        emptyTitle="No products found"
        emptyDescription="We could not find any verified products matching your filters. Try clearing your search keyword or selected category."
      />

      {/* Server-Side Pagination Controls */}
      {pagination.totalPages > 1 && (
        <div className="flex items-center justify-between border-t border-border/60 pt-6">
          <Button
            variant="outline"
            size="sm"
            disabled={pagination.page <= 1 || isLoading}
            onClick={() => updateFiltersAndUrl({ page: pagination.page - 1 })}
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
            onClick={() => updateFiltersAndUrl({ page: pagination.page + 1 })}
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

export default function ProductsPage() {
  return (
    <StorefrontLayout>
      <Suspense fallback={<div className="container mx-auto py-12 px-4 text-center">Loading products...</div>}>
        <ProductsContent />
      </Suspense>
    </StorefrontLayout>
  );
}
