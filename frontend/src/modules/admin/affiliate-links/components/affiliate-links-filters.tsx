import React from 'react';
import { Search, Filter, RotateCcw } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import type { AffiliateLinksFilterParams } from '../types';

interface AffiliateLinksFiltersProps {
  filters: AffiliateLinksFilterParams;
  onChange: (updated: Partial<AffiliateLinksFilterParams>) => void;
  onReset: () => void;
}

export function AffiliateLinksFilters({
  filters,
  onChange,
  onReset,
}: AffiliateLinksFiltersProps) {
  return (
    <div className="flex flex-wrap items-center gap-3 bg-card p-4 rounded-xl border border-border">
      <div className="relative flex-1 min-w-[220px]">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Search by title, merchant, or URL..."
          value={filters.search || ''}
          onChange={(e) => onChange({ search: e.target.value, page: 1 })}
          className="pl-9"
        />
      </div>

      <div className="w-[180px]">
        <Select
          value={filters.conversionStatus || 'ALL'}
          onValueChange={(val) =>
            onChange({
              conversionStatus: val === 'ALL' ? undefined : val,
              page: 1,
            })
          }
        >
          <SelectTrigger>
            <SelectValue placeholder="Conversion Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="ALL">All Statuses</SelectItem>
            <SelectItem value="CONVERTED">CONVERTED</SelectItem>
            <SelectItem value="PENDING">PENDING</SelectItem>
            <SelectItem value="NOT_AFFILIATED">NOT_AFFILIATED</SelectItem>
            <SelectItem value="FAILED">FAILED</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="w-[160px]">
        <Select
          value={
            filters.isAffiliated === undefined
              ? 'ALL'
              : String(filters.isAffiliated)
          }
          onValueChange={(val) =>
            onChange({
              isAffiliated: val === 'ALL' ? undefined : val === 'true',
              page: 1,
            })
          }
        >
          <SelectTrigger>
            <SelectValue placeholder="Affiliation" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="ALL">All Affiliation</SelectItem>
            <SelectItem value="true">Affiliated (Yes)</SelectItem>
            <SelectItem value="false">Not Affiliated (No)</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <Button
        variant="outline"
        size="icon"
        onClick={onReset}
        title="Reset filters"
        className="shrink-0"
      >
        <RotateCcw className="h-4 w-4" />
      </Button>
    </div>
  );
}
