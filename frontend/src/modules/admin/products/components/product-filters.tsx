"use client";

import React from "react";
import { Search, X } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useCategories } from "../hooks/use-admin-products";

interface ProductFiltersProps {
  search: string;
  onSearchChange: (value: string) => void;
  categoryId?: string;
  onCategoryChange: (value?: string) => void;
  status?: string;
  onStatusChange: (value?: string) => void;
  onReset: () => void;
}

export function ProductFilters({
  search,
  onSearchChange,
  categoryId,
  onCategoryChange,
  status,
  onStatusChange,
  onReset,
}: ProductFiltersProps) {
  const { data: categories = [] } = useCategories();

  const hasActiveFilters = Boolean(search || categoryId || status);

  return (
    <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
      {/* Search Input */}
      <div className="relative flex-1">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Search by product name, brand, or description..."
          value={search}
          onChange={(e) => onSearchChange(e.target.value)}
          className="pl-9 h-9 text-sm"
        />
        {search && (
          <button
            onClick={() => onSearchChange("")}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
          >
            <X className="h-3.5 w-3.5" />
          </button>
        )}
      </div>

      {/* Category Dropdown */}
      <div className="w-full sm:w-48">
        <select
          value={categoryId || ""}
          onChange={(e) => onCategoryChange(e.target.value || undefined)}
          className="w-full h-9 px-3 rounded-md border border-input bg-background text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
        >
          <option value="">All Categories</option>
          {categories.map((cat) => (
            <option key={cat.id} value={cat.id}>
              {cat.name}
            </option>
          ))}
        </select>
      </div>

      {/* Status Dropdown */}
      <div className="w-full sm:w-44">
        <select
          value={status || ""}
          onChange={(e) => onStatusChange(e.target.value || undefined)}
          className="w-full h-9 px-3 rounded-md border border-input bg-background text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
        >
          <option value="">All Statuses</option>
          <option value="APPROVED">Approved</option>
          <option value="PENDING_APPROVAL">Pending Review</option>
          <option value="DRAFT">Draft</option>
          <option value="REJECTED">Rejected</option>
          <option value="ARCHIVED">Archived</option>
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

