"use client";

import React, { useState } from "react";
import { StaffPageHeader } from "@/components/layout/staff";
import { Button } from "@/components/ui/button";
import {
  useOffersList,
  OfferTable,
  OfferFilters,
} from "@/modules/admin/offers";
import { RefreshCw, Tag } from "lucide-react";

export default function AdminOffersPage() {
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState<string | undefined>(undefined);

  const limit = 10;

  const { data, isLoading, refetch, isFetching } = useOffersList({
    page,
    limit,
    search: search || undefined,
    status: status || undefined,
  });

  const handleResetFilters = () => {
    setSearch("");
    setStatus(undefined);
    setPage(1);
  };

  const offers = data?.items || [];
  const total = data?.pagination.total || 0;
  const totalPages = data?.pagination.totalPages || 1;

  return (
    <div className="space-y-6">
      <StaffPageHeader
        title="Global Deals & Offer Approvals"
        description="Inspect merchant price discounts, verify auto-generated affiliate monetization links, review pending approvals, and manage deal lifecycle."
        actions={
          <Button
            variant="outline"
            size="sm"
            onClick={() => refetch()}
            disabled={isFetching}
            className="text-xs h-8"
          >
            <RefreshCw className={`h-3.5 w-3.5 mr-1.5 ${isFetching ? "animate-spin" : ""}`} />
            Refresh Deals
          </Button>
        }
      />

      {/* Offer Filters */}
      <OfferFilters
        search={search}
        onSearchChange={(val) => {
          setSearch(val);
          setPage(1);
        }}
        status={status}
        onStatusChange={(val) => {
          setStatus(val);
          setPage(1);
        }}
        onReset={handleResetFilters}
      />

      {/* Offer Table */}
      <OfferTable
        offers={offers}
        isLoading={isLoading}
        page={page}
        totalPages={totalPages}
        total={total}
        limit={limit}
        onPageChange={(newPage) => setPage(newPage)}
      />
    </div>
  );
}
