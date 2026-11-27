"use client";

import React, { Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { SectionHeading } from "@/components/shared/section-heading";
import { StorefrontLayout, StorefrontBreadcrumbs } from "@/components/layout/storefront";
import {
  ProductGrid,
  ProductFilters,
  useCustomerProducts,
  useCustomerWishlist,
  type ListCustomerProductsParams,
} from "@/modules/customer";

function ProductsPageSkeleton() {
  return (
    <div
      className="container mx-auto py-8 px-4 sm:px-6 space-y-6"
      role="status"
      aria-busy="true"
    >
      <span className="sr-only">Loading verified products catalog...</span>

      {/* Breadcrumb Skeleton */}
      <div className="flex items-center gap-2">
        <Skeleton className="h-4 w-16" />
        <span className="text-muted-foreground text-xs">/</span>
        <Skeleton className="h-4 w-24" />
      </div>

      {/* Header Skeleton */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div className="space-y-2">
          <Skeleton className="h-5 w-28 rounded-full" />
          <Skeleton className="h-8 w-64" />
          <Skeleton className="h-4 w-80 max-w-full" />
        </div>
        <Skeleton className="h-4 w-40 self-start sm:self-auto" />
      </div>

      {/* Filter Toolbar Skeleton */}
      <div className="rounded-xl border border-border/80 bg-card p-4 shadow-sm">
        <div className="flex flex-col md:flex-row gap-3 items-stretch md:items-center justify-between">
          <Skeleton className="h-9 w-full max-w-md rounded-md" />
          <div className="flex flex-wrap items-center gap-2 sm:gap-3">
            <Skeleton className="h-9 w-[150px] sm:w-[170px] rounded-md" />
            <Skeleton className="h-9 w-[130px] sm:w-[150px] rounded-md" />
            <Skeleton className="h-9 w-[140px] sm:w-[160px] rounded-md" />
          </div>
        </div>
      </div>

      {/* 8 Product Cards Skeleton matching ProductGrid */}
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
    </div>
  );
}

function ProductsContent() {
  const router = useRouter();
  const searchParams = useSearchParams();

  // Derive filters directly from URL searchParams as single source of truth
  const filters: ListCustomerProductsParams = React.useMemo(() => {
    const rawSearch = searchParams.get("search")?.trim();
    const rawCategory = searchParams.get("category")?.trim();
    const rawMinDiscount = searchParams.get("minDiscount");
    const minDiscount = rawMinDiscount ? Number(rawMinDiscount) : undefined;
    const sort = (searchParams.get("sort") as any) || "newest";
    const page = Number(searchParams.get("page") || "1");

    return {
      page: page > 0 ? page : 1,
      limit: 16,
      search: rawSearch || undefined,
      category: rawCategory || undefined,
      minDiscount: !isNaN(minDiscount as number) ? minDiscount : undefined,
      sort,
    };
  }, [searchParams]);

  // Real backend query with server-side filters
  const { data, isLoading, isError, refetch } = useCustomerProducts(filters);

  const { data: wishlistData } = useCustomerWishlist();
  const wishlistProductIds = React.useMemo(
    () => new Set(wishlistData?.items.map((i) => i.productId) || []),
    [wishlistData]
  );

  const updateFiltersAndUrl = React.useCallback(
    (newFilters: Partial<ListCustomerProductsParams>) => {
      const mergedSearch =
        newFilters.search !== undefined
          ? newFilters.search.trim() || undefined
          : filters.search;

      const updated = {
        ...filters,
        ...newFilters,
        search: mergedSearch,
      };

      // Sync to URL
      const params = new URLSearchParams();
      if (updated.page && updated.page > 1) params.set("page", String(updated.page));
      if (updated.search) params.set("search", updated.search);
      if (updated.category) params.set("category", updated.category);
      if (updated.minDiscount) params.set("minDiscount", String(updated.minDiscount));
      if (updated.sort && updated.sort !== "newest") params.set("sort", updated.sort);

      const qs = params.toString();
      router.push(qs ? `/products?${qs}` : "/products");
    },
    [filters, router]
  );

  const handleReset = React.useCallback(() => {
    router.push("/products");
  }, [router]);

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
      <Suspense fallback={<ProductsPageSkeleton />}>
        <ProductsContent />
      </Suspense>
    </StorefrontLayout>
  );
}
