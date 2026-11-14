"use client";

import React, { useState } from "react";
import { StaffPageHeader } from "@/components/layout/staff";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { PlusCircle, RefreshCw, AlertCircle, Link2 } from "lucide-react";
import {
  usePMOffers,
  OfferFilters,
  OfferTable,
  CreateOfferDialog,
  EditOfferDialog,
  OfferDetailsDialog,
  SubmitApprovalDialog,
  UpdateStatusDialog,
  type PMOfferListItem,
  type CreateOfferInput,
  type UpdateOfferInput,
} from "@/modules/product_manager/offers";
import { LinkConverterCard } from "@/modules/product_manager/affiliate";

export default function ProductManagerOffersPage() {
  const {
    items,
    pagination,
    isLoading,
    isError,
    error,
    params,
    setParams,
    products,
    createOffer,
    isCreating,
    updateOffer,
    isUpdating,
    submitForApproval,
    isSubmitting,
    updateStatus,
    isUpdatingStatus,
    refetch,
  } = usePMOffers();

  // Dialog and drawer state
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [selectedOffer, setSelectedOffer] = useState<PMOfferListItem | null>(null);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [isSubmitOpen, setIsSubmitOpen] = useState(false);
  const [statusTarget, setStatusTarget] = useState<"PAUSED" | "EXPIRED" | null>(null);
  const [isStatusOpen, setIsStatusOpen] = useState(false);
  const [showConverter, setShowConverter] = useState(false);

  const handleCreateSubmit = async (data: CreateOfferInput) => {
    await createOffer(data);
    setIsCreateOpen(false);
  };

  const handleEditSubmit = async (id: string, data: UpdateOfferInput) => {
    await updateOffer({ id, data });
    setIsEditOpen(false);
    setSelectedOffer(null);
  };

  const handleSubmitApprovalConfirm = async () => {
    if (!selectedOffer) return;
    await submitForApproval(selectedOffer.id);
    setIsSubmitOpen(false);
    setSelectedOffer(null);
  };

  const handleStatusConfirm = async () => {
    if (!selectedOffer || !statusTarget) return;
    await updateStatus({ id: selectedOffer.id, status: statusTarget });
    setIsStatusOpen(false);
    setSelectedOffer(null);
    setStatusTarget(null);
  };

  return (
    <div className="space-y-6">
      <StaffPageHeader
        title="Merchant Offers & Deals Curation"
        description="Curate verified discounts, manage merchant landing links, and submit deals for Super Admin approval."
        badge={
          <Badge variant="deal" className="text-xs">
            Offers Pipeline
          </Badge>
        }
        actions={
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowConverter((prev) => !prev)}
              className="gap-2"
            >
              <Link2 className="h-3.5 w-3.5" />
              <span>{showConverter ? "Hide Affiliate Tool" : "Affiliate Converter"}</span>
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => refetch()}
              disabled={isLoading}
              className="gap-2"
            >
              <RefreshCw className={`h-3.5 w-3.5 ${isLoading ? "animate-spin" : ""}`} />
              Refresh
            </Button>
            <Button
              size="sm"
              onClick={() => setIsCreateOpen(true)}
              className="gap-2"
            >
              <PlusCircle className="h-4 w-4" />
              New Offer
            </Button>
          </div>
        }
      />

      {/* Optional Affiliate Deep Link Converter */}
      {showConverter && (
        <div className="animate-in fade-in slide-in-from-top-2 duration-200">
          <LinkConverterCard />
        </div>
      )}

      {/* Filter Bar */}
      <OfferFilters
        params={params}
        onParamChange={setParams}
        isLoading={isLoading}
      />

      {/* Error Alert */}
      {isError && (
        <div className="rounded-lg border border-destructive/30 bg-destructive/10 p-4 text-xs text-destructive flex items-center gap-3">
          <AlertCircle className="h-5 w-5 shrink-0" />
          <div>
            <p className="font-semibold">Unable to load merchant offers</p>
            <p className="text-destructive/80">
              {(error as any)?.message || "A server or network error occurred."}
            </p>
          </div>
        </div>
      )}

      {/* Offers Table */}
      <OfferTable
        items={items}
        pagination={pagination}
        isLoading={isLoading}
        onPageChange={(page) => setParams({ ...params, page })}
        onView={(offer) => {
          setSelectedOffer(offer);
          setIsDetailOpen(true);
        }}
        onEdit={(offer) => {
          setSelectedOffer(offer);
          setIsEditOpen(true);
        }}
        onSubmitApproval={(offer) => {
          setSelectedOffer(offer);
          setIsSubmitOpen(true);
        }}
        onPause={(offer) => {
          setSelectedOffer(offer);
          setStatusTarget("PAUSED");
          setIsStatusOpen(true);
        }}
        onExpire={(offer) => {
          setSelectedOffer(offer);
          setStatusTarget("EXPIRED");
          setIsStatusOpen(true);
        }}
      />

      {/* Dialogs */}
      <CreateOfferDialog
        isOpen={isCreateOpen}
        onClose={() => setIsCreateOpen(false)}
        onSubmit={handleCreateSubmit}
        isCreating={isCreating}
        products={products}
      />

      <EditOfferDialog
        offer={selectedOffer}
        isOpen={isEditOpen}
        onClose={() => {
          setIsEditOpen(false);
          setSelectedOffer(null);
        }}
        onSubmit={handleEditSubmit}
        isUpdating={isUpdating}
      />

      <OfferDetailsDialog
        offerId={selectedOffer?.id || null}
        isOpen={isDetailOpen}
        onClose={() => {
          setIsDetailOpen(false);
          setSelectedOffer(null);
        }}
        onEditClick={() => {
          setIsDetailOpen(false);
          setIsEditOpen(true);
        }}
        onSubmitApprovalClick={() => {
          setIsDetailOpen(false);
          setIsSubmitOpen(true);
        }}
      />

      <SubmitApprovalDialog
        offer={selectedOffer}
        isOpen={isSubmitOpen}
        onClose={() => {
          setIsSubmitOpen(false);
          setSelectedOffer(null);
        }}
        onConfirm={handleSubmitApprovalConfirm}
        isSubmitting={isSubmitting}
      />

      <UpdateStatusDialog
        offer={selectedOffer}
        targetStatus={statusTarget}
        isOpen={isStatusOpen}
        onClose={() => {
          setIsStatusOpen(false);
          setSelectedOffer(null);
          setStatusTarget(null);
        }}
        onConfirm={handleStatusConfirm}
        isUpdating={isUpdatingStatus}
      />
    </div>
  );
}
