import React from "react";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { TrendingDown, Calendar, Database, AlertCircle } from "lucide-react";
import type { PriceHistoryItem } from "../types";
import type { PMProductListItem } from "../../products/types";

interface PriceHistoryViewerProps {
  products: PMProductListItem[];
  isLoadingProducts: boolean;
  selectedProductId: string;
  onSelectProduct: (productId: string) => void;
  priceHistory: PriceHistoryItem[];
  isLoadingHistory: boolean;
  isErrorHistory: boolean;
}

export function PriceHistoryViewer({
  products,
  isLoadingProducts,
  selectedProductId,
  onSelectProduct,
  priceHistory,
  isLoadingHistory,
  isErrorHistory,
}: PriceHistoryViewerProps) {
  return (
    <Card className="border-border shadow-sm">
      <CardHeader className="pb-3 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <CardTitle className="text-base flex items-center gap-2">
            <TrendingDown className="h-4 w-4 text-amber-500" />
            <span>Product Price Tracker & Drop History</span>
          </CardTitle>
          <CardDescription className="text-xs">
            Inspect real historical price variations captured across merchant crawls.
          </CardDescription>
        </div>

        <div className="w-full sm:w-[240px]">
          <Select
            value={selectedProductId}
            onValueChange={onSelectProduct}
            disabled={isLoadingProducts}
          >
            <SelectTrigger className="h-8 text-xs">
              <SelectValue placeholder="Choose a product..." />
            </SelectTrigger>
            <SelectContent>
              {products.map((p) => (
                <SelectItem key={p.id} value={p.id} className="text-xs">
                  {p.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </CardHeader>

      <CardContent>
        {!selectedProductId ? (
          <div className="py-10 text-center text-xs text-muted-foreground space-y-1">
            <Database className="h-7 w-7 mx-auto text-muted-foreground/60 mb-2" />
            <p className="font-medium text-foreground">No product selected</p>
            <p>Select a product from the dropdown above to inspect historical price records.</p>
          </div>
        ) : isLoadingHistory ? (
          <div className="space-y-2 py-4">
            {Array.from({ length: 4 }).map((_, i) => (
              <Skeleton key={i} className="h-10 w-full" />
            ))}
          </div>
        ) : isErrorHistory ? (
          <div className="rounded-lg border border-destructive/20 bg-destructive/10 p-4 text-xs text-destructive flex items-center gap-2">
            <AlertCircle className="h-4 w-4" />
            <span>Failed to load price history for the selected product.</span>
          </div>
        ) : priceHistory.length === 0 ? (
          <div className="py-8 text-center text-xs text-muted-foreground space-y-1">
            <p className="font-semibold text-foreground">No Historical Records Yet</p>
            <p>Price points are automatically recorded whenever an offer is published or updated.</p>
          </div>
        ) : (
          <div className="space-y-3">
            <div className="rounded-lg border divide-y divide-border bg-card">
              {priceHistory.map((item) => (
                <div key={item.id} className="p-3 flex items-center justify-between text-xs">
                  <div className="flex items-center gap-3">
                    <div className="h-8 w-8 rounded-lg bg-secondary flex items-center justify-center text-muted-foreground shrink-0">
                      <Calendar className="h-4 w-4" />
                    </div>
                    <div>
                      <p className="font-semibold text-foreground">
                        ₹{Number(item.price).toLocaleString("en-IN")}{" "}
                        {item.originalPrice && (
                          <span className="text-[11px] font-normal text-muted-foreground line-through">
                            ₹{Number(item.originalPrice).toLocaleString("en-IN")}
                          </span>
                        )}
                      </p>
                      <p className="text-[11px] text-muted-foreground">
                        Source: {item.source || "Manual Entry"}
                      </p>
                    </div>
                  </div>

                  <div className="text-right">
                    {item.discountPercentage && (
                      <span className="text-xs font-bold text-emerald-600 block">
                        {item.discountPercentage}% OFF
                      </span>
                    )}
                    <span className="text-[10px] text-muted-foreground">
                      {new Date(item.recordedAt).toLocaleString("en-IN", {
                        dateStyle: "medium",
                        timeStyle: "short",
                      })}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

