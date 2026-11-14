"use client";

import React from "react";
import { StorefrontLayout, StorefrontBreadcrumbs } from "@/components/layout/storefront";
import { SectionHeading } from "@/components/shared/section-heading";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { Grid, RefreshCw } from "lucide-react";
import { CategoryCard, useCustomerCategories } from "@/modules/customer";

export default function CategoriesPage() {
  const { data: categories = [], isLoading, isError, refetch } = useCustomerCategories();

  return (
    <StorefrontLayout>
      <div className="container mx-auto py-8 px-4 sm:px-6 space-y-6">
        <StorefrontBreadcrumbs />

        <SectionHeading
          badge="Product Categories"
          title="Browse by Department"
          subtitle="Explore curated deals across consumer electronics, laptops, home essentials, and gadgets."
        />

        {isLoading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
            {Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className="rounded-xl border border-border/60 p-5 space-y-4">
                <div className="flex justify-between items-center">
                  <Skeleton className="h-12 w-12 rounded-xl" />
                  <Skeleton className="h-4 w-16" />
                </div>
                <div className="space-y-2">
                  <Skeleton className="h-5 w-3/4" />
                  <Skeleton className="h-3 w-full" />
                </div>
              </div>
            ))}
          </div>
        ) : isError ? (
          <div className="rounded-xl border border-destructive/20 bg-destructive/5 p-8 text-center space-y-4 max-w-md mx-auto my-8">
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-destructive/10 text-destructive">
              <RefreshCw className="h-6 w-6" />
            </div>
            <div className="space-y-1">
              <h3 className="font-semibold text-foreground">Failed to load categories</h3>
              <p className="text-xs text-muted-foreground">
                We encountered an error loading the category taxonomy.
              </p>
            </div>
            <Button variant="outline" size="sm" onClick={() => refetch()} className="gap-2">
              <RefreshCw className="h-3.5 w-3.5" />
              <span>Try Again</span>
            </Button>
          </div>
        ) : categories.length === 0 ? (
          <div className="rounded-xl border border-border/80 bg-card p-12 text-center space-y-4 max-w-md mx-auto my-8">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-secondary text-muted-foreground">
              <Grid className="h-7 w-7" />
            </div>
            <div className="space-y-1">
              <h3 className="text-lg font-semibold text-foreground">No Categories Available</h3>
              <p className="text-xs text-muted-foreground">
                Product categories will appear here once configured by the platform.
              </p>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
            {categories.map((cat) => (
              <CategoryCard key={cat.id} category={cat} />
            ))}
          </div>
        )}
      </div>
    </StorefrontLayout>
  );
}
