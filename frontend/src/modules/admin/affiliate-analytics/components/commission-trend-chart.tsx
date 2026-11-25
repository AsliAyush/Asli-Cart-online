import React from 'react';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
} from 'recharts';
import type { PerformanceReportItem } from '../types';

interface CommissionTrendChartProps {
  data: PerformanceReportItem[];
  isLoading: boolean;
}

export function CommissionTrendChart({ data, isLoading }: CommissionTrendChartProps) {
  if (isLoading) {
    return <div className="h-72 rounded-xl bg-muted/30 animate-pulse border" />;
  }

  if (!data || data.length === 0) {
    return (
      <div className="h-72 rounded-xl border border-dashed flex items-center justify-center text-xs text-muted-foreground">
        No performance records available for this date range.
      </div>
    );
  }

  // Sort ascending by date
  const chartData = [...data]
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
    .map((item) => ({
      date: item.date,
      commission: Number(item.commission) || 0,
      saleAmount: Number(item.sale_amount) || 0,
    }));

  return (
    <div className="p-4 rounded-xl border border-border bg-card space-y-3">
      <div className="flex items-center justify-between">
        <h4 className="text-xs font-semibold text-foreground">
          Commission & Sales Trend (Daily)
        </h4>
        <div className="flex items-center gap-4 text-[11px]">
          <span className="flex items-center gap-1">
            <span className="h-2.5 w-2.5 rounded-full bg-emerald-500" />
            <span className="text-muted-foreground">Commission (₹)</span>
          </span>
          <span className="flex items-center gap-1">
            <span className="h-2.5 w-2.5 rounded-full bg-blue-500" />
            <span className="text-muted-foreground">Sales (₹)</span>
          </span>
        </div>
      </div>

      <div className="h-64 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={chartData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
            <defs>
              <linearGradient id="commGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#10b981" stopOpacity={0.4} />
                <stop offset="95%" stopColor="#10b981" stopOpacity={0.0} />
              </linearGradient>
              <linearGradient id="salesGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3} />
                <stop offset="95%" stopColor="#3b82f6" stopOpacity={0.0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#88888820" />
            <XAxis
              dataKey="date"
              tickLine={false}
              axisLine={false}
              tick={{ fontSize: 10, fill: '#888888' }}
              tickFormatter={(val) => {
                const parts = String(val).split('-');
                return parts.length >= 3 ? `${parts[1]}/${parts[2]}` : val;
              }}
            />
            <YAxis
              tickLine={false}
              axisLine={false}
              tick={{ fontSize: 10, fill: '#888888' }}
              tickFormatter={(v) => `₹${v >= 1000 ? `${(v / 1000).toFixed(0)}k` : v}`}
            />
            <Tooltip
              content={({ active, payload, label }) => {
                if (active && payload && payload.length) {
                  return (
                    <div className="bg-popover border border-border p-2.5 rounded-lg shadow-md text-xs space-y-1">
                      <p className="font-semibold text-foreground">{label}</p>
                      <p className="text-emerald-600 font-mono">
                        Commission: ₹{Number(payload[0]?.value || 0).toLocaleString('en-IN')}
                      </p>
                      <p className="text-blue-600 font-mono">
                        Sales: ₹{Number(payload[1]?.value || 0).toLocaleString('en-IN')}
                      </p>
                    </div>
                  );
                }
                return null;
              }}
            />
            <Area
              type="monotone"
              dataKey="commission"
              stroke="#10b981"
              strokeWidth={2}
              fillOpacity={1}
              fill="url(#commGrad)"
            />
            <Area
              type="monotone"
              dataKey="saleAmount"
              stroke="#3b82f6"
              strokeWidth={1.5}
              fillOpacity={1}
              fill="url(#salesGrad)"
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
