import React from "react";
import Link from "next/link";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { AlertCircle, Clock, ArrowRight, CheckCircle2 } from "lucide-react";
import type { PendingReviewsData } from "../types";

interface PendingReviewsCardProps {
  pending?: PendingReviewsData;
  isLoading: boolean;
}

export function PendingReviewsCard({ pending, isLoading }: PendingReviewsCardProps) {
  if (isLoading) {
    return (
      <Card className="border-border">
        <CardHeader>
          <Skeleton className="h-5 w-40" />
          <Skeleton className="h-4 w-60" />
        </CardHeader>
        <CardContent>
          <Skeleton className="h-20 w-full" />
        </CardContent>
      </Card>
    );
  }

  const pendingCount = pending?.totalPending ?? 0;
  const pendingProducts = pending?.pendingProducts || [];
  const pendingOffers = pending?.pendingOffers || [];

  return (
    <Card className="border-border shadow-sm">
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <div className="space-y-1">
          <CardTitle className="text-base flex items-center gap-2">
            <Clock className="h-4 w-4 text-purple-600" />
            <span>Pending Admin Review Queue</span>
            {pendingCount > 0 && (
              <Badge variant="outline" className="text-purple-600 border-purple-300 bg-purple-50 text-xs">
                {pendingCount} Pending
              </Badge>
            )}
          </CardTitle>
          <CardDescription className="text-xs">
            Items submitted by Product Managers currently undergoing Super Admin review & approval
          </CardDescription>
        </div>
      </CardHeader>
      <CardContent>
        {pendingCount === 0 ? (
          <div className="flex flex-col items-center justify-center py-6 text-center space-y-2">
            <CheckCircle2 className="h-8 w-8 text-emerald-500" />
            <p className="text-sm font-medium text-foreground">
              Queue is completely clear!
            </p>
            <p className="text-xs text-muted-foreground max-w-sm">
              All submitted products and merchant offers have been processed by Super Admin.
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="rounded-lg border bg-secondary/30 p-3 space-y-1">
                <span className="text-xs text-muted-foreground block">
                  Products Awaiting Approval
                </span>
                <span className="text-xl font-bold text-foreground">
                  {pendingProducts.length}
                </span>
                <p className="text-[11px] text-muted-foreground">
                  Catalog submissions pending Admin greenlight
                </p>
              </div>
              <div className="rounded-lg border bg-secondary/30 p-3 space-y-1">
                <span className="text-xs text-muted-foreground block">
                  Offers Awaiting Approval
                </span>
                <span className="text-xl font-bold text-foreground">
                  {pendingOffers.length}
                </span>
                <p className="text-[11px] text-muted-foreground">
                  Deals and price points waiting to be published
                </p>
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-2">
              <Button variant="outline" size="sm" asChild>
                <Link href="/product-manager/products?status=PENDING_APPROVAL">
                  Review Products ({pendingProducts.length})
                </Link>
              </Button>
              <Button size="sm" asChild>
                <Link href="/product-manager/offers?status=PENDING_APPROVAL">
                  Review Offers ({pendingOffers.length})
                </Link>
              </Button>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
