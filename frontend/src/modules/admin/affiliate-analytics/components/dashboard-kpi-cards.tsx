import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  MousePointerClick,
  Receipt,
  ShoppingBag,
  Coins,
  Clock,
  CheckCircle,
  CreditCard,
  CheckCheck,
  XCircle,
  Database,
  Radio,
  AlertTriangle,
} from 'lucide-react';
import type { DashboardSummary } from '../types';
import { formatAffiliateCurrency } from '../utils/currency';

interface DashboardKPICardsProps {
  summary?: DashboardSummary;
  isLoading: boolean;
}

export function DashboardKPICards({ summary, isLoading }: DashboardKPICardsProps) {
  if (isLoading || !summary) {
    return (
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="h-28 rounded-xl bg-muted/40 animate-pulse border" />
        ))}
      </div>
    );
  }

  const isLive = summary.dataSource === 'LIVE_API' || (summary.isLiveAvailable && !summary.isFallback);
  const currency = summary.currency || 'INR';

  return (
    <div className="space-y-4">
      {/* Source & Freshness Bar */}
      <div className="flex flex-wrap items-center justify-between gap-2 px-1">
        <div className="flex items-center gap-2">
          {isLive ? (
            <Badge variant="outline" className="gap-1.5 border-emerald-500/30 bg-emerald-500/10 text-emerald-600 text-[11px] font-medium">
              <Radio className="h-3 w-3 animate-pulse text-emerald-500" />
              <span>Source: Live Cuelinks API</span>
            </Badge>
          ) : (
            <Badge variant="outline" className="gap-1.5 border-amber-500/30 bg-amber-500/10 text-amber-700 text-[11px] font-medium">
              <Database className="h-3 w-3 text-amber-600" />
              <span>Source: Local Database (Fallback)</span>
            </Badge>
          )}

          {summary.isStale && (
            <Badge variant="outline" className="gap-1 border-rose-500/30 bg-rose-500/10 text-rose-600 text-[11px] font-medium">
              <AlertTriangle className="h-3 w-3" />
              <span>Stale Data (&gt; 2h since sync)</span>
            </Badge>
          )}

          {summary.reportingPeriod && (
            <span className="text-[11px] text-muted-foreground hidden sm:inline">
              Window: {summary.reportingPeriod.startDate} to {summary.reportingPeriod.endDate} ({summary.reportingPeriod.days}d)
            </span>
          )}
        </div>

        {summary.currencies && Object.keys(summary.currencies).length > 1 && (
          <div className="flex items-center gap-1.5 text-[11px] text-muted-foreground">
            <span>Tracked currencies:</span>
            {Object.keys(summary.currencies).map((c) => (
              <Badge key={c} variant="secondary" className="text-[10px] uppercase font-mono">
                {c}
              </Badge>
            ))}
          </div>
        )}
      </div>

      {/* Primary KPI Row */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card className="rounded-xl border border-border shadow-sm">
          <CardContent className="p-4 flex items-center justify-between">
            <div className="space-y-1">
              <span className="text-xs font-medium text-muted-foreground">Total Clicks</span>
              <p className="text-2xl font-bold font-mono text-foreground">
                {summary.totalClicks.toLocaleString('en-IN')}
              </p>
              <span className="text-[10px] text-muted-foreground">Recorded affiliate traffic</span>
            </div>
            <div className="p-3 bg-blue-500/10 rounded-xl text-blue-600">
              <MousePointerClick className="h-5 w-5" />
            </div>
          </CardContent>
        </Card>

        <Card className="rounded-xl border border-border shadow-sm">
          <CardContent className="p-4 flex items-center justify-between">
            <div className="space-y-1">
              <span className="text-xs font-medium text-muted-foreground">Transactions</span>
              <p className="text-2xl font-bold font-mono text-foreground">
                {summary.totalTransactions.toLocaleString('en-IN')}
              </p>
              <span className="text-[10px] text-muted-foreground">Converted orders</span>
            </div>
            <div className="p-3 bg-indigo-500/10 rounded-xl text-indigo-600">
              <Receipt className="h-5 w-5" />
            </div>
          </CardContent>
        </Card>

        <Card className="rounded-xl border border-border shadow-sm">
          <CardContent className="p-4 flex items-center justify-between">
            <div className="space-y-1">
              <span className="text-xs font-medium text-muted-foreground">Tracked Sales</span>
              <p className="text-2xl font-bold font-mono text-foreground">
                {formatAffiliateCurrency(summary.totalSaleAmount, currency)}
              </p>
              <span className="text-[10px] text-muted-foreground">Gross Order Value (GMV)</span>
            </div>
            <div className="p-3 bg-teal-500/10 rounded-xl text-teal-600">
              <ShoppingBag className="h-5 w-5" />
            </div>
          </CardContent>
        </Card>

        <Card className="rounded-xl border border-border shadow-sm bg-primary/5">
          <CardContent className="p-4 flex items-center justify-between">
            <div className="space-y-1">
              <span className="text-xs font-medium text-primary">Estimated Commission</span>
              <p className="text-2xl font-bold font-mono text-primary">
                {formatAffiliateCurrency(summary.totalCommission, currency)}
              </p>
              <span className="text-[10px] text-primary/80">Pending &amp; validated totals</span>
            </div>
            <div className="p-3 bg-primary/10 rounded-xl text-primary">
              <Coins className="h-5 w-5" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Commission Status Breakdown */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3">
        <Card className="rounded-xl border border-border shadow-sm bg-amber-500/5">
          <CardContent className="p-3 space-y-1">
            <div className="flex items-center justify-between text-amber-700">
              <span className="text-[11px] font-semibold">Pending</span>
              <Clock className="h-3.5 w-3.5" />
            </div>
            <p className="text-lg font-bold font-mono text-foreground">
              {formatAffiliateCurrency(summary.pendingCommission, currency)}
            </p>
            <span className="text-[10px] text-muted-foreground block">
              Awaiting cancellation window
            </span>
          </CardContent>
        </Card>

        <Card className="rounded-xl border border-border shadow-sm bg-blue-500/5">
          <CardContent className="p-3 space-y-1">
            <div className="flex items-center justify-between text-blue-700">
              <span className="text-[11px] font-semibold">Validated</span>
              <CheckCircle className="h-3.5 w-3.5" />
            </div>
            <p className="text-lg font-bold font-mono text-foreground">
              {formatAffiliateCurrency(summary.validatedCommission, currency)}
            </p>
            <span className="text-[10px] text-muted-foreground block">
              Confirmed; invoice pending
            </span>
          </CardContent>
        </Card>

        <Card className="rounded-xl border border-border shadow-sm bg-emerald-500/5">
          <CardContent className="p-3 space-y-1">
            <div className="flex items-center justify-between text-emerald-700">
              <span className="text-[11px] font-semibold">Payable</span>
              <CreditCard className="h-3.5 w-3.5" />
            </div>
            <p className="text-lg font-bold font-mono text-foreground">
              {formatAffiliateCurrency(summary.payableCommission, currency)}
            </p>
            <span className="text-[10px] text-muted-foreground block">
              Cleared for payout by network
            </span>
          </CardContent>
        </Card>

        <Card className="rounded-xl border border-border shadow-sm bg-purple-500/5">
          <CardContent className="p-3 space-y-1">
            <div className="flex items-center justify-between text-purple-700">
              <span className="text-[11px] font-semibold">Claimed</span>
              <CheckCheck className="h-3.5 w-3.5" />
            </div>
            <p className="text-lg font-bold font-mono text-foreground">
              {formatAffiliateCurrency(summary.claimedCommission, currency)}
            </p>
            <span className="text-[10px] text-muted-foreground block">
              Invoiced &amp; claimed
            </span>
          </CardContent>
        </Card>

        <Card className="rounded-xl border border-border shadow-sm bg-rose-500/5">
          <CardContent className="p-3 space-y-1">
            <div className="flex items-center justify-between text-rose-700">
              <span className="text-[11px] font-semibold">Rejected</span>
              <XCircle className="h-3.5 w-3.5" />
            </div>
            <p className="text-lg font-bold font-mono text-foreground">
              {formatAffiliateCurrency(summary.rejectedCommission, currency)}
            </p>
            <span className="text-[10px] text-muted-foreground block">
              Cancelled or returned
            </span>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
