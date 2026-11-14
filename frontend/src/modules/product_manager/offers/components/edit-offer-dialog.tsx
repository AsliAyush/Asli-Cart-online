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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Edit, Loader2 } from "lucide-react";
import {
  editOfferFormSchema,
  type EditOfferFormValues,
} from "../validators";
import type { PMOfferListItem, UpdateOfferInput } from "../types";

interface EditOfferDialogProps {
  offer: PMOfferListItem | null;
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (id: string, data: UpdateOfferInput) => Promise<void>;
  isUpdating: boolean;
}

export function EditOfferDialog({
  offer,
  isOpen,
  onClose,
  onSubmit,
  isUpdating,
}: EditOfferDialogProps) {
  const {
    register,
    handleSubmit,
    setValue,
    watch,
    reset,
    formState: { errors },
  } = useForm<EditOfferFormValues>({
    resolver: zodResolver(editOfferFormSchema),
  });

  useEffect(() => {
    if (offer) {
      reset({
        title: offer.title,
        originalPrice: Number(offer.originalPrice),
        sellingPrice: Number(offer.sellingPrice),
        couponCode: offer.couponCode || "",
        originalUrl: offer.originalUrl,
        availability: offer.availability as any,
      });
    }
  }, [offer, reset]);

  const selectedAvailability = watch("availability");

  const onFormSubmit = async (values: EditOfferFormValues) => {
    if (!offer) return;
    await onSubmit(offer.id, {
      title: values.title?.trim() || undefined,
      originalPrice: values.originalPrice !== undefined ? Number(values.originalPrice) : undefined,
      sellingPrice: values.sellingPrice !== undefined ? Number(values.sellingPrice) : undefined,
      couponCode: values.couponCode?.trim() || undefined,
      originalUrl: values.originalUrl?.trim() || undefined,
      availability: values.availability,
    });
    onClose();
  };

  if (!offer) return null;

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && !isUpdating && onClose()}>
      <DialogContent className="sm:max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-base">
            <Edit className="h-4 w-4 text-primary" />
            <span>Edit Offer</span>
          </DialogTitle>
          <DialogDescription className="text-xs">
            Modify title, price, or affiliate URL for &quot;{offer.title}&quot;.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(onFormSubmit)} className="space-y-3.5 py-1 text-xs">
          <div className="space-y-1">
            <Label htmlFor="editOfferTitle" className="text-xs font-semibold">
              Offer Title
            </Label>
            <Input
              id="editOfferTitle"
              {...register("title")}
              className="h-8 text-xs"
            />
            {errors.title && (
              <p className="text-[11px] text-destructive">{errors.title.message}</p>
            )}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="space-y-1">
              <Label htmlFor="editOriginalPrice" className="text-xs font-semibold">
                Original Price / MRP (₹)
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
                Selling Price (₹)
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
          </div>

          <div className="space-y-1">
            <Label htmlFor="editOriginalUrl" className="text-xs font-semibold">
              Original Merchant Landing URL
            </Label>
            <Input
              id="editOriginalUrl"
              {...register("originalUrl")}
              className="h-8 text-xs"
            />
            {errors.originalUrl && (
              <p className="text-[11px] text-destructive">{errors.originalUrl.message}</p>
            )}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="space-y-1">
              <Label htmlFor="editCoupon" className="text-xs font-semibold">
                Coupon Code
              </Label>
              <Input
                id="editCoupon"
                {...register("couponCode")}
                className="h-8 text-xs font-mono uppercase"
              />
            </div>

            <div className="space-y-1">
              <Label htmlFor="editAvailability" className="text-xs font-semibold">
                Availability
              </Label>
              <Select
                value={selectedAvailability}
                onValueChange={(val: any) => setValue("availability", val)}
              >
                <SelectTrigger className="h-8 text-xs">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="IN_STOCK">IN_STOCK</SelectItem>
                  <SelectItem value="OUT_OF_STOCK">OUT_OF_STOCK</SelectItem>
                  <SelectItem value="PRE_ORDER">PRE_ORDER</SelectItem>
                </SelectContent>
              </Select>
            </div>
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
              <span>Save Changes</span>
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

