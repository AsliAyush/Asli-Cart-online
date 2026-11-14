"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Search,
  Sparkles,
  ShieldCheck,
  TrendingDown,
  ArrowRight,
  Store,
  Flame,
  Package,
  Layers,
  ChevronRight,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { SectionHeading } from "@/components/shared/section-heading";
import { StorefrontLayout } from "@/components/layout/storefront";
import {
  ProductGrid,
  CategoryCard,
  useCustomerProducts,
  useCustomerCategories,
  useCustomerWishlist,
} from "@/modules/customer";

function HeroSearchBox() {
  const router = useRouter();
  const [heroSearch, setHeroSearch] = useState("");

  const handleHeroSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (heroSearch.trim()) {
      router.push(`/products?search=${encodeURIComponent(heroSearch.trim())}`);
    } else {
      router.push("/products");
    }
  };

  return (
    <form onSubmit={handleHeroSearch} className="max-w-xl mx-auto pt-2">
      <div className="relative flex items-center shadow-lg rounded-2xl overflow-hidden border border-border bg-background focus-within:ring-2 focus-within:ring-primary">
        <Search className="absolute left-4 h-5 w-5 text-muted-foreground pointer-events-none" />
        <Input
          type="search"
          placeholder="Search laptops, smartphones, headphones, deals..."
          value={heroSearch}
          onChange={(e) => setHeroSearch(e.target.value)}
          className="pl-12 pr-28 h-14 text-sm bg-transparent border-0 focus-visible:ring-0 shadow-none"
        />
        <Button
          type="submit"
          className="absolute right-2 h-10 px-5 text-xs font-bold rounded-xl"
        >
          Find Deals
        </Button>
      </div>
    </form>
  );
}

export default function HomePage() {
  // Real backend queries
  const {
    data: topDealsData,
    isLoading: isDealsLoading,
    isError: isDealsError,
    refetch: refetchDeals,
  } = useCustomerProducts({ sort: "discount_desc", limit: 8 });

  const {
    data: newestProductsData,
    isLoading: isNewestLoading,
    isError: isNewestError,
    refetch: refetchNewest,
  } = useCustomerProducts({ sort: "newest", limit: 8 });

  const {
    data: categories = [],
    isLoading: isCategoriesLoading,
  } = useCustomerCategories();

  const { data: wishlistData } = useCustomerWishlist();
  const wishlistProductIds = React.useMemo(
    () => new Set(wishlistData?.items.map((i) => i.productId) || []),
    [wishlistData]
  );

  return (
    <StorefrontLayout>
      <div className="space-y-16 pb-16">
        {/* 1. Hero Section with Live Product Search */}
        <section className="relative overflow-hidden bg-gradient-to-b from-primary/10 via-background to-background py-16 sm:py-24 border-b border-border/60">
          <div className="container mx-auto px-4 sm:px-6 relative z-10 text-center max-w-4xl space-y-6">
            <div className="inline-flex items-center gap-2 rounded-full border border-primary/30 bg-primary/10 px-3.5 py-1 text-xs font-semibold text-primary shadow-sm">
              <Sparkles className="h-3.5 w-3.5 text-amber-500" />
              <span>India&apos;s 100% Genuine Deal Discovery Platform</span>
            </div>

            <h1 className="text-3xl sm:text-5xl md:text-6xl font-black tracking-tight text-foreground leading-[1.1]">
              Never Pay MRP Again. Compare{" "}
              <span className="text-primary underline decoration-amber-400 decoration-wavy decoration-2">
                Asli Prices
              </span>.
            </h1>

            <p className="text-sm sm:text-base text-muted-foreground max-w-2xl mx-auto leading-relaxed">
              We monitor verified discounts, genuine price drops, and valid coupons across top Indian stores like Amazon, Flipkart, Tata CLiQ, and Myntra.
            </p>

            {/* Hero Search Box (isolated to prevent full-page re-renders during typing) */}
            <HeroSearchBox />

            {/* Quick Category Badges */}
            {categories.length > 0 && (
              <div className="flex flex-wrap items-center justify-center gap-2 pt-2 text-xs">
                <span className="text-muted-foreground">Popular:</span>
                {categories.slice(0, 5).map((cat) => (
                  <Link
                    key={cat.id}
                    href={`/products?category=${cat.slug || cat.id}`}
                    className="rounded-full bg-secondary/80 hover:bg-secondary px-3 py-1 font-medium text-foreground transition-colors"
                  >
                    {cat.name}
                  </Link>
                ))}
              </div>
            )}
          </div>
        </section>

        {/* 2. Top Deals Section (Real Backend Data) */}
        <section className="container mx-auto px-4 sm:px-6 space-y-6">
          <div className="flex items-end justify-between">
            <SectionHeading
              badge="Maximum Savings"
              title="Top Verified Deals"
              subtitle="The highest genuine discounts currently available from certified merchants."
            />
            <Button variant="ghost" size="sm" asChild className="gap-1 text-xs">
              <Link href="/deals">
                <span>View all deals</span>
                <ChevronRight className="h-3.5 w-3.5" />
              </Link>
            </Button>
          </div>

          <ProductGrid
            products={topDealsData?.items || []}
            isLoading={isDealsLoading}
            isError={isDealsError}
            onRetry={refetchDeals}
            wishlistProductIds={wishlistProductIds}
            emptyTitle="No active deals currently published"
            emptyDescription="Check back soon! Our team and automated crawlers update verified store discounts hourly."
          />
        </section>

        {/* 3. Product Categories Section */}
        {categories.length > 0 && (
          <section className="container mx-auto px-4 sm:px-6 space-y-6">
            <div className="flex items-end justify-between">
              <SectionHeading
                badge="Departments"
                title="Browse by Category"
                subtitle="Explore verified electronics, smartphones, computing, and home essentials."
              />
              <Button variant="ghost" size="sm" asChild className="gap-1 text-xs">
                <Link href="/categories">
                  <span>All categories</span>
                  <ChevronRight className="h-3.5 w-3.5" />
                </Link>
              </Button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
              {categories.slice(0, 8).map((cat) => (
                <CategoryCard key={cat.id} category={cat} />
              ))}
            </div>
          </section>
        )}

        {/* 4. Recently Added Products (Real Backend Data) */}
        <section className="container mx-auto px-4 sm:px-6 space-y-6">
          <div className="flex items-end justify-between">
            <SectionHeading
              badge="Latest Additions"
              title="Recently Added to Catalog"
              subtitle="Newly ingested products and price points tracked by Asli Cart."
            />
            <Button variant="ghost" size="sm" asChild className="gap-1 text-xs">
              <Link href="/products">
                <span>Explore all products</span>
                <ChevronRight className="h-3.5 w-3.5" />
              </Link>
            </Button>
          </div>

          <ProductGrid
            products={newestProductsData?.items || []}
            isLoading={isNewestLoading}
            isError={isNewestError}
            onRetry={refetchNewest}
            wishlistProductIds={wishlistProductIds}
            emptyTitle="Catalog is currently empty"
            emptyDescription="Products will appear here once verified and published by our product management team."
          />
        </section>

        {/* 5. Asli Cart Platform Pillars & Merchant Model Notice */}
        <section className="container mx-auto px-4 sm:px-6">
          <div className="rounded-2xl border border-border/80 bg-secondary/30 p-8 sm:p-12 space-y-8">
            <div className="text-center max-w-2xl mx-auto space-y-3">
              <Badge variant="deal" className="font-bold text-xs">
                The Asli Cart Difference
              </Badge>
              <h2 className="text-2xl sm:text-3xl font-extrabold text-foreground">
                How Asli Cart Works
              </h2>
              <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
                We are a deal comparison and affiliate discovery engine. We do not sell products or process payments.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="rounded-xl border border-border/60 bg-card p-6 space-y-2">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-emerald-500/10 text-emerald-600 font-bold">
                  <ShieldCheck className="h-5 w-5" />
                </div>
                <h3 className="font-bold text-sm text-foreground">1. Verified Discounts</h3>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  Every deal is cross-checked against historical price points to eliminate fake festive markups.
                </p>
              </div>

              <div className="rounded-xl border border-border/60 bg-card p-6 space-y-2">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-primary font-bold">
                  <Store className="h-5 w-5" />
                </div>
                <h3 className="font-bold text-sm text-foreground">2. Multi-Store Comparison</h3>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  See offers for the exact same model across Amazon, Flipkart, Tata CLiQ, and Croma side by side.
                </p>
              </div>

              <div className="rounded-xl border border-border/60 bg-card p-6 space-y-2">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-amber-500/10 text-amber-500 font-bold">
                  <TrendingDown className="h-5 w-5" />
                </div>
                <h3 className="font-bold text-sm text-foreground">3. Direct Store Checkout</h3>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  Click through directly to the merchant with trusted affiliate links to complete your purchase securely.
                </p>
              </div>
            </div>
          </div>
        </section>
      </div>
    </StorefrontLayout>
  );
}
