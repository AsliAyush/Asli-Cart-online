"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  Store,
  ExternalLink,
  Trash2,
  AlertTriangle,
  ArrowUpRight,
  ShieldAlert,
  Loader2,
  TrendingDown,
  TrendingUp,
  Plus,
  Minus,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { formatCurrency } from "@/lib/utils";
import {
  useUpdateCartQuantity,
  useRemoveCartItem,
  useMerchantRedirect,
} from "../hooks/use-customer-cart";
import { AffiliateRedirectDialog } from "./affiliate-redirect-dialog";
import type { CartMerchantGroup, CustomerCartItem } from "../types";

interface CartMerchantGroupProps {
  group: CartMerchantGroup;
}

export function CartMerchantGroupCard({ group }: CartMerchantGroupProps) {
  const updateQuantityMutation = useUpdateCartQuantity();
  const removeItemMutation = useRemoveCartItem();
  const redirectMutation = useMerchantRedirect();

  const [selectedOfferForRedirect, setSelectedOfferForRedirect] = useState<{
    id: string;
    title: string;
    sellingPrice: number;
    merchant: {
      name: string;
      logoUrl?: string | null;
      websiteUrl?: string;
    };
  } | null>(null);

  const eligibleItems = group.items.filter((item) => item.isEligible);
  const hasIneligibleItems = group.items.some((item) => !item.isEligible);

  const handleProceedGroup = (item: CustomerCartItem) => {
    setSelectedOfferForRedirect({
      id: item.offerId,
      title: item.title,
      sellingPrice: item.currentSellingPrice,
      merchant: {
        name: group.merchant.name,
        logoUrl: group.merchant.logoUrl,
        websiteUrl: group.merchant.websiteUrl,
      },
    });
  };

  return (
    <Card className="border border-border/80 shadow-sm overflow-hidden">
      {/* Merchant Header Bar */}
      <CardHeader className="bg-secondary/40 border-b border-border/60 py-3.5 px-4 sm:px-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div className="flex items-center gap-3">
            {group.merchant.logoUrl ? (
              <img
                src={group.merchant.logoUrl}
                alt={group.merchant.name}
                className="h-8 w-8 rounded-lg object-contain bg-background border p-0.5"
              />
            ) : (
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10 text-primary font-bold text-xs">
                <Store className="h-4 w-4" />
              </div>
            )}
            <div>
              <CardTitle className="text-sm sm:text-base font-bold text-foreground">
                {group.merchant.name}
              </CardTitle>
              <p className="text-[11px] text-muted-foreground">
                {group.items.length} {group.items.length === 1 ? "deal saved" : "deals saved"}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3 self-end sm:self-auto">
            <div className="text-right">
              <span className="text-[10px] text-muted-foreground block uppercase font-medium">
                Store Subtotal
              </span>
              <span className="text-sm sm:text-base font-bold text-foreground">
                {formatCurrency(group.groupSubtotal)}
              </span>
            </div>
          </div>
        </div>
      </CardHeader>

      <CardContent className="p-4 sm:p-6 space-y-4">
        {/* Retailer Independence Notice */}
        <div className="flex items-start gap-2.5 rounded-lg border border-amber-500/20 bg-amber-500/5 p-3 text-[11px] text-muted-foreground">
          <AlertTriangle className="h-4 w-4 text-amber-500 shrink-0 mt-0.5" />
          <div>
            <span className="font-semibold text-foreground">Separate Merchant Checkout:</span>{" "}
            Orders on Asli Cart are fulfilled independently by each partner store. Use the store button next to each deal to complete your purchase on {group.merchant.name}.
          </div>
        </div>

        {/* Cart Item Rows */}
        <div className="divide-y divide-border/60">
          {group.items.map((item) => {
            const isPendingUpdate =
              updateQuantityMutation.isPending &&
              updateQuantityMutation.variables?.itemId === item.itemId;
            const isPendingRemove =
              removeItemMutation.isPending &&
              removeItemMutation.variables === item.itemId;

            return (
              <div
                key={item.itemId}
                className="py-4 first:pt-0 last:pb-0 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4"
              >
                {/* Product Thumbnail & Details */}
                <div className="flex items-start gap-3.5 flex-1 min-w-0">
                  <Link
                    href={`/products/${item.product.slug || item.product.id}`}
                    className="h-16 w-16 rounded-lg border border-border/80 bg-secondary/30 p-1 shrink-0 overflow-hidden flex items-center justify-center"
                  >
                    {item.product.mainImage ? (
                      <img
                        src={item.product.mainImage}
                        alt={item.product.name}
                        className="h-full w-full object-contain"
                      />
                    ) : (
                      <Store className="h-6 w-6 text-muted-foreground/60" />
                    )}
                  </Link>

                  <div className="space-y-1 min-w-0 flex-1">
                    <Link
                      href={`/products/${item.product.slug || item.product.id}`}
                      className="font-semibold text-xs sm:text-sm text-foreground hover:text-primary transition-colors line-clamp-1"
                    >
                      {item.product.name}
                    </Link>
                    <p className="text-xs text-muted-foreground line-clamp-1">
                      {item.title}
                    </p>

                    {/* Price Status & Change Notice */}
                    <div className="flex flex-wrap items-center gap-2 pt-0.5">
                      <span className="font-bold text-xs text-foreground">
                        {formatCurrency(item.currentSellingPrice)}
                      </span>

                      {item.hasPriceChanged && (
                        <Badge
                          variant="outline"
                          className={`text-[10px] py-0 px-1.5 flex items-center gap-1 ${
                            item.priceDifference > 0
                              ? "text-rose-600 border-rose-300"
                              : "text-emerald-600 border-emerald-300"
                          }`}
                        >
                          {item.priceDifference > 0 ? (
                            <>
                              <TrendingUp className="h-3 w-3" />
                              <span>Increased by {formatCurrency(item.priceDifference)}</span>
                            </>
                          ) : (
                            <>
                              <TrendingDown className="h-3 w-3" />
                              <span>Dropped by {formatCurrency(Math.abs(item.priceDifference))}</span>
                            </>
                          )}
                        </Badge>
                      )}

                      {!item.isEligible && (
                        <Badge
                          variant="outline"
                          className="text-[10px] text-destructive border-destructive/40 font-semibold"
                        >
                          {item.isExpired ? "Offer Expired" : "Out of Stock"}
                        </Badge>
                      )}
                    </div>
                  </div>
                </div>

                {/* Quantity & Actions */}
                <div className="flex items-center justify-between sm:justify-end gap-3 w-full sm:w-auto pt-2 sm:pt-0 border-t sm:border-t-0 border-border/40">
                  {/* Quantity Stepper */}
                  <div className="flex items-center border border-border/80 rounded-lg overflow-hidden bg-background">
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      className="h-7 w-7 rounded-none text-muted-foreground hover:text-foreground"
                      disabled={item.quantity <= 1 || isPendingUpdate || !item.isEligible}
                      onClick={() =>
                        updateQuantityMutation.mutate({
                          itemId: item.itemId,
                          quantity: item.quantity - 1,
                        })
                      }
                    >
                      <Minus className="h-3 w-3" />
                    </Button>
                    <span className="px-2.5 text-xs font-semibold text-foreground min-w-[28px] text-center">
                      {item.quantity}
                    </span>
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      className="h-7 w-7 rounded-none text-muted-foreground hover:text-foreground"
                      disabled={isPendingUpdate || !item.isEligible}
                      onClick={() =>
                        updateQuantityMutation.mutate({
                          itemId: item.itemId,
                          quantity: item.quantity + 1,
                        })
                      }
                    >
                      <Plus className="h-3 w-3" />
                    </Button>
                  </div>

                  {/* Item Subtotal */}
                  <div className="text-right min-w-[70px] hidden sm:block">
                    <span className="text-xs font-bold text-foreground">
                      {formatCurrency(item.itemSubtotal)}
                    </span>
                  </div>

                  {/* Proceed to Merchant button */}
                  <Button
                    size="sm"
                    className="h-8 text-xs font-semibold gap-1.5"
                    disabled={!item.isEligible}
                    onClick={() => handleProceedGroup(item)}
                  >
                    <span>Proceed to {group.merchant.name}</span>
                    <ArrowUpRight className="h-3.5 w-3.5" />
                  </Button>

                  {/* Remove Button */}
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 text-muted-foreground hover:text-destructive"
                    disabled={isPendingRemove}
                    onClick={() => removeItemMutation.mutate(item.itemId)}
                    title="Remove item"
                  >
                    {isPendingRemove ? (
                      <Loader2 className="h-3.5 w-3.5 animate-spin" />
                    ) : (
                      <Trash2 className="h-3.5 w-3.5" />
                    )}
                  </Button>
                </div>
              </div>
            );
          })}
        </div>
      </CardContent>

      {/* Outbound Redirect Modal */}
      <AffiliateRedirectDialog
        open={Boolean(selectedOfferForRedirect)}
        onOpenChange={(open) => {
          if (!open) setSelectedOfferForRedirect(null);
        }}
        offer={selectedOfferForRedirect}
      />
    </Card>
  );
}

