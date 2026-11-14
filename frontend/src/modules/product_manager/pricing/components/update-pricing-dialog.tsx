import React, { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { TrendingDown, Loader2 } from "lucide-react";
import {
  updateOfferPriceSchema,
  type UpdateOfferPriceValues,
} from "../validators";
import type { OfferPricingItem } from "../types";

interface UpdatePricingDialogProps {
  offer: OfferPricingItem | null;
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (offerId: string, originalPrice: number, sellingPrice: number) => Promise<void>;
  isUpdating: boolean;
}

export function UpdatePricingDialog({
  offer,
  isOpen,
  onClose,
  onSubmit,
  isUpdating,
}: UpdatePricingDialogProps) {
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<UpdateOfferPriceValues>({
    resolver: zodResolver(updateOfferPriceSchema),
  });

  useEffect(() => {
    if (offer) {
      reset({
        originalPrice: Number(offer.originalPrice),
        sellingPrice: Number(offer.sellingPrice),
      });
    }
  }, [offer, reset]);

  const onFormSubmit = async (values: UpdateOfferPriceValues) => {
    if (!offer) return;
    await onSubmit(offer.id, Number(values.originalPrice), Number(values.sellingPrice));
    onClose();
  };

  if (!offer) return null;

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && !isUpdating && onClose()}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-base">
            <TrendingDown className="h-4 w-4 text-primary" />
            <span>Update Deal Pricing</span>
          </DialogTitle>
          <DialogDescription className="text-xs">
            Adjust original price and current selling price for &quot;{offer.title}&quot;.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(onFormSubmit)} className="space-y-3.5 py-1 text-xs">
          <div className="space-y-1">
            <Label htmlFor="editOriginalPrice" className="text-xs font-semibold">
              Original Price / MRP (₹) *
            </Label>
            <Input
              id="editOriginalPrice"
              type="number"
              step="0.01"
              {...register("originalPrice")}
              className="h-8 text-xs font-mono"
            />
            {errors.originalPrice && (
              <p className="text-[11px] text-destructive">{errors.originalPrice.message}</p>
            )}
          </div>

          <div className="space-y-1">
            <Label htmlFor="editSellingPrice" className="text-xs font-semibold">
              Selling Price (₹) *
            </Label>
            <Input
              id="editSellingPrice"
              type="number"
              step="0.01"
              {...register("sellingPrice")}
              className="h-8 text-xs font-mono"
            />
            {errors.sellingPrice && (
              <p className="text-[11px] text-destructive">{errors.sellingPrice.message}</p>
            )}
          </div>

          <DialogFooter className="pt-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={onClose}
              disabled={isUpdating}
            >
              Cancel
            </Button>
            <Button type="submit" size="sm" disabled={isUpdating} className="gap-1.5">
              {isUpdating && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
              <span>Update Pricing</span>
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

