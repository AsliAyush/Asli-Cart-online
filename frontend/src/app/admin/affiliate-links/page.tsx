'use client';

import React, { useState } from 'react';
import { StaffPageHeader } from '@/components/layout/staff';
import {
  useAffiliateLinks,
  useRetryAffiliateLink,
  AffiliateLinksFilters,
  AffiliateLinksTable,
  AffiliateLinkDetailDialog,
  type AffiliateOfferItem,
  type AffiliateLinksFilterParams,
} from '@/modules/admin/affiliate-links';

export default function AdminAffiliateLinksPage() {
  const [filters, setFilters] = useState<AffiliateLinksFilterParams>({
    page: 1,
    limit: 20,
  });

  const [selectedOffer, setSelectedOffer] = useState<AffiliateOfferItem | null>(null);
  const [detailDialogOpen, setDetailDialogOpen] = useState<boolean>(false);
  const [retryingId, setRetryingId] = useState<string | null>(null);

  const { data, isLoading } = useAffiliateLinks(filters);
  const { mutate: retryConversion } = useRetryAffiliateLink();

  const handleFilterChange = (updated: Partial<AffiliateLinksFilterParams>) => {
    setFilters((prev) => ({ ...prev, ...updated }));
  };

  const handleResetFilters = () => {
    setFilters({
      page: 1,
      limit: 20,
    });
  };

  const handleView = (offer: AffiliateOfferItem) => {
    setSelectedOffer(offer);
    setDetailDialogOpen(true);
  };

  const handleRetry = (offer: AffiliateOfferItem) => {
    setRetryingId(offer.id);
    retryConversion(offer.id, {
      onSettled: () => {
        setRetryingId(null);
      },
      onSuccess: (updatedResult) => {
        if (selectedOffer && selectedOffer.id === offer.id) {
          setSelectedOffer((prev) =>
            prev
              ? {
                  ...prev,
                  conversionStatus: updatedResult.conversionStatus,
                  isAffiliated: updatedResult.isAffiliated,
                  affiliateUrl: updatedResult.affiliateUrl,
                  conversionError: updatedResult.conversionError,
                  lastConvertedAt: new Date().toISOString(),
                }
              : null
          );
        }
      },
    });
  };

  const handlePageChange = (newPage: number) => {
    setFilters((prev) => ({ ...prev, page: newPage }));
  };

  return (
    <div className="space-y-6">
      <StaffPageHeader
        title="Affiliate Links Management"
        description="Monitor, inspect, and retry Cuelinks V3 affiliate link conversions across catalog offers."
      />

      <AffiliateLinksFilters
        filters={filters}
        onChange={handleFilterChange}
        onReset={handleResetFilters}
      />

      <AffiliateLinksTable
        items={data?.items || []}
        pagination={
          data?.pagination || {
            page: filters.page || 1,
            limit: filters.limit || 20,
            total: (data?.items || []).length,
            totalPages: 1,
          }
        }
        isLoading={isLoading}
        onPageChange={handlePageChange}
        onView={handleView}
        onRetry={handleRetry}
        retryingId={retryingId}
      />

      <AffiliateLinkDetailDialog
        offer={selectedOffer}
        isOpen={detailDialogOpen}
        onClose={() => setDetailDialogOpen(false)}
        onRetry={handleRetry}
        isRetrying={retryingId === selectedOffer?.id}
      />
    </div>
  );
}
