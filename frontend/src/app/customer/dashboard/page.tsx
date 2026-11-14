"use client";

import React from "react";
import Link from "next/link";
import {
  ShoppingBag,
  Heart,
  User,
  ArrowRight,
  TrendingDown,
  Store,
  Sparkles,
  ShieldCheck,
  Package,
} from "lucide-react";
import { AuthGuard } from "@/components/shared/auth-guard";
import { useAuth } from "@/hooks/use-auth";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { StorefrontBreadcrumbs } from "@/components/layout/storefront";
import { formatCurrency } from "@/lib/utils";
import {
  useCustomerDashboardSummary,
  OfferCard,
} from "@/modules/customer";

export default function CustomerDashboardPage() {
  const { user } = useAuth();
  const { data: dashboard, isLoading } = useCustomerDashboardSummary();

  const stats = dashboard?.stats || { totalCartItems: 0, totalWishlistItems: 0 };
  const recentCartItems = dashboard?.recentCartItems || [];
  const recommendedDeals = dashboard?.recommendedDeals || [];

  return (
    <AuthGuard allowedRoles={["CUSTOMER"]} portalType="customer">
      <div className="container mx-auto py-8 px-4 sm:px-6 max-w-5xl space-y-8">
        <StorefrontBreadcrumbs />

        {/* Welcome Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <Badge variant="outline" className="text-xs">
                Verified Customer
              </Badge>
              <Badge variant="deal" className="text-xs font-bold">
                Smart Shopper
              </Badge>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-foreground mt-2">
              Welcome back, {user?.fullName || "Shopper"}!
            </h1>
            <p className="text-xs text-muted-foreground">
              Monitor your saved store deals, price drop alerts, and retailer carts.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <Button size="sm" variant="outline" asChild className="gap-1.5 text-xs">
              <Link href="/products">
                <Package className="h-3.5 w-3.5" />
                <span>Browse Catalog</span>
              </Link>
            </Button>
            <Button size="sm" asChild className="gap-1.5 text-xs font-semibold">
              <Link href="/deals">
                <Sparkles className="h-3.5 w-3.5" />
                <span>Explore Deals</span>
              </Link>
            </Button>
          </div>
        </div>

        {/* Quick Metric Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {/* Cart items */}
          <Link href="/customer/cart">
            <Card className="hover:border-primary/50 transition-colors p-5 border-border/80">
              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <span className="text-xs font-medium text-muted-foreground uppercase">
                    Cart Items
                  </span>
                  <div className="text-2xl font-black text-foreground">
                    {isLoading ? <Skeleton className="h-8 w-12" /> : stats.totalCartItems}
                  </div>
                </div>
                <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-primary/10 text-primary">
                  <ShoppingBag className="h-5 w-5" />
                </div>
              </div>
              <p className="text-[11px] text-muted-foreground mt-2">
                Merchant offers waiting in your cart &rarr;
              </p>
            </Card>
          </Link>

          {/* Wishlist items */}
          <Link href="/customer/wishlist">
            <Card className="hover:border-primary/50 transition-colors p-5 border-border/80">
              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <span className="text-xs font-medium text-muted-foreground uppercase">
                    Saved in Wishlist
                  </span>
                  <div className="text-2xl font-black text-foreground">
                    {isLoading ? <Skeleton className="h-8 w-12" /> : stats.totalWishlistItems}
                  </div>
                </div>
                <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-rose-500/10 text-rose-500">
                  <Heart className="h-5 w-5" />
                </div>
              </div>
              <p className="text-[11px] text-muted-foreground mt-2">
                Monitored products for price drops &rarr;
              </p>
            </Card>
          </Link>

          {/* Profile shortcut */}
          <Link href="/customer/profile">
            <Card className="hover:border-primary/50 transition-colors p-5 border-border/80">
              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <span className="text-xs font-medium text-muted-foreground uppercase">
                    Account Profile
                  </span>
                  <div className="text-sm font-bold text-foreground truncate max-w-[150px]">
                    {user?.fullName}
                  </div>
                </div>
                <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-secondary text-primary">
                  <User className="h-5 w-5" />
                </div>
              </div>
              <p className="text-[11px] text-muted-foreground mt-2">
                Manage personal details & password &rarr;
              </p>
            </Card>
          </Link>
        </div>

        {/* Recent Cart Deals Section */}
        <section className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-bold text-foreground flex items-center gap-2">
              <ShoppingBag className="h-4 w-4 text-primary" />
              <span>Recent Cart Activity</span>
            </h2>
            <Button variant="ghost" size="sm" asChild className="text-xs gap-1">
              <Link href="/customer/cart">
                <span>View Full Cart</span>
                <ArrowRight className="h-3 w-3" />
              </Link>
            </Button>
          </div>

          {isLoading ? (
            <div className="space-y-2">
              {Array.from({ length: 2 }).map((_, i) => (
                <Skeleton key={i} className="h-16 w-full rounded-xl" />
              ))}
            </div>
          ) : recentCartItems.length === 0 ? (
            <div className="rounded-xl border border-border/80 bg-card p-6 text-center space-y-2">
              <p className="text-xs text-muted-foreground">
                Your cart is currently empty. Explore verified offers to start saving.
              </p>
              <Button size="sm" variant="outline" asChild className="text-xs">
                <Link href="/offers">Find Store Offers</Link>
              </Button>
            </div>
          ) : (
            <div className="divide-y divide-border/60 rounded-xl border border-border/80 bg-card overflow-hidden">
              {recentCartItems.map((item) => (
                <div
                  key={item.itemId}
                  className="p-4 flex items-center justify-between gap-4"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="h-12 w-12 rounded-lg bg-secondary/40 border p-1 shrink-0 flex items-center justify-center overflow-hidden">
                      {item.mainImage ? (
                        <img
                          src={item.mainImage}
                          alt={item.productName}
                          className="h-full w-full object-contain"
                        />
                      ) : (
                        <ShoppingBag className="h-5 w-5 text-muted-foreground/60" />
                      )}
                    </div>
                    <div className="min-w-0 space-y-0.5">
                      <p className="text-xs font-semibold text-foreground truncate">
                        {item.productName}
                      </p>
                      <div className="flex items-center gap-2 text-[11px] text-muted-foreground">
                        <span className="font-medium text-foreground/80">
                          {item.merchantName}
                        </span>
                        <span>&bull;</span>
                        <span>Qty: {item.quantity}</span>
                      </div>
                    </div>
                  </div>

                  <div className="text-right shrink-0">
                    <span className="font-bold text-xs sm:text-sm text-foreground">
                      {formatCurrency(item.sellingPrice * item.quantity)}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>

        {/* Recommended Top Discounts */}
        {recommendedDeals.length > 0 && (
          <section className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-bold text-foreground flex items-center gap-2">
                <TrendingDown className="h-4 w-4 text-emerald-600" />
                <span>Recommended Verified Deals</span>
              </h2>
              <Button variant="ghost" size="sm" asChild className="text-xs gap-1">
                <Link href="/deals">
                  <span>See More</span>
                  <ArrowRight className="h-3 w-3" />
                </Link>
              </Button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
              {recommendedDeals.map((deal) => (
                <OfferCard
                  key={deal.offerId}
                  offer={{
                    id: deal.offerId,
                    title: deal.title,
                    productName: deal.productName,
                    brand: deal.brand,
                    mainImage: deal.mainImage,
                    merchantName: deal.merchantName,
                    originalPrice: deal.originalPrice,
                    sellingPrice: deal.sellingPrice,
                    discountPercentage: deal.discountPercentage,
                  }}
                />
              ))}
            </div>
          </section>
        )}
      </div>
    </AuthGuard>
  );
}
