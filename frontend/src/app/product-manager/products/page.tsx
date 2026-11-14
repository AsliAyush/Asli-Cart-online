"use client";

import React, { useState } from "react";
import { StaffPageHeader } from "@/components/layout/staff";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { PlusCircle, RefreshCw, AlertCircle } from "lucide-react";
import {
  usePMProducts,
  ProductFilters,
  ProductTable,
  CreateProductDialog,
  EditProductDialog,
  ProductDetailsDialog,
  ArchiveProductDialog,
  AssignSmmDialog,
  type PMProductListItem,
  type CreateProductInput,
  type UpdateProductInput,
} from "@/modules/product_manager/products";

export default function ProductManagerProductsPage() {
  const {
    items,
    pagination,
    isLoading,
    isError,
    error,
    params,
    setParams,
    categories,
    createProduct,
    isCreating,
    updateProduct,
    isUpdating,
    submitForApproval,
    archiveProduct,
    isArchiving,
    assignToSmm,
    isAssigningSmm,
    refetch,
  } = usePMProducts();

  // Dialog states
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<PMProductListItem | null>(null);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [isArchiveOpen, setIsArchiveOpen] = useState(false);
  const [isAssignSmmOpen, setIsAssignSmmOpen] = useState(false);

  const handleCreateSubmit = async (data: CreateProductInput) => {
    await createProduct(data);
    setIsCreateOpen(false);
  };

  const handleEditSubmit = async (id: string, data: UpdateProductInput) => {
    await updateProduct({ id, data });
    setIsEditOpen(false);
    setSelectedProduct(null);
  };

  const handleArchiveConfirm = async () => {
    if (!selectedProduct) return;
    await archiveProduct(selectedProduct.id);
    setIsArchiveOpen(false);
    setSelectedProduct(null);
  };

  const handleAssignSmmConfirm = async () => {
    if (!selectedProduct) return;
    await assignToSmm({
      id: selectedProduct.id,
      isAssigned: !selectedProduct.isAssignedToSmm,
    });
    setIsAssignSmmOpen(false);
    setSelectedProduct(null);
  };

  return (
    <div className="space-y-6">
      <StaffPageHeader
        title="Product Catalog Management"
        description="Maintain master products, benchmark specifications, and assign social media broadcast channels."
        badge={
          <Badge variant="deal" className="text-xs">
            Catalog
          </Badge>
        }
        actions={
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => refetch()}
              disabled={isLoading}
              className="gap-2"
            >
              <RefreshCw className={`h-3.5 w-3.5 ${isLoading ? "animate-spin" : ""}`} />
              Refresh
            </Button>
            <Button
              size="sm"
              onClick={() => setIsCreateOpen(true)}
              className="gap-2"
            >
              <PlusCircle className="h-4 w-4" />
              New Product
            </Button>
          </div>
        }
      />

      {/* Filters Bar */}
      <ProductFilters
        params={params}
        categories={categories}
        onParamChange={setParams}
        isLoading={isLoading}
      />

      {/* Error Alert */}
      {isError && (
        <div className="rounded-lg border border-destructive/30 bg-destructive/10 p-4 text-xs text-destructive flex items-center gap-3">
          <AlertCircle className="h-5 w-5 shrink-0" />
          <div>
            <p className="font-semibold">Unable to load products</p>
            <p className="text-destructive/80">
              {(error as any)?.message || "A server or network error occurred."}
            </p>
          </div>
        </div>
      )}

      {/* Product Table */}
      <ProductTable
        items={items}
        pagination={pagination}
        isLoading={isLoading}
        onPageChange={(page) => setParams({ ...params, page })}
        onView={(item) => {
          setSelectedProduct(item);
          setIsDetailOpen(true);
        }}
        onEdit={(item) => {
          setSelectedProduct(item);
          setIsEditOpen(true);
        }}
        onSubmitApproval={(item) => {
          submitForApproval(item.id);
        }}
        onAssignSmm={(item) => {
          setSelectedProduct(item);
          setIsAssignSmmOpen(true);
        }}
        onArchive={(item) => {
          setSelectedProduct(item);
          setIsArchiveOpen(true);
        }}
      />

      {/* Dialogs */}
      <CreateProductDialog
        isOpen={isCreateOpen}
        onClose={() => setIsCreateOpen(false)}
        onSubmit={handleCreateSubmit}
        isCreating={isCreating}
        categories={categories}
      />

      <EditProductDialog
        product={selectedProduct}
        isOpen={isEditOpen}
        onClose={() => {
          setIsEditOpen(false);
          setSelectedProduct(null);
        }}
        onSubmit={handleEditSubmit}
        isUpdating={isUpdating}
        categories={categories}
      />

      <ProductDetailsDialog
        productId={selectedProduct?.id || null}
        isOpen={isDetailOpen}
        onClose={() => {
          setIsDetailOpen(false);
          setSelectedProduct(null);
        }}
      />

      <ArchiveProductDialog
        product={selectedProduct}
        isOpen={isArchiveOpen}
        onClose={() => {
          setIsArchiveOpen(false);
          setSelectedProduct(null);
        }}
        onConfirm={handleArchiveConfirm}
        isArchiving={isArchiving}
      />

      <AssignSmmDialog
        product={selectedProduct}
        isOpen={isAssignSmmOpen}
        onClose={() => {
          setIsAssignSmmOpen(false);
          setSelectedProduct(null);
        }}
        onConfirm={handleAssignSmmConfirm}
        isAssigning={isAssigningSmm}
      />
    </div>
  );
}
