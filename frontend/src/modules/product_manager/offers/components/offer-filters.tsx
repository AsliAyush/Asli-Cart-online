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
import type { ListPMOffersParams } from "../types";

interface OfferFiltersProps {
  params: ListPMOffersParams;
  onParamChange: (params: ListPMOffersParams) => void;
  isLoading: boolean;
}

export function OfferFilters({
  params,
  onParamChange,
  isLoading,
}: OfferFiltersProps) {
  const [localSearch, setLocalSearch] = useState(params.search || "");
  const [localStatus, setLocalStatus] = useState(params.status || "ALL");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onParamChange({
      ...params,
      page: 1,
      search: localSearch.trim() || undefined,
      status: localStatus === "ALL" ? undefined : localStatus,
    });
  };

  const handleReset = () => {
    setLocalSearch("");
    setLocalStatus("ALL");
    onParamChange({
      page: 1,
      limit: 10,
      search: undefined,
      status: undefined,
    });
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="flex flex-col sm:flex-row items-center gap-3 bg-card p-4 rounded-xl border border-border shadow-sm"
    >
      <div className="relative flex-1 w-full">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Search offers by title or product name..."
          value={localSearch}
          onChange={(e) => setLocalSearch(e.target.value)}
          className="pl-9 h-9 text-xs"
        />
      </div>

      <div className="flex items-center gap-2 w-full sm:w-auto">
        <Select value={localStatus} onValueChange={(val) => setLocalStatus(val)}>
          <SelectTrigger className="h-9 w-full sm:w-[170px] text-xs">
            <SelectValue placeholder="All Statuses" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="ALL">All Statuses</SelectItem>
            <SelectItem value="DRAFT">DRAFT</SelectItem>
            <SelectItem value="PENDING_APPROVAL">PENDING_APPROVAL</SelectItem>
            <SelectItem value="APPROVED">APPROVED</SelectItem>
            <SelectItem value="PUBLISHED">PUBLISHED</SelectItem>
            <SelectItem value="REJECTED">REJECTED</SelectItem>
            <SelectItem value="PAUSED">PAUSED</SelectItem>
            <SelectItem value="EXPIRED">EXPIRED</SelectItem>
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

