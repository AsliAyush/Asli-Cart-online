"use client";

import React from "react";
import { Users, Package, Tag, Clock, CheckCircle2, ShieldAlert } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import type { ConsolidatedAdminMetrics } from "../types";

interface SummaryCardsProps {
  metrics?: ConsolidatedAdminMetrics;
  isLoading: boolean;
  isError: boolean;
}

export function SummaryCards({ metrics, isLoading, isError }: SummaryCardsProps) {
  if (isLoading) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <Card key={i} className="border shadow-xs">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <Skeleton className="h-4 w-24" />
              <Skeleton className="h-6 w-6 rounded-full" />
            </CardHeader>
            <CardContent>
              <Skeleton className="h-8 w-16 mb-2" />
              <Skeleton className="h-3 w-32" />
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  if (isError || !metrics) {
    return (
      <Card className="border-destructive/30 bg-destructive/5 p-4 text-center">
        <p className="text-sm text-destructive font-medium">
          Unable to load dashboard summary metrics. Please check network connectivity or refresh.
        </p>
      </Card>
    );
  }

  const cards = [
    {
      title: "Total Platform Users",
      value: metrics.totalUsers.toLocaleString(),
      subtext: `${metrics.activeUsers} actively verified`,
      icon: Users,
      color: "text-blue-600 bg-blue-50 dark:bg-blue-950/40",
    },
    {
      title: "Catalog Products",
      value: metrics.totalProducts.toLocaleString(),
      subtext: `${metrics.approvedProducts} approved • ${metrics.pendingProducts} pending`,
      icon: Package,
      color: "text-purple-600 bg-purple-50 dark:bg-purple-950/40",
    },
    {
      title: "Published Offers",
      value: metrics.publishedOffers.toLocaleString(),
      subtext: `From ${metrics.totalOffers} total created offers`,
      icon: CheckCircle2,
      color: "text-emerald-600 bg-emerald-50 dark:bg-emerald-950/40",
    },
    {
      title: "Pending Offer Approvals",
      value: metrics.pendingOfferApprovals.toLocaleString(),
      subtext: metrics.pendingOfferApprovals > 0 ? "Requires Admin review" : "No queue pending",
      icon: metrics.pendingOfferApprovals > 0 ? ShieldAlert : Clock,
      color: metrics.pendingOfferApprovals > 0 ? "text-amber-600 bg-amber-50 dark:bg-amber-950/40" : "text-muted-foreground bg-muted",
    },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {cards.map((card, i) => {
        const Icon = card.icon;
        return (
          <Card key={i} className="border shadow-xs hover:border-primary/20 transition-colors">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                {card.title}
              </CardTitle>
              <div className={`p-2 rounded-lg ${card.color}`}>
                <Icon className="h-4 w-4" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold tracking-tight">{card.value}</div>
              <p className="text-xs text-muted-foreground mt-1">{card.subtext}</p>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}

