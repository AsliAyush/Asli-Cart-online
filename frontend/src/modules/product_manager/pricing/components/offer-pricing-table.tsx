import React from "react";
import { useQuery } from "@tanstack/react-query";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Edit, CheckCircle2, ShieldCheck, Tag } from "lucide-react";
import { pmOfferService } from "../../offers/offer.service";
import type { OfferPricingItem } from "../types";

interface OfferPricingTableProps {
  onEditPricing: (offer: OfferPricingItem) => void;
}

export function OfferPricingTable({ onEditPricing }: OfferPricingTableProps) {
  const { data, isLoading } = useQuery({
    queryKey: ["pm", "offers", "pricing-table"],
    queryFn: () => pmOfferService.listOffers({ page: 1, limit: 10 }),
    staleTime: 30000,
  });

  const offers = (data?.items || []) as unknown as OfferPricingItem[];

  return (
    <div className="rounded-xl border border-border bg-card overflow-hidden shadow-sm">
      <div className="p-4 border-b flex items-center justify-between">
        <div>
          <h3 className="text-sm font-semibold text-foreground flex items-center gap-2">
            <Tag className="h-4 w-4 text-primary" />
            <span>Active Offer Price Points & Verification Benchmarks</span>
          </h3>
          <p className="text-xs text-muted-foreground">
            Audit selling prices, recorded verification timestamps, and price sources.
          </p>
        </div>
      </div>

      {isLoading ? (
        <div className="p-4 space-y-3">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-10 w-full" />
          ))}
        </div>
      ) : offers.length === 0 ? (
        <div className="py-10 text-center text-xs text-muted-foreground">
          No merchant offers currently available to display.
        </div>
      ) : (
        <Table>
          <TableHeader>
            <TableRow className="bg-muted/50 text-[11px] uppercase tracking-wider text-muted-foreground">
              <TableHead>Offer Title</TableHead>
              <TableHead>Store</TableHead>
              <TableHead>Original (MRP)</TableHead>
              <TableHead>Selling Price</TableHead>
              <TableHead>Discount %</TableHead>
              <TableHead>Verification Status</TableHead>
              <TableHead className="text-right">Action</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody className="text-xs divide-y divide-border">
            {offers.map((offer) => (
              <TableRow key={offer.id} className="hover:bg-muted/30 transition-colors">
                <TableCell className="max-w-[240px]">
                  <p className="font-semibold text-foreground truncate">{offer.title}</p>
                  <p className="text-[11px] text-muted-foreground truncate">
                    {offer.product?.name || "Product"}
                  </p>
                </TableCell>

                <TableCell>
                  <span className="font-medium">{offer.merchant?.name || "Merchant"}</span>
                </TableCell>

                <TableCell className="font-mono text-muted-foreground line-through">
                  ₹{Number(offer.originalPrice).toLocaleString("en-IN")}
                </TableCell>

                <TableCell className="font-mono font-bold text-foreground">
                  ₹{Number(offer.sellingPrice).toLocaleString("en-IN")}
                </TableCell>

                <TableCell>
                  <span className="font-bold text-emerald-600">
                    {offer.discountPercentage}% OFF
                  </span>
                </TableCell>

                <TableCell>
                  <div className="flex items-center gap-1.5 text-[11px] text-muted-foreground">
                    <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600 shrink-0" />
                    <span>
                      {offer.priceVerifiedAt
                        ? new Date(offer.priceVerifiedAt).toLocaleDateString()
                        : "Verified"}
                    </span>
                  </div>
                </TableCell>

                <TableCell className="text-right">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => onEditPricing(offer)}
                    className="h-7 text-xs gap-1"
                  >
                    <Edit className="h-3 w-3" />
                    <span>Update Price</span>
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      )}
    </div>
  );
}

