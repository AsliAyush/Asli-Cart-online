"use client";

import React, { useState } from "react";
import { StaffPageHeader } from "@/components/layout/staff";
import { Button } from "@/components/ui/button";
import {
  useProductsList,
  ProductTable,
  ProductFilters,
} from "@/modules/admin/products";
import { RefreshCw, Package } from "lucide-react";

export default function AdminProductsPage() {
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [categoryId, setCategoryId] = useState<string | undefined>(undefined);
  const [status, setStatus] = useState<string | undefined>(undefined);

  const limit = 10;

  const { data, isLoading, refetch, isFetching } = useProductsList({
    page,
    limit,
    search: search || undefined,
    categoryId: categoryId || undefined,
    status: status || undefined,
  });

  const handleResetFilters = () => {
    setSearch("");
    setCategoryId(undefined);
    setStatus(undefined);
    setPage(1);
  };

  const products = data?.items || [];
  const total = data?.pagination.total || 0;
  const totalPages = data?.pagination.totalPages || 1;

  return (
    <div className="space-y-6">
      <StaffPageHeader
        title="Master Product Catalog Oversight"
        description="Oversee centralized product catalog, inspect merchant deal associations, review price benchmarks, and manage product lifecycle."
        actions={
          <Button
            variant="outline"
            size="sm"
            onClick={() => refetch()}
            disabled={isFetching}
            className="text-xs h-8"
          >
            <RefreshCw className={`h-3.5 w-3.5 mr-1.5 ${isFetching ? "animate-spin" : ""}`} />
            Refresh Catalog
          </Button>
        }
      />

      {/* Product Filters */}
      <ProductFilters
        search={search}
        onSearchChange={(val) => {
          setSearch(val);
          setPage(1);
        }}
        categoryId={categoryId}
        onCategoryChange={(val) => {
          setCategoryId(val);
          setPage(1);
        }}
        status={status}
        onStatusChange={(val) => {
          setStatus(val);
          setPage(1);
        }}
        onReset={handleResetFilters}
      />

      {/* Product Table */}
      <ProductTable
        products={products}
        isLoading={isLoading}
        page={page}
        totalPages={totalPages}
        total={total}
        limit={limit}
        onPageChange={(newPage) => setPage(newPage)}
      />
    </div>
  );
}
