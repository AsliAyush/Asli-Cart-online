"use client";

import React from "react";
import { Search, X, SlidersHorizontal, ArrowUpDown } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useCustomerCategories } from "../hooks/use-customer-catalog";
import type { ListCustomerProductsParams } from "../types";

interface ProductFiltersProps {
  filters: ListCustomerProductsParams;
  onFilterChange: (filters: Partial<ListCustomerProductsParams>) => void;
  onReset: () => void;
}

export function ProductFilters({
  filters,
  onFilterChange,
  onReset,
}: ProductFiltersProps) {
  const { data: categories = [] } = useCustomerCategories();
  const [localSearch, setLocalSearch] = React.useState(filters.search || "");

  // Sync local search when filters are reset or modified externally
  React.useEffect(() => {
    setLocalSearch(filters.search || "");
  }, [filters.search]);

  // Debounce search input to eliminate request waterfalls while typing
  React.useEffect(() => {
    if (localSearch === (filters.search || "")) return;
    const timer = setTimeout(() => {
      onFilterChange({ search: localSearch.trim() || undefined, page: 1 });
    }, 300);
    return () => clearTimeout(timer);
  }, [localSearch, filters.search, onFilterChange]);

  const hasActiveFilters = Boolean(
    filters.search ||
      filters.category ||
      filters.minDiscount ||
      filters.minPrice ||
      filters.maxPrice ||
      (filters.sort && filters.sort !== "newest")
  );

  return (
    <div className="rounded-xl border border-border/80 bg-card p-4 space-y-4 shadow-sm">
      <div className="flex flex-col md:flex-row gap-3 items-stretch md:items-center justify-between">
        {/* Search input */}
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
          <Input
            type="search"
            placeholder="Search deals, products, brands..."
            value={localSearch}
            onChange={(e) => setLocalSearch(e.target.value)}
            className="pl-9 pr-4 h-9 text-xs bg-secondary/40"
          />
        </div>

        {/* Filter controls row */}
        <div className="flex flex-wrap items-center gap-2 sm:gap-3">
          {/* Category Select */}
          <div className="w-[150px] sm:w-[170px]">
            <Select
              value={filters.category || "all"}
              onValueChange={(val) =>
                onFilterChange({
                  category: val === "all" ? undefined : val,
                  page: 1,
                })
              }
            >
              <SelectTrigger className="h-9 text-xs">
                <SelectValue placeholder="All Categories" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all" className="text-xs">
                  All Categories
                </SelectItem>
                {categories.map((c) => (
                  <SelectItem key={c.id} value={c.slug || c.id} className="text-xs">
                    {c.name} ({c._count?.products || 0})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Discount Filter */}
          <div className="w-[130px] sm:w-[150px]">
            <Select
              value={filters.minDiscount ? String(filters.minDiscount) : "all"}
              onValueChange={(val) =>
                onFilterChange({
                  minDiscount: val === "all" ? undefined : Number(val),
                  page: 1,
                })
              }
            >
              <SelectTrigger className="h-9 text-xs">
                <SelectValue placeholder="Discount" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all" className="text-xs">
                  Any Discount
                </SelectItem>
                <SelectItem value="10" className="text-xs">
                  10% or more
                </SelectItem>
                <SelectItem value="25" className="text-xs">
                  25% or more
                </SelectItem>
                <SelectItem value="40" className="text-xs">
                  40% or more
                </SelectItem>
                <SelectItem value="50" className="text-xs">
                  50% or more
                </SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Sort Select */}
          <div className="w-[140px] sm:w-[160px]">
            <Select
              value={filters.sort || "newest"}
              onValueChange={(val: any) => onFilterChange({ sort: val, page: 1 })}
            >
              <SelectTrigger className="h-9 text-xs">
                <ArrowUpDown className="h-3.5 w-3.5 mr-1.5 text-muted-foreground" />
                <SelectValue placeholder="Sort by" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="newest" className="text-xs">
                  Newest Deals
                </SelectItem>
                <SelectItem value="discount_desc" className="text-xs">
                  Biggest Discount
                </SelectItem>
                <SelectItem value="price_asc" className="text-xs">
                  Price: Low to High
                </SelectItem>
                <SelectItem value="price_desc" className="text-xs">
                  Price: High to Low
                </SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Reset button */}
          {hasActiveFilters && (
            <Button
              variant="ghost"
              size="sm"
              onClick={onReset}
              className="h-9 px-2.5 text-xs text-muted-foreground hover:text-foreground"
            >
              <X className="h-3.5 w-3.5 mr-1" />
              <span>Reset</span>
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}

