import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ExternalLink, PlusCircle, CheckCircle, Store, Sparkles } from "lucide-react";
import type { DiscoveredProductItem } from "../types";

interface DiscoveredItemCardProps {
  item: DiscoveredProductItem;
  onImportClick: (item: DiscoveredProductItem) => void;
  isImporting: boolean;
}

export function DiscoveredItemCard({
  item,
  onImportClick,
  isImporting,
}: DiscoveredItemCardProps) {
  const savings = Math.max(0, item.originalPrice - item.sellingPrice);

  return (
    <Card className="overflow-hidden border-border hover:border-primary/50 transition-all flex flex-col justify-between group">
      <div>
        {/* Image & Store Header */}
        <div className="relative aspect-[4/3] w-full bg-muted/40 overflow-hidden flex items-center justify-center p-3 border-b">
          {item.imageUrl ? (
            <img
              src={item.imageUrl}
              alt={item.title}
              className="h-full w-full object-contain mix-blend-multiply group-hover:scale-105 transition-transform duration-300"
            />
          ) : (
            <div className="text-muted-foreground text-xs flex items-center gap-1">
              <Store className="h-6 w-6" />
            </div>
          )}

          <div className="absolute top-2 left-2 flex items-center gap-1">
            <Badge variant="secondary" className="text-[10px] bg-background/90 backdrop-blur shadow-xs font-semibold">
              {item.merchantName || item.merchantSlug.toUpperCase()}
            </Badge>
            <Badge variant="outline" className="text-[9px] bg-background/90 border-amber-300 text-amber-700">
              Demo Data
            </Badge>
          </div>

          {item.discountPercentage > 0 && (
            <div className="absolute top-2 right-2">
              <Badge variant="deal" className="text-[10px] font-bold shadow-xs">
                {item.discountPercentage}% OFF
              </Badge>
            </div>
          )}
        </div>

        {/* Product Details */}
        <CardContent className="p-4 space-y-2">
          <div className="flex items-center justify-between text-[11px] text-muted-foreground">
            <span className="font-semibold text-primary">{item.brand || "General"}</span>
            <span className="capitalize">{item.category || "Uncategorized"}</span>
          </div>

          <h3 className="font-semibold text-xs leading-snug text-foreground line-clamp-2" title={item.title}>
            {item.title}
          </h3>

          {/* Pricing Row */}
          <div className="pt-1 flex items-baseline gap-2">
            <span className="text-base font-bold text-foreground">
              ₹{item.sellingPrice.toLocaleString("en-IN")}
            </span>
            {item.originalPrice > item.sellingPrice && (
              <span className="text-xs text-muted-foreground line-through">
                ₹{item.originalPrice.toLocaleString("en-IN")}
              </span>
            )}
          </div>

          {savings > 0 && (
            <p className="text-[11px] text-emerald-600 font-medium">
              You save ₹{savings.toLocaleString("en-IN")} on this benchmark
            </p>
          )}

          {/* Key Specs Preview */}
          {item.specifications && Object.keys(item.specifications).length > 0 && (
            <div className="pt-1 flex flex-wrap gap-1">
              {Object.entries(item.specifications).slice(0, 2).map(([key, val]) => (
                <span
                  key={key}
                  className="rounded bg-secondary/70 px-1.5 py-0.5 text-[10px] text-muted-foreground"
                >
                  <strong className="text-foreground/80 capitalize">{key}:</strong> {String(val)}
                </span>
              ))}
            </div>
          )}
        </CardContent>
      </div>

      {/* Footer Actions */}
      <div className="p-4 pt-0 border-t mt-3 flex items-center justify-between gap-2">
        <a
          href={item.productUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="text-[11px] text-muted-foreground hover:text-foreground inline-flex items-center gap-1 font-medium transition-colors"
          title="Inspect external merchant listing"
        >
          <span>Merchant Link</span>
          <ExternalLink className="h-3 w-3" />
        </a>

        <Button
          size="sm"
          onClick={() => onImportClick(item)}
          disabled={isImporting}
          className="h-8 text-xs gap-1.5"
        >
          <PlusCircle className="h-3.5 w-3.5" />
          <span>Import to Catalog</span>
        </Button>
      </div>
    </Card>
  );
}

