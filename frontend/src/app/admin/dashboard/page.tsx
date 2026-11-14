"use client";

import React from "react";
import dynamic from "next/dynamic";
import { useAuth } from "@/hooks/use-auth";
import { StaffPageHeader } from "@/components/layout/staff";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  useAdminDashboardMetrics,
  SummaryCards,
  RecentActivity,
} from "@/modules/admin/dashboard";
import { RefreshCw, Users, Shield, Tag, Package } from "lucide-react";
import Link from "next/link";

const DashboardCharts = dynamic(
  () =>
    import("@/modules/admin/dashboard/components/dashboard-charts").then(
      (mod) => mod.DashboardCharts
    ),
  {
    ssr: false,
    loading: () => (
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 animate-pulse">
        <div className="h-64 rounded-xl bg-muted/40" />
        <div className="h-64 rounded-xl bg-muted/40" />
      </div>
    ),
  }
);

export default function AdminDashboardPage() {
  const { user } = useAuth();
  const { data: metrics, isLoading, isError, refetch, isFetching } = useAdminDashboardMetrics();

  return (
    <div className="space-y-6">
      <StaffPageHeader
        title="Admin Governance Dashboard"
        description={`Welcome back, ${user?.fullName || user?.email}. Complete administrative control over the Asli Cart platform.`}
        badge={
          <Badge variant="deal" className="text-xs">
            SUPER_ADMIN
          </Badge>
        }
        actions={
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => refetch()}
              disabled={isFetching}
              className="text-xs h-8"
            >
              <RefreshCw className={`h-3.5 w-3.5 mr-1.5 ${isFetching ? "animate-spin" : ""}`} />
              Refresh Metrics
            </Button>
          </div>
        }
      />

      {/* Summary Cards */}
      <SummaryCards metrics={metrics} isLoading={isLoading} isError={isError} />

      {/* Quick Governance Links */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <Button variant="outline" asChild className="h-auto py-3 justify-start flex-col items-start gap-1">
          <Link href="/admin/users">
            <div className="flex items-center gap-1.5 text-xs font-semibold text-foreground">
              <Users className="h-3.5 w-3.5 text-blue-600" />
              User Management
            </div>
            <span className="text-[11px] text-muted-foreground font-normal">
              Manage staff & customer directory
            </span>
          </Link>
        </Button>
        <Button variant="outline" asChild className="h-auto py-3 justify-start flex-col items-start gap-1">
          <Link href="/admin/roles">
            <div className="flex items-center gap-1.5 text-xs font-semibold text-foreground">
              <Shield className="h-3.5 w-3.5 text-purple-600" />
              Roles & Permissions
            </div>
            <span className="text-[11px] text-muted-foreground font-normal">
              RBAC access matrix governance
            </span>
          </Link>
        </Button>
        <Button variant="outline" asChild className="h-auto py-3 justify-start flex-col items-start gap-1">
          <Link href="/admin/offers">
            <div className="flex items-center gap-1.5 text-xs font-semibold text-foreground">
              <Tag className="h-3.5 w-3.5 text-emerald-600" />
              Offer Approvals
            </div>
            <span className="text-[11px] text-muted-foreground font-normal">
              Review and publish merchant deals
            </span>
          </Link>
        </Button>
        <Button variant="outline" asChild className="h-auto py-3 justify-start flex-col items-start gap-1">
          <Link href="/admin/products">
            <div className="flex items-center gap-1.5 text-xs font-semibold text-foreground">
              <Package className="h-3.5 w-3.5 text-amber-600" />
              Product Catalog
            </div>
            <span className="text-[11px] text-muted-foreground font-normal">
              Master catalog & categories
            </span>
          </Link>
        </Button>
      </div>

      {/* Live Charts */}
      <DashboardCharts metrics={metrics} />

      {/* Recent Administrative Activity Feed */}
      <RecentActivity />
    </div>
  );
}
