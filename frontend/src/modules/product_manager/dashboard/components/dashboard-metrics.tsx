import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Package,
  Tag,
  Clock,
  CheckCircle2,
  FileEdit,
  Share2,
  AlertCircle,
  Archive,
} from "lucide-react";
import type { ProductManagerSummary } from "../types";

interface DashboardMetricsProps {
  summary?: ProductManagerSummary;
  isLoading: boolean;
}

export function DashboardMetrics({ summary, isLoading }: DashboardMetricsProps) {
  if (isLoading) {
    return (
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
        {Array.from({ length: 8 }).map((_, i) => (
          <Card key={i} className="border-border">
            <CardContent className="p-4 space-y-2">
              <Skeleton className="h-4 w-20" />
              <Skeleton className="h-8 w-16" />
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  const p = summary?.products;
  const o = summary?.offers;

  const metricCards = [
    {
      label: "Total Products",
      value: p?.total ?? 0,
      description: "Master catalog items",
      icon: Package,
      iconColor: "text-blue-600 bg-blue-500/10",
    },
    {
      label: "Active Products",
      value: p?.active ?? 0,
      description: "Approved & live",
      icon: CheckCircle2,
      iconColor: "text-emerald-600 bg-emerald-500/10",
    },
    {
      label: "Draft Products",
      value: p?.draft ?? 0,
      description: "Under initial creation",
      icon: FileEdit,
      iconColor: "text-amber-600 bg-amber-500/10",
    },
    {
      label: "Pending Products",
      value: p?.pendingApproval ?? 0,
      description: "Awaiting Admin approval",
      icon: Clock,
      iconColor: "text-purple-600 bg-purple-500/10",
    },
    {
      label: "Assigned to SMM",
      value: p?.assignedToSmm ?? 0,
      description: "Ready for social broadcast",
      icon: Share2,
      iconColor: "text-indigo-600 bg-indigo-500/10",
    },
    {
      label: "Total Merchant Offers",
      value: o?.total ?? 0,
      description: "Deals across merchants",
      icon: Tag,
      iconColor: "text-pink-600 bg-pink-500/10",
    },
    {
      label: "Live Published Offers",
      value: o?.active ?? 0,
      description: "Visible to customers",
      icon: CheckCircle2,
      iconColor: "text-emerald-600 bg-emerald-500/10",
    },
    {
      label: "Pending Offer Review",
      value: o?.pendingApproval ?? 0,
      description: "Needs Admin review",
      icon: AlertCircle,
      iconColor: "text-amber-600 bg-amber-500/10",
    },
  ];

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
      {metricCards.map((item, index) => {
        const Icon = item.icon;
        return (
          <Card key={index} className="border-border hover:border-primary/40 transition-colors">
            <CardContent className="p-4 flex items-center justify-between">
              <div className="space-y-1">
                <p className="text-xs font-medium text-muted-foreground">
                  {item.label}
                </p>
                <p className="text-2xl font-bold tracking-tight text-foreground">
                  {item.value}
                </p>
                <p className="text-[11px] text-muted-foreground/80">
                  {item.description}
                </p>
              </div>
              <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${item.iconColor}`}>
                <Icon className="h-5 w-5" />
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}

