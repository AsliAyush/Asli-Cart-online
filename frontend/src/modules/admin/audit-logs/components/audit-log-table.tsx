"use client";

import React, { useState } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import type { AdminAuditLog } from "../types";
import { AuditLogDetailsDialog } from "./audit-log-details-dialog";
import { Eye, ChevronLeft, ChevronRight, Shield } from "lucide-react";

interface AuditLogTableProps {
  logs: AdminAuditLog[];
  isLoading: boolean;
  page: number;
  totalPages: number;
  total: number;
  limit: number;
  onPageChange: (newPage: number) => void;
}

export function AuditLogTable({
  logs,
  isLoading,
  page,
  totalPages,
  total,
  limit,
  onPageChange,
}: AuditLogTableProps) {
  const [selectedLogId, setSelectedLogId] = useState<string | null>(null);
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);

  const handleOpenDetails = (id: string) => {
    setSelectedLogId(id);
    setIsDetailsOpen(true);
  };

  if (isLoading) {
    return (
      <div className="border rounded-lg bg-card overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Timestamp</TableHead>
              <TableHead>Actor</TableHead>
              <TableHead>Action</TableHead>
              <TableHead>Module</TableHead>
              <TableHead>Target ID</TableHead>
              <TableHead className="w-16 text-right">Details</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {Array.from({ length: 6 }).map((_, i) => (
              <TableRow key={i}>
                <TableCell><Skeleton className="h-4 w-28" /></TableCell>
                <TableCell><Skeleton className="h-4 w-32" /></TableCell>
                <TableCell><Skeleton className="h-5 w-24" /></TableCell>
                <TableCell><Skeleton className="h-5 w-16" /></TableCell>
                <TableCell><Skeleton className="h-4 w-24" /></TableCell>
                <TableCell className="text-right"><Skeleton className="h-8 w-8 ml-auto" /></TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    );
  }

  if (logs.length === 0) {
    return (
      <div className="border border-dashed rounded-lg p-12 text-center bg-card">
        <Shield className="h-10 w-10 text-muted-foreground/50 mx-auto mb-3" />
        <h3 className="text-base font-semibold text-foreground">No audit events match your filter</h3>
        <p className="text-xs text-muted-foreground mt-1 max-w-sm mx-auto">
          Administrative changes, authorization updates, and security events will be indexed here in real time.
        </p>
      </div>
    );
  }

  return (
    <>
      <div className="border rounded-lg bg-card overflow-hidden shadow-2xs">
        <Table>
          <TableHeader>
            <TableRow className="bg-muted/30">
              <TableHead>Timestamp</TableHead>
              <TableHead>Actor</TableHead>
              <TableHead>Action</TableHead>
              <TableHead>Module</TableHead>
              <TableHead>Target Entity ID</TableHead>
              <TableHead className="w-16 text-right">Details</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {logs.map((log) => {
              const formattedDate = new Date(log.createdAt).toLocaleDateString(undefined, {
                month: "short",
                day: "numeric",
                hour: "2-digit",
                minute: "2-digit",
              });

              const actorName = log.actor?.fullName || log.actor?.email || "System Service";

              return (
                <TableRow key={log.id} className="hover:bg-muted/20">
                  {/* Timestamp */}
                  <TableCell className="text-xs text-muted-foreground whitespace-nowrap">
                    {formattedDate}
                  </TableCell>

                  {/* Actor */}
                  <TableCell>
                    <div className="min-w-0 max-w-[160px]">
                      <p className="text-xs font-semibold text-foreground truncate">
                        {actorName}
                      </p>
                      {log.actor?.email && (
                        <p className="text-[10px] text-muted-foreground truncate">
                          {log.actor.email}
                        </p>
                      )}
                    </div>
                  </TableCell>

                  {/* Action */}
                  <TableCell>
                    <Badge variant="secondary" className="font-mono text-[10px] px-1.5 py-0">
                      {log.action}
                    </Badge>
                  </TableCell>

                  {/* Module */}
                  <TableCell>
                    <Badge variant="outline" className="font-mono uppercase text-[10px]">
                      {log.moduleName}
                    </Badge>
                  </TableCell>

                  {/* Target Entity ID */}
                  <TableCell className="font-mono text-xs text-muted-foreground truncate max-w-[120px]">
                    {log.entityId || "—"}
                  </TableCell>

                  {/* Details Button */}
                  <TableCell className="text-right">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleOpenDetails(log.id)}
                      className="h-8 w-8 p-0"
                      title="Inspect audit payload"
                    >
                      <Eye className="h-4 w-4" />
                    </Button>
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>

        {/* Pagination Bar */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 p-3 border-t bg-muted/10 text-xs text-muted-foreground">
          <div>
            Showing {(page - 1) * limit + 1} to {Math.min(page * limit, total)} of {total} audit records
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => onPageChange(page - 1)}
              disabled={page <= 1}
              className="h-8 text-xs px-2.5"
            >
              <ChevronLeft className="h-3.5 w-3.5 mr-1" />
              Previous
            </Button>
            <span className="px-2 font-medium text-foreground">
              Page {page} of {Math.max(1, totalPages)}
            </span>
            <Button
              variant="outline"
              size="sm"
              onClick={() => onPageChange(page + 1)}
              disabled={page >= totalPages}
              className="h-8 text-xs px-2.5"
            >
              Next
              <ChevronRight className="h-3.5 w-3.5 ml-1" />
            </Button>
          </div>
        </div>
      </div>

      <AuditLogDetailsDialog
        logId={selectedLogId}
        open={isDetailsOpen}
        onOpenChange={setIsDetailsOpen}
      />
    </>
  );
}

