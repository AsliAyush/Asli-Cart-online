import React from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Search, X, Filter } from 'lucide-react';
import type { CampaignFilterParams } from '../types';

interface CampaignFiltersProps {
  filters: CampaignFilterParams;
  onChange: (updated: Partial<CampaignFilterParams>) => void;
  onReset: () => void;
}

export function CampaignFilters({ filters, onChange, onReset }: CampaignFiltersProps) {
  const hasActiveFilters = Boolean(
    filters.search ||
    (filters.accessStatus && filters.accessStatus !== 'all') ||
    (filters.sort && filters.sort !== 'lastSyncedAt')
  );

  return (
    <div className="bg-card border rounded-lg p-4 space-y-3">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        {/* Search */}
        <div className="relative">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search by name, domain, category..."
            value={filters.search || ''}
            onChange={(e) => onChange({ search: e.target.value, page: 1 })}
            className="pl-9 h-9 text-sm"
          />
        </div>

        {/* Access Status Filter */}
        <div>
          <Select
            value={filters.accessStatus || 'all'}
            onValueChange={(val) => onChange({ accessStatus: val === 'all' ? undefined : val, page: 1 })}
          >
            <SelectTrigger className="h-9 text-sm">
              <SelectValue placeholder="Access Status: All" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Access Statuses</SelectItem>
              <SelectItem value="open">Open (Public)</SelectItem>
              <SelectItem value="approval_required">Approval Required</SelectItem>
              <SelectItem value="pending">Pending Approval</SelectItem>
              <SelectItem value="paused">Paused</SelectItem>
              <SelectItem value="rejected">Rejected</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Sort Filter */}
        <div>
          <Select
            value={`${filters.sort || 'lastSyncedAt'}_${filters.order || 'desc'}`}
            onValueChange={(val) => {
              const [sort, order] = val.split('_') as [string, 'asc' | 'desc'];
              onChange({ sort, order, page: 1 });
            }}
          >
            <SelectTrigger className="h-9 text-sm">
              <SelectValue placeholder="Sort by" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="lastSyncedAt_desc">Recently Synced</SelectItem>
              <SelectItem value="name_asc">Name: A to Z</SelectItem>
              <SelectItem value="name_desc">Name: Z to A</SelectItem>
              <SelectItem value="createdAt_desc">Newest First</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Clear Filters */}
        <div className="flex items-center gap-2">
          {hasActiveFilters && (
            <Button
              variant="ghost"
              size="sm"
              onClick={onReset}
              className="h-9 text-xs text-muted-foreground hover:text-foreground"
            >
              <X className="h-3.5 w-3.5 mr-1" />
              Reset Filters
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
