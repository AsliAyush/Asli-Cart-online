"use client";

import React from "react";
import Link from "next/link";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { useAuditLogsList } from "@/modules/admin/audit-logs/hooks/use-admin-audit-logs";
import { Shield, ArrowRight, UserCheck, RefreshCw } from "lucide-react";

export function RecentActivity() {
  const { data, isLoading, isError, refetch } = useAuditLogsList({ limit: 6 });

  return (
    <Card className="border shadow-xs">
      <CardHeader className="flex flex-row items-center justify-between pb-3">
        <div>
          <CardTitle className="text-base font-semibold">Recent Administrative Activity</CardTitle>
          <CardDescription>Live audit events and permission changes</CardDescription>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => refetch()}
            className="h-8 w-8 p-0 text-muted-foreground"
            title="Refresh activity feed"
          >
            <RefreshCw className="h-4 w-4" />
          </Button>
          <Button variant="outline" size="sm" asChild className="h-8 text-xs">
            <Link href="/admin/audit-logs">
              View All Logs
              <ArrowRight className="h-3.5 w-3.5 ml-1" />
            </Link>
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="space-y-3">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="flex items-center justify-between py-2 border-b last:border-0">
                <div className="space-y-1">
                  <Skeleton className="h-4 w-40" />
                  <Skeleton className="h-3 w-24" />
                </div>
                <Skeleton className="h-4 w-16" />
              </div>
            ))}
          </div>
        ) : isError ? (
          <div className="py-6 text-center text-sm text-destructive">
            <p>Failed to load recent activity feed.</p>
            <Button variant="link" size="sm" onClick={() => refetch()} className="text-xs mt-1">
              Try again
            </Button>
          </div>
        ) : !data || data.items.length === 0 ? (
          <div className="py-8 text-center text-muted-foreground">
            <Shield className="h-8 w-8 mx-auto text-muted-foreground/50 mb-2" />
            <p className="text-sm font-medium">No recent audit activity</p>
            <p className="text-xs text-muted-foreground/80 mt-1">
              Administrative actions such as user updates and role assignments will appear here.
            </p>
          </div>
        ) : (
          <div className="divide-y text-sm">
            {data.items.map((log) => {
              const actorName = log.actor?.fullName || log.actor?.email || "System Service";
              const timeAgo = new Date(log.createdAt).toLocaleDateString(undefined, {
                month: "short",
                day: "numeric",
                hour: "2-digit",
                minute: "2-digit",
              });

              return (
                <div key={log.id} className="py-3 flex items-start justify-between gap-4">
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-medium text-foreground truncate max-w-[180px]">
                        {actorName}
                      </span>
                      <Badge variant="secondary" className="font-mono text-[10px] px-1.5 py-0">
                        {log.action}
                      </Badge>
                      <Badge variant="outline" className="text-[10px] uppercase font-normal text-muted-foreground">
                        {log.moduleName}
                      </Badge>
                    </div>
                    {log.entityId && (
                      <p className="text-xs text-muted-foreground/80 font-mono mt-0.5 truncate">
                        Target ID: {log.entityId}
                      </p>
                    )}
                  </div>
                  <div className="text-right shrink-0">
                    <span className="text-xs text-muted-foreground whitespace-nowrap">
                      {timeAgo}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
