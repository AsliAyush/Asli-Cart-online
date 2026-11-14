"use client";

import React, { useState } from "react";
import { StaffPageHeader } from "@/components/layout/staff";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { RefreshCw, Compass, AlertCircle } from "lucide-react";
import {
  useProductDiscovery,
  DiscoveryFilters,
  DiscoveredItemCard,
  ImportProductDialog,
  DiscoveryEmptyState,
  type DiscoveredProductItem,
} from "@/modules/product_manager/discovery";

export default function ProductManagerDiscoveryPage() {
  const {
    items,
    isLoading,
    isError,
    error,
    filters,
    setFilters,
    importProduct,
    isImporting,
    refetch,
  } = useProductDiscovery();

  const [selectedItem, setSelectedItem] = useState<DiscoveredProductItem | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const handleOpenImport = (item: DiscoveredProductItem) => {
    setSelectedItem(item);
    setIsDialogOpen(true);
  };

  const handleConfirmImport = async () => {
    if (!selectedItem) return;
    try {
      await importProduct(selectedItem.externalId);
      setIsDialogOpen(false);
      setSelectedItem(null);
    } catch {
      // Toast error handled in hook
    }
  };

  return (
    <div className="space-y-6">
      <StaffPageHeader
        title="Product & Deal Discovery"
        description="Search active deals from integrated external discovery feeds and import them into the Asli Cart catalog."
        badge={
          <Badge variant="deal" className="text-xs">
            Discovery Feed
          </Badge>
        }
        actions={
          <Button
            variant="outline"
            size="sm"
            onClick={() => refetch()}
            disabled={isLoading}
            className="gap-2"
          >
            <RefreshCw className={`h-3.5 w-3.5 ${isLoading ? "animate-spin" : ""}`} />
            Refresh Feed
          </Button>
        }
      />

      {/* Discovery Search Filters */}
      <DiscoveryFilters
        filters={filters}
        onFilterChange={setFilters}
        isLoading={isLoading}
      />

      {/* Mock/Demo Feed Information Banner */}
      <div className="rounded-xl border border-amber-500/30 bg-amber-500/5 p-4 text-xs space-y-1.5">
        <div className="flex items-center gap-2 text-amber-600 font-semibold">
          <Compass className="h-4 w-4" />
          <span>Demo / Mock Discovery Engine Active</span>
        </div>
        <p className="text-muted-foreground leading-relaxed">
          The deals shown below are provided by the simulated discovery provider (<code>MockProductDiscoveryProvider</code>).
          They demonstrate the catalog ingestion and deal curation workflow. Mock results enter the catalog strictly in{" "}
          <strong>DRAFT</strong> status and cannot be published or displayed to customers without Super Admin review and approval.
        </p>
      </div>

      {/* Error Banner */}
      {isError && (
        <div className="rounded-lg border border-destructive/30 bg-destructive/10 p-4 text-xs text-destructive flex items-center gap-3">
          <AlertCircle className="h-5 w-5 shrink-0" />
          <div>
            <p className="font-semibold">Failed to fetch discovery feed</p>
            <p className="text-destructive/80">
              {(error as any)?.message || "A network or server error occurred."}
            </p>
          </div>
        </div>
      )}

      {/* Discovered Items Grid */}
      {isLoading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="rounded-xl border border-border p-4 space-y-3">
              <Skeleton className="aspect-[4/3] w-full rounded-lg" />
              <Skeleton className="h-4 w-3/4" />
              <Skeleton className="h-4 w-1/2" />
              <Skeleton className="h-8 w-full rounded-md" />
            </div>
          ))}
        </div>
      ) : items.length === 0 ? (
        <DiscoveryEmptyState
          onReset={() => setFilters({ keyword: undefined, category: undefined, merchant: undefined, limit: 20 })}
          keyword={filters.keyword}
        />
      ) : (
        <div className="space-y-3">
          <div className="flex items-center justify-between text-xs text-muted-foreground px-1">
            <span>
              Showing <strong>{items.length}</strong> deal{items.length === 1 ? "" : "s"} discovered
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {items.map((item) => (
              <DiscoveredItemCard
                key={item.externalId}
                item={item}
                onImportClick={handleOpenImport}
                isImporting={isImporting}
              />
            ))}
          </div>
        </div>
      )}

      {/* Import Confirmation Dialog */}
      <ImportProductDialog
        item={selectedItem}
        isOpen={isDialogOpen}
        onClose={() => {
          setIsDialogOpen(false);
          setSelectedItem(null);
        }}
        onConfirm={handleConfirmImport}
        isImporting={isImporting}
      />
    </div>
  );
}
