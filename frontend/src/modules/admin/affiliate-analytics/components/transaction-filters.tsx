import React from 'react';
import { Search, RotateCcw } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import type { TransactionFilterParams } from '../types';

interface TransactionFiltersProps {
  filters: TransactionFilterParams;
  onChange: (updated: Partial<TransactionFilterParams>) => void;
  onReset: () => void;
}

export function TransactionFilters({
  filters,
  onChange,
  onReset,
}: TransactionFiltersProps) {
  return (
    <div className="flex flex-wrap items-center gap-3 bg-card p-4 rounded-xl border border-border">
      <div className="relative flex-1 min-w-[200px]">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Search by ID, product, order, or campaign..."
          value={filters.search || ''}
          onChange={(e) => onChange({ search: e.target.value, page: 1 })}
          className="pl-9"
        />
      </div>

      <div className="w-[160px]">
        <Select
          value={filters.status || 'ALL'}
          onValueChange={(val) =>
            onChange({
              status: val === 'ALL' ? undefined : val,
              page: 1,
            })
          }
        >
          <SelectTrigger>
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="ALL">All Statuses</SelectItem>
            <SelectItem value="pending">Pending</SelectItem>
            <SelectItem value="validated">Validated</SelectItem>
            <SelectItem value="payable">Payable</SelectItem>
            <SelectItem value="claimed">Claimed</SelectItem>
            <SelectItem value="rejected">Rejected</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="flex items-center gap-2">
        <Input
          type="date"
          value={filters.startDate || ''}
          onChange={(e) => onChange({ startDate: e.target.value, page: 1 })}
          className="w-[140px] text-xs"
          title="Start Date"
        />
        <span className="text-xs text-muted-foreground">to</span>
        <Input
          type="date"
          value={filters.endDate || ''}
          onChange={(e) => onChange({ endDate: e.target.value, page: 1 })}
          className="w-[140px] text-xs"
          title="End Date"
        />
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
