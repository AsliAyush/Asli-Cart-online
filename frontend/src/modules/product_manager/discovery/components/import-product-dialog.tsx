import React from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Sparkles, Loader2 } from "lucide-react";
import type { DiscoveredProductItem } from "../types";

interface ImportProductDialogProps {
  item: DiscoveredProductItem | null;
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => Promise<void>;
  isImporting: boolean;
}

export function ImportProductDialog({
  item,
  isOpen,
  onClose,
  onConfirm,
  isImporting,
}: ImportProductDialogProps) {
  if (!item) return null;

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && !isImporting && onClose()}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-base">
            <Sparkles className="h-4 w-4 text-primary" />
            <span>Import Discovered Deal to Catalog</span>
          </DialogTitle>
          <DialogDescription className="text-xs">
            This will ingest the merchant listing as a new <strong>DRAFT</strong> Product and
            corresponding initial <strong>DRAFT</strong> Merchant Offer.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-3 py-2 text-xs">
          <div className="flex gap-3 items-center p-3 rounded-lg bg-secondary/40 border">
            {item.imageUrl && (
              <img
                src={item.imageUrl}
                alt={item.title}
                className="h-12 w-12 rounded object-contain shrink-0 bg-white p-1"
              />
            )}
            <div className="min-w-0 space-y-1">
              <p className="font-semibold text-foreground line-clamp-1">{item.title}</p>
              <div className="flex items-center gap-2 text-[11px] text-muted-foreground">
                <Badge variant="outline" className="text-[10px] px-1.5 py-0">
                  {item.merchantName || item.merchantSlug}
                </Badge>
                <span>Category: {item.category || "General"}</span>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-2 text-xs">
            <div className="rounded border p-2 space-y-0.5">
              <span className="text-muted-foreground block text-[11px]">Selling Price</span>
              <span className="font-bold text-foreground">₹{item.sellingPrice.toLocaleString("en-IN")}</span>
            </div>
            <div className="rounded border p-2 space-y-0.5">
              <span className="text-muted-foreground block text-[11px]">Discount</span>
              <span className="font-bold text-emerald-600">{item.discountPercentage}% OFF</span>
            </div>
          </div>

          <div className="rounded-lg bg-amber-500/10 p-3 text-[11px] text-amber-800 dark:text-amber-300 border border-amber-500/20 space-y-1">
            <p className="font-semibold mb-0.5">Demo Ingestion Safety Notice</p>
            <p>
              This item originates from the demonstration discovery provider. It will be imported strictly in <strong>DRAFT</strong> status. As per platform security policy, mock items cannot be published directly and must be verified against actual merchant listings.
            </p>
          </div>
        </div>

        <DialogFooter className="gap-2 sm:gap-0">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={onClose}
            disabled={isImporting}
          >
            Cancel
          </Button>
          <Button
            type="button"
            size="sm"
            onClick={onConfirm}
            disabled={isImporting}
            className="gap-1.5"
          >
            {isImporting && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
            <span>Confirm Import</span>
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

