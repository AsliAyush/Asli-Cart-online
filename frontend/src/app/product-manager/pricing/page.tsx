"use client";

import React, { useState } from "react";
import { StaffPageHeader } from "@/components/layout/staff";
import { Badge } from "@/components/ui/badge";
import {
  usePMPricing,
  DiscountCalculatorCard,
  PriceHistoryViewer,
  OfferPricingTable,
  UpdatePricingDialog,
  type OfferPricingItem,
} from "@/modules/product_manager/pricing";

export default function ProductManagerPricingPage() {
  const {
    products,
    isLoadingProducts,
    selectedProductId,
    setSelectedProductId,
    priceHistory,
    isLoadingHistory,
    isErrorHistory,
    calculationResult,
    calculateDiscount,
    isCalculating,
    updateOfferPrice,
    isUpdatingPrice,
  } = usePMPricing();

  const [selectedOffer, setSelectedOffer] = useState<OfferPricingItem | null>(null);
  const [isUpdateOpen, setIsUpdateOpen] = useState(false);

  const handleEditPricing = (offer: OfferPricingItem) => {
    setSelectedOffer(offer);
    setIsUpdateOpen(true);
  };

  const handleUpdateSubmit = async (
    offerId: string,
    originalPrice: number,
    sellingPrice: number
  ) => {
    await updateOfferPrice({ offerId, originalPrice, sellingPrice });
    setIsUpdateOpen(false);
    setSelectedOffer(null);
  };

  return (
    <div className="space-y-6">
      <StaffPageHeader
        title="Pricing & Historical Benchmarks"
        description="Verify genuine discounts, audit price drops against inflated MRPs, and inspect historical trend records."
        badge={
          <Badge variant="deal" className="text-xs">
            Pricing Engine
          </Badge>
        }
      />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Real-time Discount & Savings Calculator */}
        <DiscountCalculatorCard
          onCalculate={calculateDiscount}
          isCalculating={isCalculating}
          result={calculationResult}
        />

        {/* Product Price History & Drop Tracker */}
        <PriceHistoryViewer
          products={products}
          isLoadingProducts={isLoadingProducts}
          selectedProductId={selectedProductId}
          onSelectProduct={setSelectedProductId}
          priceHistory={priceHistory}
          isLoadingHistory={isLoadingHistory}
          isErrorHistory={isErrorHistory}
        />
      </div>

      {/* Active Offer Price Points Table */}
      <OfferPricingTable onEditPricing={handleEditPricing} />

      {/* Update Offer Pricing Dialog */}
      <UpdatePricingDialog
        offer={selectedOffer}
        isOpen={isUpdateOpen}
        onClose={() => {
          setIsUpdateOpen(false);
          setSelectedOffer(null);
        }}
        onSubmit={handleUpdateSubmit}
        isUpdating={isUpdatingPrice}
      />
    </div>
  );
}
