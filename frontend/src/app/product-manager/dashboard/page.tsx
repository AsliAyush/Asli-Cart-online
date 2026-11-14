"use client";

import React from "react";
import { useAuth } from "@/hooks/use-auth";
import { StaffPageHeader } from "@/components/layout/staff";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { RefreshCw, AlertTriangle } from "lucide-react";
import {
  useProductManagerDashboard,
  DashboardMetrics,
  RecentActivityCard,
  PendingReviewsCard,
  QuickNavCards,
} from "@/modules/product_manager/dashboard";

export default function ProductManagerDashboardPage() {
  const { user } = useAuth();
  const {
    summary,
    isLoadingSummary,
    isErrorSummary,
    summaryError,
    recentActivity,
    isLoadingActivity,
    pendingReviews,
    isLoadingPending,
    refetchAll,
  } = useProductManagerDashboard();

  return (
    <div className="space-y-6">
      <StaffPageHeader
        title="Product Manager Dashboard"
        description={`Welcome back, ${user?.fullName || user?.email}. Real-time catalog metrics and deal curation oversight.`}
        badge={
          <Badge variant="deal" className="text-xs">
            PRODUCT_MANAGER
          </Badge>
        }
        actions={
          <Button
            variant="outline"
            size="sm"
            onClick={refetchAll}
            disabled={isLoadingSummary}
            className="gap-2"
          >
            <RefreshCw className={`h-3.5 w-3.5 ${isLoadingSummary ? "animate-spin" : ""}`} />
            Refresh
          </Button>
        }
      />

      {isErrorSummary && (
        <div className="rounded-lg border border-destructive/30 bg-destructive/10 p-4 text-xs text-destructive flex items-center gap-3">
          <AlertTriangle className="h-5 w-5 shrink-0" />
          <div>
            <p className="font-semibold">Unable to load dashboard summary</p>
            <p className="text-destructive/80">
              {(summaryError as any)?.message || "A network or server error occurred."}
            </p>
          </div>
        </div>
      )}

      {/* Aggregate Counts */}
      <DashboardMetrics summary={summary} isLoading={isLoadingSummary} />

      {/* Quick Navigation to Phase 5 modules */}
      <div className="space-y-2">
        <h2 className="text-sm font-semibold tracking-tight text-foreground">
          Quick Actions & Pipelines
        </h2>
        <QuickNavCards />
      </div>

      {/* Pending Reviews Queue */}
      <PendingReviewsCard pending={pendingReviews} isLoading={isLoadingPending} />

      {/* Recent Catalog Activity */}
      <RecentActivityCard activity={recentActivity} isLoading={isLoadingActivity} />
    </div>
  );
}
