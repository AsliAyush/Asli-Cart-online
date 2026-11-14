"use client";

import React, { useState } from "react";
import { StaffPageHeader } from "@/components/layout/staff";
import { Button } from "@/components/ui/button";
import {
  useAuditLogsList,
  AuditLogTable,
  AuditLogFilters,
} from "@/modules/admin/audit-logs";
import { RefreshCw, Shield } from "lucide-react";

export default function AdminAuditLogsPage() {
  const [page, setPage] = useState(1);
  const [action, setAction] = useState("");
  const [moduleName, setModuleName] = useState<string | undefined>(undefined);

  const limit = 15;

  const { data, isLoading, refetch, isFetching } = useAuditLogsList({
    page,
    limit,
    action: action || undefined,
    moduleName: moduleName || undefined,
  });

  const handleResetFilters = () => {
    setAction("");
    setModuleName(undefined);
    setPage(1);
  };

  const logs = data?.items || [];
  const total = data?.pagination.total || 0;
  const totalPages = data?.pagination.totalPages || 1;

  return (
    <div className="space-y-6">
      <StaffPageHeader
        title="Administrative Audit & Security Telemetry"
        description="Comprehensive audit trail of employee account modifications, role permission changes, and platform security events."
        actions={
          <Button
            variant="outline"
            size="sm"
            onClick={() => refetch()}
            disabled={isFetching}
            className="text-xs h-8"
          >
            <RefreshCw className={`h-3.5 w-3.5 mr-1.5 ${isFetching ? "animate-spin" : ""}`} />
            Refresh Trail
          </Button>
        }
      />

      {/* Filters */}
      <AuditLogFilters
        action={action}
        onActionChange={(val) => {
          setAction(val);
          setPage(1);
        }}
        moduleName={moduleName}
        onModuleChange={(val) => {
          setModuleName(val);
          setPage(1);
        }}
        onReset={handleResetFilters}
      />

      {/* Audit Logs Table */}
      <AuditLogTable
        logs={logs}
        isLoading={isLoading}
        page={page}
        totalPages={totalPages}
        total={total}
        limit={limit}
        onPageChange={(newPage) => setPage(newPage)}
      />
    </div>
  );
}

