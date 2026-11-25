'use client';

import React, { useState } from 'react';
import { StaffPageHeader } from '@/components/layout/staff';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import {
  useEarningsReport,
  EarningsTable,
  EarningsTrendChart,
  type EarningsReportFilterParams,
} from '@/modules/admin/affiliate-analytics';
import { Calendar, RotateCcw } from 'lucide-react';

export default function AdminEarningsPage() {
  const [filters, setFilters] = useState<EarningsReportFilterParams>({});

  const { data, isLoading } = useEarningsReport(filters);

  return (
    <div className="space-y-6">
      <StaffPageHeader
        title="Monthly Commission & Earnings Report"
        description="Comprehensive monthly breakdown of pending, validated, payable, claimed, and rejected commissions."
      />

      {/* Date Filter Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 bg-card p-3 rounded-xl border border-border">
        <div className="flex items-center gap-2">
          <Calendar className="h-4 w-4 text-muted-foreground" />
          <span className="text-xs font-semibold text-foreground">Monthly Period Filter</span>
          <span className="text-[10px] text-muted-foreground">(Max 24 months)</span>
        </div>

        <div className="flex items-center gap-2">
          <Input
            type="date"
            value={filters.start_date || ''}
            onChange={(e) => setFilters((prev) => ({ ...prev, start_date: e.target.value }))}
            className="w-[140px] text-xs h-8"
            title="Start Date"
          />
          <span className="text-xs text-muted-foreground">to</span>
          <Input
            type="date"
            value={filters.end_date || ''}
            onChange={(e) => setFilters((prev) => ({ ...prev, end_date: e.target.value }))}
            className="w-[140px] text-xs h-8"
            title="End Date"
          />
          {(filters.start_date || filters.end_date) && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setFilters({})}
              className="h-8 text-xs gap-1"
            >
              <RotateCcw className="h-3 w-3" />
              Reset
            </Button>
          )}
        </div>
      </div>

      {/* Monthly Trajectory Chart */}
      <EarningsTrendChart
        data={data?.data || []}
        isLoading={isLoading}
      />

      {/* Monthly Table with Lifecycle Definitions */}
      <EarningsTable
        items={data?.data || []}
        isLoading={isLoading}
      />
    </div>
  );
}
