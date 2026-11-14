"use client";

import React from "react";
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Cell,
  PieChart,
  Pie,
  Legend,
} from "recharts";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Info, TrendingUp } from "lucide-react";
import type { ConsolidatedAdminMetrics } from "../types";

interface DashboardChartsProps {
  metrics?: ConsolidatedAdminMetrics;
}

const OFFER_COLORS = ["#10b981", "#f59e0b", "#64748b", "#ef4444"];
const PRODUCT_COLORS = ["#3b82f6", "#8b5cf6", "#f59e0b"];

export function DashboardCharts({ metrics }: DashboardChartsProps) {
  if (!metrics) return null;

  const offerData = [
    { name: "Published", value: metrics.publishedOffers, color: "#10b981" },
    { name: "Pending", value: metrics.pendingOfferApprovals, color: "#f59e0b" },
    { name: "Expired", value: metrics.expiredOffers, color: "#64748b" },
    {
      name: "Other/Draft",
      value: Math.max(
        0,
        metrics.totalOffers -
          (metrics.publishedOffers + metrics.pendingOfferApprovals + metrics.expiredOffers)
      ),
      color: "#94a3b8",
    },
  ].filter((d) => d.value > 0);

  const productData = [
    { name: "Approved", count: metrics.approvedProducts },
    { name: "Draft", count: metrics.draftProducts },
    { name: "Pending", count: metrics.pendingProducts },
  ];

  const totalCatalogStatus = metrics.approvedProducts + metrics.draftProducts + metrics.pendingProducts;

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* Real Offer Status Breakdown */}
      <Card className="border shadow-xs">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-base font-semibold">Offer Status Distribution</CardTitle>
              <CardDescription>Live breakdown across all merchant deals</CardDescription>
            </div>
            <Badge variant="outline" className="text-xs font-normal">
              Live Backend Data
            </Badge>
          </div>
        </CardHeader>
        <CardContent>
          {offerData.length === 0 ? (
            <div className="h-64 flex flex-col items-center justify-center text-center p-6 border rounded-lg border-dashed">
              <Info className="h-8 w-8 text-muted-foreground/60 mb-2" />
              <p className="text-sm font-medium text-muted-foreground">No offers recorded in catalog</p>
              <p className="text-xs text-muted-foreground/80 mt-1 max-w-xs">
                As Product Managers submit and publish merchant offers, the live distribution will appear here.
              </p>
            </div>
          ) : (
            <div className="h-64 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={offerData}
                    cx="50%"
                    cy="50%"
                    innerRadius={55}
                    outerRadius={80}
                    paddingAngle={4}
                    dataKey="value"
                  >
                    {offerData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color || OFFER_COLORS[index % OFFER_COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip
                    formatter={(value: any) => [`${value} offers`, "Count"]}
                    contentStyle={{ borderRadius: "8px", fontSize: "12px" }}
                  />
                  <Legend verticalAlign="bottom" height={36} iconSize={10} />
                </PieChart>
              </ResponsiveContainer>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Real Product Catalog Breakdown */}
      <Card className="border shadow-xs">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-base font-semibold">Product Catalog Breakdown</CardTitle>
              <CardDescription>Categorized by workflow approval state</CardDescription>
            </div>
            <Badge variant="outline" className="text-xs font-normal">
              Live Backend Data
            </Badge>
          </div>
        </CardHeader>
        <CardContent>
          {totalCatalogStatus === 0 ? (
            <div className="h-64 flex flex-col items-center justify-center text-center p-6 border rounded-lg border-dashed">
              <Info className="h-8 w-8 text-muted-foreground/60 mb-2" />
              <p className="text-sm font-medium text-muted-foreground">No products found in catalog</p>
              <p className="text-xs text-muted-foreground/80 mt-1 max-w-xs">
                Products created in the Product Manager module will automatically populate here.
              </p>
            </div>
          ) : (
            <div className="h-64 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={productData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <XAxis dataKey="name" fontSize={12} tickLine={false} axisLine={false} />
                  <YAxis fontSize={12} tickLine={false} axisLine={false} allowDecimals={false} />
                  <Tooltip
                    formatter={(value: any) => [`${value} products`, "Count"]}
                    contentStyle={{ borderRadius: "8px", fontSize: "12px" }}
                  />
                  <Bar dataKey="count" radius={[4, 4, 0, 0]}>
                    {productData.map((_, index) => (
                      <Cell key={`bar-${index}`} fill={PRODUCT_COLORS[index % PRODUCT_COLORS.length]} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Time-Series Analytics (Pending Backend Aggregation APIs) */}
      <Card className="border shadow-xs lg:col-span-2 bg-muted/20">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
              <CardTitle className="text-base font-semibold">
                Historical Trends & Growth Metrics
              </CardTitle>
            </div>
            <Badge variant="secondary" className="text-xs">
              Pending Backend Time-Series API
            </Badge>
          </div>
          <CardDescription>
            User registration growth, daily product onboarding, and affiliate click conversion trends
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col items-center justify-center text-center p-8 border border-dashed rounded-lg bg-background/50">
            <Info className="h-8 w-8 text-muted-foreground/50 mb-2" />
            <h4 className="text-sm font-semibold text-foreground">Time-series data aggregation not yet available</h4>
            <p className="text-xs text-muted-foreground mt-1 max-w-lg">
              Per strict system specification, Asli Cart never synthesizes fake growth charts or mock click rates.
              Dedicated chronological aggregation endpoints (e.g., daily affiliate clicks and cohort retention) will be integrated once provisioned on the backend analytics worker.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

