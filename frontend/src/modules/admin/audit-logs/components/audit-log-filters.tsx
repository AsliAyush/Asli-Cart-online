"use client";

import React from "react";
import { Search, X } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

interface AuditLogFiltersProps {
  action: string;
  onActionChange: (value: string) => void;
  moduleName?: string;
  onModuleChange: (value?: string) => void;
  onReset: () => void;
}

const COMMON_MODULES = [
  "auth",
  "user",
  "role",
  "module",
  "product",
  "offer",
  "dashboard",
  "pricing",
  "affiliate",
];

export function AuditLogFilters({
  action,
  onActionChange,
  moduleName,
  onModuleChange,
  onReset,
}: AuditLogFiltersProps) {
  const hasActiveFilters = Boolean(action || moduleName);

  return (
    <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
      {/* Action Search */}
      <div className="relative flex-1">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Filter by action (e.g. user.activate, role.permissions_update)..."
          value={action}
          onChange={(e) => onActionChange(e.target.value)}
          className="pl-9 h-9 text-sm"
        />
        {action && (
          <button
            onClick={() => onActionChange("")}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
          >
            <X className="h-3.5 w-3.5" />
          </button>
        )}
      </div>

      {/* Module Filter */}
      <div className="w-full sm:w-48">
        <select
          value={moduleName || ""}
          onChange={(e) => onModuleChange(e.target.value || undefined)}
          className="w-full h-9 px-3 rounded-md border border-input bg-background text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
        >
          <option value="">All Modules</option>
          {COMMON_MODULES.map((mod) => (
            <option key={mod} value={mod}>
              {mod.toUpperCase()}
            </option>
          ))}
        </select>
      </div>

      {/* Clear Filters */}
      {hasActiveFilters && (
        <Button
          variant="ghost"
          size="sm"
          onClick={onReset}
          className="h-9 px-2 text-xs text-muted-foreground hover:text-foreground shrink-0"
        >
          <X className="h-3.5 w-3.5 mr-1" />
          Clear
        </Button>
      )}
    </div>
  );
}

