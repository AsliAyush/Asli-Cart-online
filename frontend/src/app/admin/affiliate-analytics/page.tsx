'use client';

import React, { useState } from 'react';
import { StaffPageHeader } from '@/components/layout/staff';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  useDashboardSummary,
  usePerformanceReport,
  useTransactionSyncStatus,
  useSyncTransactions,
  DashboardKPICards,
  CommissionTrendChart,
  DailyActivityChart,
  SyncStatusCard,
  type PerformanceReportFilterParams,
} from '@/modules/admin/affiliate-analytics';
import { Calendar, RotateCcw } from 'lucide-react';

export default function AdminAffiliateAnalyticsPage() {
  const [dateRange, setDateRange] = useState<PerformanceReportFilterParams>({});

  const { data: summary, isLoading: isSummaryLoading, refetch: refetchSummary } = useDashboardSummary();
  const { data: perfReport, isLoading: isPerfLoading, refetch: refetchPerf } = usePerformanceReport(dateRange);
  const { data: syncStatus, isLoading: isSyncStatusLoading, refetch: refetchSync } = useTransactionSyncStatus();
  const { mutate: triggerSync, isPending: isSyncPending } = useSyncTransactions();

  const handleManualSync = () => {
    triggerSync(
      { fullSync: false },
      {
        onSettled: () => {
          refetchSummary();
          refetchPerf();
          refetchSync();
        },
      }
    );
  };

  return (
    <div className="space-y-6">
      <StaffPageHeader
        title="Affiliate Revenue & Analytics Dashboard"
        description="Monitor multi-merchant affiliate revenue, commissions, conversion performance, and synchronization status."
      />

      {/* Sync Status Banner & Trigger */}
      <SyncStatusCard
        syncStatus={syncStatus}
        isLoading={isSyncStatusLoading}
        onSync={handleManualSync}
        isSyncing={isSyncPending}
      />

      {/* Primary KPI & Lifecycle Breakdown Cards */}
      <DashboardKPICards
        summary={summary}
        isLoading={isSummaryLoading}
      />

      {/* Filters for Daily Analytics */}
      <div className="flex flex-wrap items-center justify-between gap-3 bg-card p-3 rounded-xl border border-border">
        <div className="flex items-center gap-2">
          <Calendar className="h-4 w-4 text-muted-foreground" />
          <span className="text-xs font-semibold text-foreground">Date Range Filter</span>
          <span className="text-[10px] text-muted-foreground">(Max 90 days)</span>
        </div>

        <div className="flex items-center gap-2">
          <Input
            type="date"
            value={dateRange.start_date || ''}
            onChange={(e) => setDateRange((prev) => ({ ...prev, start_date: e.target.value }))}
            className="w-[140px] text-xs h-8"
            title="Start Date"
          />
          <span className="text-xs text-muted-foreground">to</span>
          <Input
            type="date"
            value={dateRange.end_date || ''}
            onChange={(e) => setDateRange((prev) => ({ ...prev, end_date: e.target.value }))}
            className="w-[140px] text-xs h-8"
            title="End Date"
          />
          {(dateRange.start_date || dateRange.end_date) && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setDateRange({})}
              className="h-8 text-xs gap-1"
            >
              <RotateCcw className="h-3 w-3" />
              Reset
            </Button>
          )}
        </div>
      </div>

      {/* Visual Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <CommissionTrendChart
          data={perfReport?.data || []}
          isLoading={isPerfLoading}
        />
        <DailyActivityChart
          data={perfReport?.data || []}
          isLoading={isPerfLoading}
        />
      </div>
    </div>
  );
}
