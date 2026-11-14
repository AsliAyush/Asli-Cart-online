"use client";

import React, { Suspense, useState } from "react";
import { useSearchParams } from "next/navigation";
import { Tag, ChevronLeft, ChevronRight, Store } from "lucide-react";
import { Button } from "@/components/ui/button";
import { SectionHeading } from "@/components/shared/section-heading";
import { StorefrontLayout, StorefrontBreadcrumbs } from "@/components/layout/storefront";
import {
  OfferCard,
  ProductFilters,
  useCustomerProducts,
  type ListCustomerProductsParams,
} from "@/modules/customer";
import { Skeleton } from "@/components/ui/skeleton";

function OffersContent() {
  const searchParams = useSearchParams();

  const [filters, setFilters] = useState<ListCustomerProductsParams>({
    page: Number(searchParams.get("page") || "1"),
    limit: 16,
    search: searchParams.get("search") || "",
    category: searchParams.get("category") || undefined,
    sort: "newest",
  });

  const { data, isLoading, isError, refetch } = useCustomerProducts(filters);

  const updateFilters = (newFilters: Partial<ListCustomerProductsParams>) => {
    setFilters((prev) => ({ ...prev, ...newFilters }));
  };

  const handleReset = () => {
    setFilters({ page: 1, limit: 16, sort: "newest" });
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
        badge="Store Offers"
        title="Verified Merchant Offers"
        subtitle="Compare verified deal entries across Amazon India, Flipkart, Myntra, and Tata CLiQ."
      />

      <ProductFilters
        filters={filters}
        onFilterChange={updateFilters}
        onReset={handleReset}
      />

      {isLoading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="rounded-xl border border-border/60 p-4 space-y-3">
              <Skeleton className="aspect-video w-full rounded-lg" />
              <Skeleton className="h-4 w-3/4" />
              <Skeleton className="h-4 w-1/2" />
              <div className="flex justify-between pt-2">
                <Skeleton className="h-5 w-20" />
                <Skeleton className="h-8 w-16" />
              </div>
            </div>
          ))}
        </div>
      ) : isError ? (
        <div className="rounded-xl border border-destructive/20 bg-destructive/5 p-8 text-center space-y-4 max-w-md mx-auto my-8">
          <p className="text-xs text-muted-foreground">
            We encountered an error loading published store offers.
          </p>
          <Button variant="outline" size="sm" onClick={() => refetch()}>
            Try Again
          </Button>
        </div>
      ) : (data?.items || []).length === 0 ? (
        <div className="rounded-xl border border-border/80 bg-card p-12 text-center space-y-3 max-w-md mx-auto my-8">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-xl bg-secondary text-muted-foreground">
            <Store className="h-6 w-6" />
          </div>
          <h3 className="font-semibold text-foreground text-base">No Offers Found</h3>
          <p className="text-xs text-muted-foreground">
            No merchant offers match your current search filters.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
          {(data?.items || []).map((item) => (
            <OfferCard
              key={item.id}
              offer={{
                id: item.id,
                title: item.name,
                productName: item.name,
                brand: item.brand,
                mainImage: item.mainImage,
                merchantName: item.merchantName || "Verified Store",
                merchantLogo: item.merchantLogo,
                originalPrice: item.originalPrice || item.bestPrice || 0,
                sellingPrice: item.bestPrice || 0,
                discountPercentage: item.discountPercentage,
              }}
            />
          ))}
        </div>
      )}

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

export default function OffersPage() {
  return (
    <StorefrontLayout>
      <Suspense fallback={<div className="container mx-auto py-12 px-4 text-center">Loading store offers...</div>}>
        <OffersContent />
      </Suspense>
    </StorefrontLayout>
  );
}
