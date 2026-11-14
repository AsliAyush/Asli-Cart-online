import React from "react";
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
import { PlusCircle, Loader2 } from "lucide-react";
import {
  createOfferFormSchema,
  type CreateOfferFormValues,
} from "../validators";
import type { CreateOfferInput } from "../types";
import type { PMProductListItem } from "../../products/types";

interface CreateOfferDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: CreateOfferInput) => Promise<void>;
  isCreating: boolean;
  products: PMProductListItem[];
}

export function CreateOfferDialog({
  isOpen,
  onClose,
  onSubmit,
  isCreating,
  products,
}: CreateOfferDialogProps) {
  const {
    register,
    handleSubmit,
    setValue,
    watch,
    reset,
    formState: { errors },
  } = useForm<CreateOfferFormValues>({
    resolver: zodResolver(createOfferFormSchema),
    defaultValues: {
      productId: "",
      merchantId: "merchant_amazon",
      title: "",
      originalPrice: 1999,
      sellingPrice: 1499,
      currency: "INR",
      couponCode: "",
      originalUrl: "",
      availability: "IN_STOCK",
      priceSource: "manual",
    },
  });

  const selectedProductId = watch("productId");
  const selectedMerchant = watch("merchantId");
  const selectedAvailability = watch("availability");

  const onFormSubmit = async (values: CreateOfferFormValues) => {
    await onSubmit({
      productId: values.productId,
      merchantId: values.merchantId,
      title: values.title.trim(),
      originalPrice: Number(values.originalPrice),
      sellingPrice: Number(values.sellingPrice),
      currency: values.currency || "INR",
      couponCode: values.couponCode?.trim() || undefined,
      originalUrl: values.originalUrl.trim(),
      availability: values.availability,
      priceSource: values.priceSource || "manual",
    });

    reset();
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && !isCreating && onClose()}>
      <DialogContent className="sm:max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-base">
            <PlusCircle className="h-4 w-4 text-primary" />
            <span>Create New Merchant Offer</span>
          </DialogTitle>
          <DialogDescription className="text-xs">
            Draft a deal with benchmark prices and affiliate destination link. Starts in <strong>DRAFT</strong>.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(onFormSubmit)} className="space-y-3.5 py-1 text-xs">
          {/* Target Product */}
          <div className="space-y-1">
            <Label htmlFor="productId" className="text-xs font-semibold">
              Associated Catalog Product *
            </Label>
            <Select
              value={selectedProductId}
              onValueChange={(val) => setValue("productId", val, { shouldValidate: true })}
            >
              <SelectTrigger className="h-8 text-xs">
                <SelectValue placeholder="Select a product from catalog..." />
              </SelectTrigger>
              <SelectContent>
                {products.map((p) => (
                  <SelectItem key={p.id} value={p.id} className="text-xs">
                    {p.name} ({p.brand || "General"})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {errors.productId && (
              <p className="text-[11px] text-destructive">{errors.productId.message}</p>
            )}
          </div>

          {/* Offer Title */}
          <div className="space-y-1">
            <Label htmlFor="title" className="text-xs font-semibold">
              Offer Title *
            </Label>
            <Input
              id="title"
              placeholder="e.g. Amazon Great Freedom Festival - 25% Off"
              {...register("title")}
              className="h-8 text-xs"
            />
            {errors.title && (
              <p className="text-[11px] text-destructive">{errors.title.message}</p>
            )}
          </div>

          {/* Merchant and Availability */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="space-y-1">
              <Label htmlFor="merchantId" className="text-xs font-semibold">
                Store / Merchant ID *
              </Label>
              <Input
                id="merchantId"
                placeholder="e.g. merchant_amazon, merchant_flipkart"
                {...register("merchantId")}
                className="h-8 text-xs font-mono"
              />
              <p className="text-[10px] text-muted-foreground">
                Must match an existing registered merchant in the database. Validated by backend.
              </p>
              {errors.merchantId && (
                <p className="text-[11px] text-destructive">{errors.merchantId.message}</p>
              )}
            </div>

            <div className="space-y-1">
              <Label htmlFor="availability" className="text-xs font-semibold">
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

          {/* Pricing Row */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="space-y-1">
              <Label htmlFor="originalPrice" className="text-xs font-semibold">
                Original Price / MRP (₹) *
              </Label>
              <Input
                id="originalPrice"
                type="number"
                step="0.01"
                placeholder="2999"
                {...register("originalPrice")}
                className="h-8 text-xs font-mono"
              />
              {errors.originalPrice && (
                <p className="text-[11px] text-destructive">{errors.originalPrice.message}</p>
              )}
            </div>

            <div className="space-y-1">
              <Label htmlFor="sellingPrice" className="text-xs font-semibold">
                Selling Price (₹) *
              </Label>
              <Input
                id="sellingPrice"
                type="number"
                step="0.01"
                placeholder="1999"
                {...register("sellingPrice")}
                className="h-8 text-xs font-mono"
              />
              {errors.sellingPrice && (
                <p className="text-[11px] text-destructive">{errors.sellingPrice.message}</p>
              )}
            </div>
          </div>

          {/* Merchant Destination URL */}
          <div className="space-y-1">
            <Label htmlFor="originalUrl" className="text-xs font-semibold">
              Original Merchant Landing URL *
            </Label>
            <Input
              id="originalUrl"
              placeholder="https://www.amazon.in/dp/B09XS7JWHH"
              {...register("originalUrl")}
              className="h-8 text-xs"
            />
            {errors.originalUrl && (
              <p className="text-[11px] text-destructive">{errors.originalUrl.message}</p>
            )}
          </div>

          {/* Coupon Code */}
          <div className="space-y-1">
            <Label htmlFor="couponCode" className="text-xs font-semibold">
              Coupon Code (optional)
            </Label>
            <Input
              id="couponCode"
              placeholder="e.g. FREEDOM25, ASLI10"
              {...register("couponCode")}
              className="h-8 text-xs font-mono uppercase"
            />
          </div>

          <DialogFooter className="pt-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={onClose}
              disabled={isCreating}
            >
              Cancel
            </Button>
            <Button type="submit" size="sm" disabled={isCreating} className="gap-1.5">
              {isCreating && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
              <span>Create Draft Offer</span>
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

