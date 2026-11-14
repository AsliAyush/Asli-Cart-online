"use client";

import React from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { useSystemHealth } from "../hooks/use-admin-settings";
import { Activity, Database, Server, Clock } from "lucide-react";

export function SystemStatusCard() {
  const { data: health, isLoading } = useSystemHealth();

  if (isLoading) {
    return (
      <Card className="border shadow-xs">
        <CardHeader>
          <Skeleton className="h-5 w-32" />
          <Skeleton className="h-3 w-48" />
        </CardHeader>
        <CardContent>
          <Skeleton className="h-20 w-full" />
        </CardContent>
      </Card>
    );
  }

  const isUp = health?.status === "UP";
  const isDbConnected = health?.database === "connected";

  return (
    <Card className="border shadow-xs">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-base font-semibold">Backend Infrastructure Health</CardTitle>
            <CardDescription>Live telemetry from /api/v1/health probe</CardDescription>
          </div>
          <Badge
            className={
              isUp
                ? "bg-emerald-500/10 text-emerald-600 border-emerald-500/20"
                : "bg-destructive/10 text-destructive border-destructive/20"
            }
          >
            {isUp ? "System Operational" : "Degraded"}
          </Badge>
        </div>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
          <div className="p-3 rounded-md border bg-card">
            <div className="flex items-center gap-1.5 text-muted-foreground mb-1">
              <Server className="h-3.5 w-3.5 text-primary" />
              <span>API Gateway</span>
            </div>
            <p className="font-bold text-foreground">{health?.status || "UP"}</p>
          </div>

          <div className="p-3 rounded-md border bg-card">
            <div className="flex items-center gap-1.5 text-muted-foreground mb-1">
              <Database className="h-3.5 w-3.5 text-primary" />
              <span>Neon PostgreSQL</span>
            </div>
            <p className="font-bold text-emerald-600">
              {isDbConnected ? "Connected" : "Disconnected"}
            </p>
          </div>

          <div className="p-3 rounded-md border bg-card">
            <div className="flex items-center gap-1.5 text-muted-foreground mb-1">
              <Activity className="h-3.5 w-3.5 text-primary" />
              <span>Environment</span>
            </div>
            <p className="font-bold font-mono text-foreground uppercase">
              {health?.environment || "Development"}
            </p>
          </div>

          <div className="p-3 rounded-md border bg-card">
            <div className="flex items-center gap-1.5 text-muted-foreground mb-1">
              <Clock className="h-3.5 w-3.5 text-primary" />
              <span>Server Uptime</span>
            </div>
            <p className="font-bold text-foreground">
              {health?.uptime ? `${Math.floor(health.uptime / 60)} min` : "Live"}
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

