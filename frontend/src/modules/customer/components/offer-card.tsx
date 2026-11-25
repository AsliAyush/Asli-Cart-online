"use client";

import React, { useState } from "react";
import Link from "next/link";
import { Store, Tag, ExternalLink, ShieldCheck, ArrowRight } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { formatCurrency } from "@/lib/utils";
import { AffiliateRedirectDialog } from "./affiliate-redirect-dialog";
import type { CustomerOfferDetails } from "../types";

interface OfferCardProps {
  offer: {
    id: string;
    title: string;
    productName: string;
    brand?: string | null;
    mainImage?: string | null;
    merchantName: string;
    merchantLogo?: string | null;
    originalPrice: number;
    sellingPrice: number;
    discountPercentage: number;
    couponCode?: string | null;
  };
}

export function OfferCard({ offer }: OfferCardProps) {
  const [selectedForRedirect, setSelectedForRedirect] = useState<boolean>(false);
  const [hasImageError, setHasImageError] = useState<boolean>(false);

  return (
    <>
      <Card className="group flex flex-col overflow-hidden rounded-xl border border-border/80 bg-card transition-all duration-200 hover:-translate-y-1 hover:border-primary/40 hover:shadow-md">
        {/* Deal Thumbnail */}
        <div className="relative aspect-video w-full overflow-hidden bg-secondary/30 p-4 flex items-center justify-center">
          {offer.mainImage && !hasImageError ? (
            <img
              src={offer.mainImage}
              alt={offer.productName}
              className="h-full w-full object-contain transition-transform duration-300 group-hover:scale-105"
              loading="lazy"
              onError={() => setHasImageError(true)}
            />
          ) : (
            <div className="flex flex-col items-center justify-center text-muted-foreground/60 space-y-1">
              <Tag className="h-8 w-8" />
              <span className="text-[10px] font-medium text-muted-foreground/50">Deal Image</span>
            </div>
          )}

          {offer.discountPercentage > 0 && (
            <div className="absolute left-3 top-3">
              <Badge variant="deal" className="text-[11px] font-extrabold px-2 py-0.5 shadow-sm">
                {offer.discountPercentage}% OFF
              </Badge>
            </div>
          )}
        </div>

        {/* Content */}
        <CardContent className="flex flex-1 flex-col p-4 space-y-3">
          {/* Merchant & Brand */}
          <div className="flex items-center justify-between text-xs text-muted-foreground">
            <span className="font-semibold text-primary uppercase text-[11px]">
              {offer.brand || "Deal"}
            </span>
            <div className="flex items-center gap-1.5 font-medium text-foreground">
              <Store className="h-3.5 w-3.5 text-primary" />
              <span>{offer.merchantName}</span>
            </div>
          </div>

          {/* Titles */}
          <div className="space-y-1">
            <h4 className="font-semibold text-sm text-foreground line-clamp-1 group-hover:text-primary transition-colors">
              {offer.productName}
            </h4>
            <p className="text-xs text-muted-foreground line-clamp-2">
              {offer.title}
            </p>
          </div>

          {/* Pricing & Coupon */}
          <div className="mt-auto pt-3 border-t border-border/50 space-y-3">
            <div className="flex items-baseline justify-between">
              <div className="flex items-baseline gap-2">
                <span className="text-lg font-bold text-foreground">
                  {formatCurrency(offer.sellingPrice)}
                </span>
                {offer.originalPrice > offer.sellingPrice && (
                  <span className="text-xs text-muted-foreground line-through">
                    {formatCurrency(offer.originalPrice)}
                  </span>
                )}
              </div>

              {offer.couponCode && (
                <Badge variant="outline" className="text-[10px] font-mono border-dashed border-primary/50 text-primary">
                  {offer.couponCode}
                </Badge>
              )}
            </div>

            {/* Actions */}
            <div className="flex items-center gap-2 pt-1">
              <Button
                variant="outline"
                size="sm"
                asChild
                className="h-8 text-xs flex-1 gap-1"
              >
                <Link href={`/offers/${offer.id}`}>
                  <span>Details</span>
                  <ArrowRight className="h-3 w-3" />
                </Link>
              </Button>

              <Button
                size="sm"
                onClick={() => setSelectedForRedirect(true)}
                className="h-8 text-xs flex-1 gap-1 font-semibold"
              >
                <span>Store</span>
                <ExternalLink className="h-3 w-3" />
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      <AffiliateRedirectDialog
        open={selectedForRedirect}
        onOpenChange={setSelectedForRedirect}
        offer={{
          id: offer.id,
          title: offer.title,
          sellingPrice: offer.sellingPrice,
          merchant: { name: offer.merchantName },
        }}
      />
    </>
  );
}

