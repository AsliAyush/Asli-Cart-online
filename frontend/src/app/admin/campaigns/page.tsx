'use client';

import React, { useState } from 'react';
import { StaffPageHeader } from '@/components/layout/staff';
import { Badge } from '@/components/ui/badge';
import {
  useCampaigns,
  useRequestAccess,
  CampaignFilters,
  CampaignTable,
  CampaignDetailDialog,
  CampaignSyncButton,
  type CuelinksCampaignItem,
  type CampaignFilterParams,
} from '@/modules/admin/campaigns';

export default function AdminCampaignsPage() {
  const [filters, setFilters] = useState<CampaignFilterParams>({
    page: 1,
    limit: 20,
    sort: 'lastSyncedAt',
    order: 'desc',
  });

  const [selectedCampaign, setSelectedCampaign] = useState<CuelinksCampaignItem | null>(null);
  const [detailDialogOpen, setDetailDialogOpen] = useState<boolean>(false);

  const { data, isLoading, isError } = useCampaigns(filters);
  const { mutate: requestAccess } = useRequestAccess();

  const handleFilterChange = (updated: Partial<CampaignFilterParams>) => {
    setFilters((prev) => ({ ...prev, ...updated }));
  };

  const handleResetFilters = () => {
    setFilters({
      page: 1,
      limit: 20,
      sort: 'lastSyncedAt',
      order: 'desc',
    });
  };

  const handleSelectCampaign = (campaign: CuelinksCampaignItem) => {
    setSelectedCampaign(campaign);
    setDetailDialogOpen(true);
  };

  const handleRequestAccess = (externalId: number) => {
    requestAccess(externalId);
  };

  const handlePageChange = (newPage: number) => {
    setFilters((prev) => ({ ...prev, page: newPage }));
  };

  return (
    <div className="space-y-6">
      <StaffPageHeader
        title="Cuelinks Merchant Campaigns"
        description="Discover, browse, filter, inspect and manage merchant affiliate partnerships available through the Cuelinks V3 API."
        badge={
          <Badge variant="deal" className="text-xs">
            CUELINKS_V3
          </Badge>
        }
        actions={<CampaignSyncButton />}
      />

      {/* Filters & Search */}
      <CampaignFilters
        filters={filters}
        onChange={handleFilterChange}
        onReset={handleResetFilters}
      />

      {/* Error Banner */}
      {isError && (
        <div className="p-4 rounded-lg bg-destructive/10 border border-destructive/20 text-destructive text-sm">
          Failed to load campaigns. Please verify network connectivity or check system health.
        </div>
      )}

      {/* Campaign List Table */}
      <CampaignTable
        campaigns={data?.campaigns || []}
        pagination={data?.pagination || { page: 1, limit: 20, total: 0, totalPages: 1 }}
        isLoading={isLoading}
        onSelectCampaign={handleSelectCampaign}
        onRequestAccess={handleRequestAccess}
        onPageChange={handlePageChange}
      />

      {/* Detail Dialog */}
      <CampaignDetailDialog
        campaign={selectedCampaign}
        open={detailDialogOpen}
        onOpenChange={setDetailDialogOpen}
      />
    </div>
  );
}
