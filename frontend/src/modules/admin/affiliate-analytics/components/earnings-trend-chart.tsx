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
import type { EarningsReportItem } from '../types';
import { getAffiliateCurrencySymbol } from '../utils/currency';

interface EarningsTrendChartProps {
  data: EarningsReportItem[];
  isLoading: boolean;
}

export function EarningsTrendChart({ data, isLoading }: EarningsTrendChartProps) {
  if (isLoading) {
    return <div className="h-72 rounded-xl bg-muted/30 animate-pulse border" />;
  }

  if (!data || data.length === 0) {
    return (
      <div className="h-72 rounded-xl border border-dashed flex items-center justify-center text-xs text-muted-foreground">
        No monthly earnings data available for chart visualization.
      </div>
    );
  }

  const currency = data[0]?.currency || 'INR';
  const currSymbol = getAffiliateCurrencySymbol(currency);

  // Sort chronologically ascending
  const chartData = [...data]
    .sort((a, b) => a.month.localeCompare(b.month))
    .map((item) => ({
      month: item.month,
      pending: Number(item.pending) || 0,
      validated: Number(item.validated) || 0,
      payable: Number(item.payable) || 0,
      claimed: Number(item.claimed) || 0,
      rejected: Number(item.rejected) || 0,
    }));

  return (
    <div className="p-4 rounded-xl border border-border bg-card space-y-3">
      <div className="flex items-center justify-between">
        <h4 className="text-xs font-semibold text-foreground">
          Monthly Commission Trajectory (Status Breakdown)
        </h4>
        <span className="text-[11px] text-muted-foreground">Values in {currency} ({currSymbol.trim()})</span>
      </div>

      <div className="h-64 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={chartData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#88888820" />
            <XAxis
              dataKey="month"
              tickLine={false}
              axisLine={false}
              tick={{ fontSize: 10, fill: '#888888' }}
            />
            <YAxis
              tickLine={false}
              axisLine={false}
              tick={{ fontSize: 10, fill: '#888888' }}
              tickFormatter={(v) => `${currSymbol}${v >= 1000 ? `${(v / 1000).toFixed(0)}k` : v}`}
            />
            <Tooltip
              content={({ active, payload, label }) => {
                if (!active || !payload || !payload.length) return null;
                const total = payload.reduce((acc, p) => acc + (Number(p.value) || 0), 0);

                return (
                  <div className="bg-popover border border-border rounded-lg p-2.5 shadow-md text-xs space-y-1">
                    <p className="font-semibold text-foreground">{label}</p>
                    <div className="space-y-0.5 pt-1 font-mono text-[11px]">
                      {payload.map((entry, idx) => (
                        <div key={idx} className="flex items-center justify-between gap-4">
                          <span className="flex items-center gap-1.5 text-muted-foreground capitalize">
                            <span
                              className="h-2 w-2 rounded-full"
                              style={{ backgroundColor: entry.color }}
                            />
                            <span>{entry.name}:</span>
                          </span>
                          <span className="font-semibold text-foreground">
                            {currSymbol}{Number(entry.value).toLocaleString('en-IN', { maximumFractionDigits: 2 })}
                          </span>
                        </div>
                      ))}
                      <div className="border-t pt-1 mt-1 flex items-center justify-between font-bold text-foreground">
                        <span>Total:</span>
                        <span>{currSymbol}{total.toLocaleString('en-IN', { maximumFractionDigits: 2 })}</span>
                      </div>
                    </div>
                  </div>
                );
              }}
            />
            <Legend
              verticalAlign="top"
              align="right"
              wrapperStyle={{ fontSize: '11px', paddingBottom: '8px' }}
            />
            <Bar dataKey="pending" name="Pending" stackId="a" fill="#d97706" radius={[0, 0, 0, 0]} />
            <Bar dataKey="validated" name="Validated" stackId="a" fill="#2563eb" radius={[0, 0, 0, 0]} />
            <Bar dataKey="payable" name="Payable" stackId="a" fill="#059669" radius={[0, 0, 0, 0]} />
            <Bar dataKey="claimed" name="Claimed" stackId="a" fill="#7c3aed" radius={[0, 0, 0, 0]} />
            <Bar dataKey="rejected" name="Rejected" stackId="a" fill="#e11d48" radius={[2, 2, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
