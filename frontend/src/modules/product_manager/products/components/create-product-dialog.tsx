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
  createProductFormSchema,
  type CreateProductFormValues,
} from "../validators";
import type { ProductCategorySummary, CreateProductInput } from "../types";

interface CreateProductDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: CreateProductInput) => Promise<void>;
  isCreating: boolean;
  categories: ProductCategorySummary[];
}

export function CreateProductDialog({
  isOpen,
  onClose,
  onSubmit,
  isCreating,
  categories,
}: CreateProductDialogProps) {
  const {
    register,
    handleSubmit,
    setValue,
    watch,
    reset,
    formState: { errors },
  } = useForm<CreateProductFormValues>({
    resolver: zodResolver(createProductFormSchema),
    defaultValues: {
      name: "",
      slug: "",
      brand: "",
      categoryId: "",
      mainImage: "",
      description: "",
      additionalImages: "",
    },
  });

  const selectedCategory = watch("categoryId");

  const handleFormSubmit = async (values: CreateProductFormValues) => {
    const additionalImagesArray = values.additionalImages
      ? values.additionalImages
          .split("\n")
          .map((url) => url.trim())
          .filter((url) => url.length > 0)
      : undefined;

    await onSubmit({
      name: values.name.trim(),
      slug: values.slug?.trim() || undefined,
      brand: values.brand?.trim() || undefined,
      categoryId: values.categoryId,
      mainImage: values.mainImage.trim(),
      description: values.description?.trim() || undefined,
      additionalImages: additionalImagesArray,
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
            <span>Create New Catalog Product</span>
          </DialogTitle>
          <DialogDescription className="text-xs">
            Creates a master product entry in <strong>DRAFT</strong> status. Once created, you can link merchant offers and price points.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-3.5 py-1 text-xs">
          <div className="space-y-1">
            <Label htmlFor="name" className="text-xs font-semibold">
              Product Title *
            </Label>
            <Input
              id="name"
              placeholder="e.g. Sony WH-1000XM5 Wireless Headphones"
              {...register("name")}
              className="h-8 text-xs"
            />
            {errors.name && (
              <p className="text-[11px] text-destructive">{errors.name.message}</p>
            )}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="space-y-1">
              <Label htmlFor="brand" className="text-xs font-semibold">
                Brand
              </Label>
              <Input
                id="brand"
                placeholder="e.g. Sony, Apple, Nike"
                {...register("brand")}
                className="h-8 text-xs"
              />
            </div>

            <div className="space-y-1">
              <Label htmlFor="category" className="text-xs font-semibold">
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
            <Label htmlFor="mainImage" className="text-xs font-semibold">
              Main Image URL *
            </Label>
            <Input
              id="mainImage"
              placeholder="https://images.example.com/products/headphones.jpg"
              {...register("mainImage")}
              className="h-8 text-xs"
            />
            {errors.mainImage && (
              <p className="text-[11px] text-destructive">{errors.mainImage.message}</p>
            )}
          </div>

          <div className="space-y-1">
            <Label htmlFor="slug" className="text-xs font-semibold">
              Custom Slug (optional)
            </Label>
            <Input
              id="slug"
              placeholder="e.g. sony-wh-1000xm5-black (leave blank to auto-generate)"
              {...register("slug")}
              className="h-8 text-xs font-mono"
            />
            {errors.slug && (
              <p className="text-[11px] text-destructive">{errors.slug.message}</p>
            )}
          </div>

          <div className="space-y-1">
            <Label htmlFor="description" className="text-xs font-semibold">
              Description (optional)
            </Label>
            <textarea
              id="description"
              rows={3}
              placeholder="Product summary, standout features, and warranty details..."
              {...register("description")}
              className="w-full rounded-md border border-input bg-transparent px-3 py-1.5 text-xs shadow-xs focus-visible:outline-hidden focus-visible:ring-1 focus-visible:ring-ring"
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
              <span>Create Product</span>
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

