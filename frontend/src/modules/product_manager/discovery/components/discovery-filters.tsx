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
import type { SearchDiscoveryParams } from "../types";

interface DiscoveryFiltersProps {
  filters: SearchDiscoveryParams;
  onFilterChange: (filters: SearchDiscoveryParams) => void;
  isLoading: boolean;
}

export function DiscoveryFilters({
  filters,
  onFilterChange,
  isLoading,
}: DiscoveryFiltersProps) {
  const [localKeyword, setLocalKeyword] = useState(filters.keyword || "");
  const [localCategory, setLocalCategory] = useState(filters.category || "ALL");
  const [localMerchant, setLocalMerchant] = useState(filters.merchant || "ALL");

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    onFilterChange({
      ...filters,
      keyword: localKeyword.trim() || undefined,
      category: localCategory === "ALL" ? undefined : localCategory,
      merchant: localMerchant === "ALL" ? undefined : localMerchant,
    });
  };

  const handleReset = () => {
    setLocalKeyword("");
    setLocalCategory("ALL");
    setLocalMerchant("ALL");
    onFilterChange({
      keyword: undefined,
      category: undefined,
      merchant: undefined,
      limit: 20,
    });
  };

  return (
    <form
      onSubmit={handleSearch}
      className="flex flex-col sm:flex-row items-center gap-3 bg-card p-4 rounded-xl border border-border shadow-sm"
    >
      <div className="relative flex-1 w-full">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Search discovered deals by name or brand (e.g. Sony, iPhone, Puma)..."
          value={localKeyword}
          onChange={(e) => setLocalKeyword(e.target.value)}
          className="pl-9 h-9 text-xs"
        />
      </div>

      <div className="flex items-center gap-2 w-full sm:w-auto">
        <Select
          value={localCategory}
          onValueChange={(val) => setLocalCategory(val)}
        >
          <SelectTrigger className="h-9 w-full sm:w-[140px] text-xs">
            <SelectValue placeholder="Category" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="ALL">All Categories</SelectItem>
            <SelectItem value="electronics">Electronics</SelectItem>
            <SelectItem value="mobile phones">Mobile Phones</SelectItem>
            <SelectItem value="fashion">Fashion</SelectItem>
            <SelectItem value="appliances">Appliances</SelectItem>
          </SelectContent>
        </Select>

        <Select
          value={localMerchant}
          onValueChange={(val) => setLocalMerchant(val)}
        >
          <SelectTrigger className="h-9 w-full sm:w-[130px] text-xs">
            <SelectValue placeholder="Merchant" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="ALL">All Stores</SelectItem>
            <SelectItem value="amazon">Amazon</SelectItem>
            <SelectItem value="flipkart">Flipkart</SelectItem>
            <SelectItem value="myntra">Myntra</SelectItem>
            <SelectItem value="tatacliq">TataCliq</SelectItem>
          </SelectContent>
        </Select>

        <Button type="submit" size="sm" disabled={isLoading} className="h-9 px-3 gap-1 shrink-0">
          <Filter className="h-3.5 w-3.5" />
          <span>Apply</span>
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

