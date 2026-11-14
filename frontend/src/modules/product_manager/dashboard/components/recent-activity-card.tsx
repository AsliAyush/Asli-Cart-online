import React from "react";
import Link from "next/link";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { ArrowRight, Package, Tag, Clock } from "lucide-react";
import type { RecentActivityData } from "../types";

interface RecentActivityCardProps {
  activity?: RecentActivityData;
  isLoading: boolean;
}

export function RecentActivityCard({ activity, isLoading }: RecentActivityCardProps) {
  if (isLoading) {
    return (
      <Card className="border-border">
        <CardHeader>
          <Skeleton className="h-5 w-40" />
          <Skeleton className="h-4 w-60" />
        </CardHeader>
        <CardContent className="space-y-3">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-12 w-full" />
          ))}
        </CardContent>
      </Card>
    );
  }

  const products = activity?.recentProducts || [];
  const offers = activity?.recentOffers || [];

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* Recent Products */}
      <Card className="border-border shadow-sm">
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <div>
            <CardTitle className="text-base flex items-center gap-2">
              <Package className="h-4 w-4 text-primary" />
              <span>Recently Added Products</span>
            </CardTitle>
            <CardDescription className="text-xs">
              Latest items entered into the Asli Cart product catalog
            </CardDescription>
          </div>
          <Link
            href="/product-manager/products"
            className="text-xs text-primary hover:underline flex items-center gap-1 font-medium"
          >
            View all
            <ArrowRight className="h-3 w-3" />
          </Link>
        </CardHeader>
        <CardContent className="pt-2">
          {products.length === 0 ? (
            <div className="py-8 text-center text-xs text-muted-foreground">
              No recent products found.
            </div>
          ) : (
            <div className="divide-y divide-border">
              {products.slice(0, 5).map((prod) => (
                <div key={prod.id} className="py-3 flex items-center justify-between gap-3">
                  <div className="flex items-center gap-3 min-w-0">
                    {prod.mainImage ? (
                      <img
                        src={prod.mainImage}
                        alt={prod.name}
                        className="h-9 w-9 rounded-md object-cover border shrink-0 bg-muted"
                      />
                    ) : (
                      <div className="h-9 w-9 rounded-md bg-muted flex items-center justify-center shrink-0">
                        <Package className="h-4 w-4 text-muted-foreground" />
                      </div>
                    )}
                    <div className="min-w-0">
                      <p className="text-xs font-semibold text-foreground truncate">
                        {prod.name}
                      </p>
                      <p className="text-[11px] text-muted-foreground truncate">
                        {prod.brand ? `${prod.brand} • ` : ""}
                        {prod.category?.name || "General"}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <Badge
                      variant={
                        prod.status === "APPROVED"
                          ? "deal"
                          : prod.status === "PENDING_APPROVAL"
                          ? "outline"
                          : prod.status === "DRAFT"
                          ? "secondary"
                          : "outline"
                      }
                      className="text-[10px]"
                    >
                      {prod.status}
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Recent Offers */}
      <Card className="border-border shadow-sm">
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <div>
            <CardTitle className="text-base flex items-center gap-2">
              <Tag className="h-4 w-4 text-primary" />
              <span>Recent Merchant Deals</span>
            </CardTitle>
            <CardDescription className="text-xs">
              Live and pending affiliate offers submitted by team
            </CardDescription>
          </div>
          <Link
            href="/product-manager/offers"
            className="text-xs text-primary hover:underline flex items-center gap-1 font-medium"
          >
            View all
            <ArrowRight className="h-3 w-3" />
          </Link>
        </CardHeader>
        <CardContent className="pt-2">
          {offers.length === 0 ? (
            <div className="py-8 text-center text-xs text-muted-foreground">
              No recent offers found.
            </div>
          ) : (
            <div className="divide-y divide-border">
              {offers.slice(0, 5).map((offer) => (
                <div key={offer.id} className="py-3 flex items-center justify-between gap-3">
                  <div className="min-w-0">
                    <p className="text-xs font-semibold text-foreground truncate">
                      {offer.title}
                    </p>
                    <p className="text-[11px] text-muted-foreground truncate">
                      {offer.merchant?.name ? `${offer.merchant.name} • ` : ""}
                      ₹{Number(offer.sellingPrice).toLocaleString("en-IN")}{" "}
                      <span className="line-through text-muted-foreground/70">
                        ₹{Number(offer.originalPrice).toLocaleString("en-IN")}
                      </span>{" "}
                      <span className="text-emerald-600 font-semibold">
                        ({offer.discountPercentage}% OFF)
                      </span>
                    </p>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <Badge
                      variant={
                        offer.status === "PUBLISHED"
                          ? "deal"
                          : offer.status === "APPROVED"
                          ? "default"
                          : offer.status === "PENDING_APPROVAL"
                          ? "outline"
                          : offer.status === "REJECTED"
                          ? "destructive"
                          : "secondary"
                      }
                      className="text-[10px]"
                    >
                      {offer.status}
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
