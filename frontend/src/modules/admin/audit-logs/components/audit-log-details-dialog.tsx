"use client";

import React from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { useAuditLogDetails } from "../hooks/use-admin-audit-logs";
import { Shield, User, Calendar, Layers, Terminal } from "lucide-react";

interface AuditLogDetailsDialogProps {
  logId: string | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function AuditLogDetailsDialog({
  logId,
  open,
  onOpenChange,
}: AuditLogDetailsDialogProps) {
  const { data: log, isLoading } = useAuditLogDetails(logId);

  if (!logId) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-xl max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-md bg-primary/10 text-primary">
              <Shield className="h-5 w-5" />
            </div>
            <div>
              <DialogTitle className="text-lg">Audit Telemetry Event</DialogTitle>
              <DialogDescription className="text-xs font-mono">
                Log ID: {logId}
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        {isLoading || !log ? (
          <div className="space-y-4 py-4">
            <Skeleton className="h-20 w-full rounded-lg" />
            <Skeleton className="h-32 w-full" />
          </div>
        ) : (
          <div className="space-y-4 py-2 text-xs">
            {/* Header Event Card */}
            <div className="p-3.5 rounded-lg bg-muted/40 border space-y-2">
              <div className="flex items-center justify-between">
                <Badge variant="secondary" className="font-mono text-xs font-semibold">
                  {log.action}
                </Badge>
                <Badge variant="outline" className="font-mono uppercase text-[10px]">
                  {log.moduleName}
                </Badge>
              </div>

              <div className="grid grid-cols-2 gap-2 pt-1 text-[11px]">
                <div>
                  <span className="text-muted-foreground block">Actor:</span>
                  <span className="font-semibold text-foreground">
                    {log.actor?.fullName || log.actor?.email || "System / Automated"}
                  </span>
                </div>
                <div>
                  <span className="text-muted-foreground block">Actor Role:</span>
                  <span className="font-mono text-foreground">
                    {log.actor?.role?.name || "Staff"}
                  </span>
                </div>
                <div>
                  <span className="text-muted-foreground block">Target Entity ID:</span>
                  <span className="font-mono text-foreground truncate block">
                    {log.entityId || "N/A (Global module event)"}
                  </span>
                </div>
                <div>
                  <span className="text-muted-foreground block">Recorded Timestamp:</span>
                  <span className="text-foreground">
                    {new Date(log.createdAt).toLocaleString()}
                  </span>
                </div>
              </div>
            </div>

            {/* Formatted Metadata JSON */}
            <div className="space-y-1.5">
              <div className="flex items-center gap-1.5 text-muted-foreground font-semibold">
                <Terminal className="h-3.5 w-3.5" />
                <span>Event Payload Metadata</span>
              </div>
              <div className="p-3 rounded-lg bg-slate-950 text-slate-100 font-mono text-[11px] overflow-x-auto max-h-64 border">
                {log.metadata ? (
                  <pre>{JSON.stringify(log.metadata, null, 2)}</pre>
                ) : (
                  <span className="text-slate-500 italic">No additional metadata payload attached to this event.</span>
                )}
              </div>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}

