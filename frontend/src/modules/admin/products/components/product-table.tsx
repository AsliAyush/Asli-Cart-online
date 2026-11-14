"use client";

import React, { useState } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import type { AdminProductListItem } from "../types";
import { ProductDetailsDialog } from "./product-details-dialog";
import { useArchiveProduct } from "../hooks/use-admin-products";
import {
  MoreHorizontal,
  Eye,
  Archive,
  ChevronLeft,
  ChevronRight,
  Package,
} from "lucide-react";

interface ProductTableProps {
  products: AdminProductListItem[];
  isLoading: boolean;
  page: number;
  totalPages: number;
  total: number;
  limit: number;
  onPageChange: (newPage: number) => void;
}

export function ProductTable({
  products,
  isLoading,
  page,
  totalPages,
  total,
  limit,
  onPageChange,
}: ProductTableProps) {
  const [selectedProductId, setSelectedProductId] = useState<string | null>(null);
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);
  const archiveMutation = useArchiveProduct();

  const handleOpenDetails = (id: string) => {
    setSelectedProductId(id);
    setIsDetailsOpen(true);
  };

  const handleArchive = async (id: string) => {
    if (confirm("Are you sure you want to archive this product?")) {
      await archiveMutation.mutateAsync(id);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "APPROVED":
        return <Badge className="bg-emerald-500/10 text-emerald-600 border-emerald-500/20 text-[10px]">Approved</Badge>;
      case "PENDING_APPROVAL":
        return <Badge className="bg-amber-500/10 text-amber-600 border-amber-500/20 text-[10px]">Pending Review</Badge>;
      case "DRAFT":
        return <Badge variant="secondary" className="text-[10px]">Draft</Badge>;
      case "REJECTED":
        return <Badge variant="destructive" className="text-[10px]">Rejected</Badge>;
      case "ARCHIVED":
      default:
        return <Badge variant="outline" className="text-[10px]">Archived</Badge>;
    }
  };

  if (isLoading) {
    return (
      <div className="border rounded-lg bg-card overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Product</TableHead>
              <TableHead>Category</TableHead>
              <TableHead>Brand</TableHead>
              <TableHead>Offers</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Updated</TableHead>
              <TableHead className="w-16 text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {Array.from({ length: 5 }).map((_, i) => (
              <TableRow key={i}>
                <TableCell>
                  <div className="flex items-center gap-3">
                    <Skeleton className="h-10 w-10 rounded-md" />
                    <div className="space-y-1">
                      <Skeleton className="h-4 w-36" />
                      <Skeleton className="h-3 w-24" />
                    </div>
                  </div>
                </TableCell>
                <TableCell><Skeleton className="h-4 w-20" /></TableCell>
                <TableCell><Skeleton className="h-4 w-16" /></TableCell>
                <TableCell><Skeleton className="h-4 w-12" /></TableCell>
                <TableCell><Skeleton className="h-5 w-16" /></TableCell>
                <TableCell><Skeleton className="h-4 w-20" /></TableCell>
                <TableCell className="text-right"><Skeleton className="h-8 w-8 ml-auto" /></TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    );
  }

  if (products.length === 0) {
    return (
      <div className="border border-dashed rounded-lg p-12 text-center bg-card">
        <Package className="h-10 w-10 text-muted-foreground/50 mx-auto mb-3" />
        <h3 className="text-base font-semibold text-foreground">No catalog products match your search</h3>
        <p className="text-xs text-muted-foreground mt-1 max-w-sm mx-auto">
          Try adjusting your search criteria, category selection, or status filters.
        </p>
      </div>
    );
  }

  return (
    <>
      <div className="border rounded-lg bg-card overflow-hidden shadow-2xs">
        <Table>
          <TableHeader>
            <TableRow className="bg-muted/30">
              <TableHead>Product</TableHead>
              <TableHead>Category</TableHead>
              <TableHead>Brand</TableHead>
              <TableHead>Merchant Deals</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Last Updated</TableHead>
              <TableHead className="w-16 text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {products.map((product) => {
              const updatedDate = new Date(product.updatedAt || product.createdAt).toLocaleDateString(undefined, {
                month: "short",
                day: "numeric",
                year: "numeric",
              });

              return (
                <TableRow key={product.id} className="hover:bg-muted/20">
                  {/* Thumbnail & Name */}
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <div className="h-10 w-10 rounded-md border bg-muted/30 overflow-hidden shrink-0 flex items-center justify-center">
                        {product.mainImage ? (
                          <img
                            src={product.mainImage}
                            alt={product.name}
                            className="h-full w-full object-contain p-0.5"
                          />
                        ) : (
                          <Package className="h-5 w-5 text-muted-foreground/40" />
                        )}
                      </div>
                      <div className="min-w-0 max-w-xs">
                        <p className="text-sm font-semibold text-foreground truncate">
                          {product.name}
                        </p>
                        <p className="text-[11px] text-muted-foreground font-mono truncate">
                          {product.slug}
                        </p>
                      </div>
                    </div>
                  </TableCell>

                  {/* Category */}
                  <TableCell>
                    <Badge variant="outline" className="text-[11px]">
                      {product.category?.name || "Uncategorized"}
                    </Badge>
                  </TableCell>

                  {/* Brand */}
                  <TableCell className="text-xs text-foreground font-medium">
                    {product.brand || "—"}
                  </TableCell>

                  {/* Deals Count */}
                  <TableCell>
                    <Badge variant="secondary" className="text-[11px] font-mono">
                      {product._count?.offers || 0} deals
                    </Badge>
                  </TableCell>

                  {/* Status */}
                  <TableCell>
                    {getStatusBadge(product.status)}
                  </TableCell>

                  {/* Updated Date */}
                  <TableCell className="text-xs text-muted-foreground">
                    {updatedDate}
                  </TableCell>

                  {/* Action Menu */}
                  <TableCell className="text-right">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                          <MoreHorizontal className="h-4 w-4" />
                          <span className="sr-only">Open menu</span>
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end" className="w-44 text-xs">
                        <DropdownMenuLabel className="text-xs font-normal text-muted-foreground">
                          Product Actions
                        </DropdownMenuLabel>
                        <DropdownMenuItem onClick={() => handleOpenDetails(product.id)}>
                          <Eye className="h-3.5 w-3.5 mr-2" />
                          View Full Details
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem
                          onClick={() => handleArchive(product.id)}
                          className="text-destructive focus:text-destructive"
                        >
                          <Archive className="h-3.5 w-3.5 mr-2" />
                          Archive Product
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>

        {/* Pagination Bar */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 p-3 border-t bg-muted/10 text-xs text-muted-foreground">
          <div>
            Showing {(page - 1) * limit + 1} to {Math.min(page * limit, total)} of {total} products
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => onPageChange(page - 1)}
              disabled={page <= 1}
              className="h-8 text-xs px-2.5"
            >
              <ChevronLeft className="h-3.5 w-3.5 mr-1" />
              Previous
            </Button>
            <span className="px-2 font-medium text-foreground">
              Page {page} of {Math.max(1, totalPages)}
            </span>
            <Button
              variant="outline"
              size="sm"
              onClick={() => onPageChange(page + 1)}
              disabled={page >= totalPages}
              className="h-8 text-xs px-2.5"
            >
              Next
              <ChevronRight className="h-3.5 w-3.5 ml-1" />
            </Button>
          </div>
        </div>
      </div>

      <ProductDetailsDialog
        productId={selectedProductId}
        open={isDetailsOpen}
        onOpenChange={setIsDetailsOpen}
      />
    </>
  );
}

