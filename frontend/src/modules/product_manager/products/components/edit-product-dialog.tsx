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
import { editProductFormSchema, type EditProductFormValues } from "../validators";
import type { PMProductListItem, ProductCategorySummary, UpdateProductInput } from "../types";

interface EditProductDialogProps {
  product: PMProductListItem | null;
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (id: string, data: UpdateProductInput) => Promise<void>;
  isUpdating: boolean;
  categories: ProductCategorySummary[];
}

export function EditProductDialog({
  product,
  isOpen,
  onClose,
  onSubmit,
  isUpdating,
  categories,
}: EditProductDialogProps) {
  const {
    register,
    handleSubmit,
    setValue,
    watch,
    reset,
    formState: { errors },
  } = useForm<EditProductFormValues>({
    resolver: zodResolver(editProductFormSchema),
  });

  useEffect(() => {
    if (product) {
      reset({
        name: product.name,
        brand: product.brand || "",
        categoryId: product.categoryId,
        mainImage: product.mainImage,
        description: product.description || "",
        isAssignedToSmm: product.isAssignedToSmm,
      });
    }
  }, [product, reset]);

  const selectedCategory = watch("categoryId");

  const handleFormSubmit = async (values: EditProductFormValues) => {
    if (!product) return;

    await onSubmit(product.id, {
      name: values.name.trim(),
      brand: values.brand?.trim() || undefined,
      categoryId: values.categoryId,
      mainImage: values.mainImage.trim(),
      description: values.description?.trim() || undefined,
      isAssignedToSmm: values.isAssignedToSmm,
    });

    onClose();
  };

  if (!product) return null;

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && !isUpdating && onClose()}>
      <DialogContent className="sm:max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-base">
            <Edit className="h-4 w-4 text-primary" />
            <span>Edit Product</span>
          </DialogTitle>
          <DialogDescription className="text-xs">
            Update specifications, brand, category, or promotional description for &quot;{product.name}&quot;.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-3.5 py-1 text-xs">
          <div className="space-y-1">
            <Label htmlFor="edit-name" className="text-xs font-semibold">
              Product Title *
            </Label>
            <Input
              id="edit-name"
              {...register("name")}
              className="h-8 text-xs"
            />
            {errors.name && (
              <p className="text-[11px] text-destructive">{errors.name.message}</p>
            )}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="space-y-1">
              <Label htmlFor="edit-brand" className="text-xs font-semibold">
                Brand
              </Label>
              <Input
                id="edit-brand"
                {...register("brand")}
                className="h-8 text-xs"
              />
            </div>

            <div className="space-y-1">
              <Label htmlFor="edit-category" className="text-xs font-semibold">
                Category *
              </Label>
              <Select
                value={selectedCategory}
                onValueChange={(val) => setValue("categoryId", val, { shouldValidate: true })}
              >
                <SelectTrigger className="h-8 text-xs">
                  <SelectValue placeholder="Select a category" />
                </SelectTrigger>
                <SelectContent>
                  {categories.map((c) => (
                    <SelectItem key={c.id} value={c.id} className="text-xs">
                      {c.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.categoryId && (
                <p className="text-[11px] text-destructive">{errors.categoryId.message}</p>
              )}
            </div>
          </div>

          <div className="space-y-1">
            <Label htmlFor="edit-mainImage" className="text-xs font-semibold">
              Main Image URL *
            </Label>
            <Input
              id="edit-mainImage"
              {...register("mainImage")}
              className="h-8 text-xs"
            />
            {errors.mainImage && (
              <p className="text-[11px] text-destructive">{errors.mainImage.message}</p>
            )}
          </div>

          <div className="space-y-1">
            <Label htmlFor="edit-description" className="text-xs font-semibold">
              Description
            </Label>
            <textarea
              id="edit-description"
              rows={3}
              {...register("description")}
              className="w-full rounded-md border border-input bg-transparent px-3 py-1.5 text-xs shadow-xs focus-visible:outline-hidden focus-visible:ring-1 focus-visible:ring-ring"
            />
          </div>

          <div className="flex items-center gap-2 pt-1">
            <input
              type="checkbox"
              id="isAssignedToSmm"
              {...register("isAssignedToSmm")}
              className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary"
            />
            <Label htmlFor="isAssignedToSmm" className="text-xs font-medium cursor-pointer">
              Assign to Social Media Manager queue for broadcast
            </Label>
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

