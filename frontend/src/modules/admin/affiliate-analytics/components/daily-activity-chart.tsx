import React from 'react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  Legend,
} from 'recharts';
import type { PerformanceReportItem } from '../types';

interface DailyActivityChartProps {
  data: PerformanceReportItem[];
  isLoading: boolean;
}

export function DailyActivityChart({ data, isLoading }: DailyActivityChartProps) {
  if (isLoading) {
    return <div className="h-72 rounded-xl bg-muted/30 animate-pulse border" />;
  }

  if (!data || data.length === 0) {
    return (
      <div className="h-72 rounded-xl border border-dashed flex items-center justify-center text-xs text-muted-foreground">
        No activity records available.
      </div>
    );
  }

  const chartData = [...data]
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
    .map((item) => ({
      date: item.date,
      clicks: Number(item.clicks) || 0,
      transactions: Number(item.transactions) || 0,
    }));

  return (
    <div className="p-4 rounded-xl border border-border bg-card space-y-3">
      <div className="flex items-center justify-between">
        <h4 className="text-xs font-semibold text-foreground">
          Clicks vs Conversions (Daily)
        </h4>
        <div className="flex items-center gap-4 text-[11px]">
          <span className="flex items-center gap-1">
            <span className="h-2.5 w-2.5 rounded-full bg-indigo-500" />
            <span className="text-muted-foreground">Clicks</span>
          </span>
          <span className="flex items-center gap-1">
            <span className="h-2.5 w-2.5 rounded-full bg-emerald-500" />
            <span className="text-muted-foreground">Transactions</span>
          </span>
        </div>
      </div>

      <div className="h-64 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={chartData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
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
            />
            <Tooltip
              content={({ active, payload, label }) => {
                if (active && payload && payload.length) {
                  return (
                    <div className="bg-popover border border-border p-2.5 rounded-lg shadow-md text-xs space-y-1">
                      <p className="font-semibold text-foreground">{label}</p>
                      <p className="text-indigo-600 font-mono">
                        Clicks: {Number(payload[0]?.value || 0).toLocaleString()}
                      </p>
                      <p className="text-emerald-600 font-mono">
                        Transactions: {Number(payload[1]?.value || 0).toLocaleString()}
                      </p>
                    </div>
                  );
                }
                return null;
              }}
            />
            <Bar dataKey="clicks" fill="#6366f1" radius={[4, 4, 0, 0]} />
            <Bar dataKey="transactions" fill="#10b981" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
