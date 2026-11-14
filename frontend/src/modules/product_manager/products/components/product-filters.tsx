import React, { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Search, RotateCcw, Filter } from "lucide-react";
import type { ListPMProductsParams, ProductCategorySummary } from "../types";

interface ProductFiltersProps {
  params: ListPMProductsParams;
  categories: ProductCategorySummary[];
  onParamChange: (params: ListPMProductsParams) => void;
  isLoading: boolean;
}

export function ProductFilters({
  params,
  categories,
  onParamChange,
  isLoading,
}: ProductFiltersProps) {
  const [localSearch, setLocalSearch] = useState(params.search || "");
  const [localStatus, setLocalStatus] = useState(params.status || "ALL");
  const [localCategory, setLocalCategory] = useState(params.categoryId || "ALL");
  const [localSmm, setLocalSmm] = useState<string>(
    typeof params.isAssignedToSmm === "boolean"
      ? String(params.isAssignedToSmm)
      : "ALL"
  );

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onParamChange({
      ...params,
      page: 1,
      search: localSearch.trim() || undefined,
      status: localStatus === "ALL" ? undefined : localStatus,
      categoryId: localCategory === "ALL" ? undefined : localCategory,
      isAssignedToSmm:
        localSmm === "ALL" ? undefined : localSmm === "true",
    });
  };

  const handleReset = () => {
    setLocalSearch("");
    setLocalStatus("ALL");
    setLocalCategory("ALL");
    setLocalSmm("ALL");
    onParamChange({
      page: 1,
      limit: 10,
      search: undefined,
      status: undefined,
      categoryId: undefined,
      isAssignedToSmm: undefined,
    });
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="flex flex-col lg:flex-row items-center gap-3 bg-card p-4 rounded-xl border border-border shadow-sm"
    >
      <div className="relative flex-1 w-full">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Search products by title, description, or brand..."
          value={localSearch}
          onChange={(e) => setLocalSearch(e.target.value)}
          className="pl-9 h-9 text-xs"
        />
      </div>

      <div className="flex flex-wrap sm:flex-nowrap items-center gap-2 w-full lg:w-auto">
        <Select value={localCategory} onValueChange={(val) => setLocalCategory(val)}>
          <SelectTrigger className="h-9 w-full sm:w-[150px] text-xs">
            <SelectValue placeholder="All Categories" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="ALL">All Categories</SelectItem>
            {categories.map((c) => (
              <SelectItem key={c.id} value={c.id}>
                {c.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select value={localStatus} onValueChange={(val) => setLocalStatus(val)}>
          <SelectTrigger className="h-9 w-full sm:w-[140px] text-xs">
            <SelectValue placeholder="All Statuses" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="ALL">All Statuses</SelectItem>
            <SelectItem value="DRAFT">DRAFT</SelectItem>
            <SelectItem value="PENDING_APPROVAL">PENDING_APPROVAL</SelectItem>
            <SelectItem value="APPROVED">APPROVED</SelectItem>
            <SelectItem value="REJECTED">REJECTED</SelectItem>
            <SelectItem value="ARCHIVED">ARCHIVED</SelectItem>
          </SelectContent>
        </Select>

        <Select value={localSmm} onValueChange={(val) => setLocalSmm(val)}>
          <SelectTrigger className="h-9 w-full sm:w-[130px] text-xs">
            <SelectValue placeholder="SMM Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="ALL">All SMM</SelectItem>
            <SelectItem value="true">Assigned SMM</SelectItem>
            <SelectItem value="false">Unassigned</SelectItem>
          </SelectContent>
        </Select>

        <Button type="submit" size="sm" disabled={isLoading} className="h-9 px-3 gap-1 shrink-0">
          <Filter className="h-3.5 w-3.5" />
          <span>Filter</span>
        </Button>

        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={handleReset}
          disabled={isLoading}
          className="h-9 px-2.5 shrink-0"
          title="Reset filters"
        >
          <RotateCcw className="h-3.5 w-3.5" />
        </Button>
      </div>
    </form>
  );
}

