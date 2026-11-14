import React from "react";
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
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Skeleton } from "@/components/ui/skeleton";
import {
  MoreHorizontal,
  Eye,
  Edit,
  Send,
  Share2,
  Archive,
  ChevronLeft,
  ChevronRight,
  Package,
} from "lucide-react";
import type { PMProductListItem } from "../types";
import type { BackendPagination } from "@/types/api";

interface ProductTableProps {
  items: PMProductListItem[];
  pagination: BackendPagination;
  isLoading: boolean;
  onPageChange: (newPage: number) => void;
  onView: (item: PMProductListItem) => void;
  onEdit: (item: PMProductListItem) => void;
  onSubmitApproval: (item: PMProductListItem) => void;
  onAssignSmm: (item: PMProductListItem) => void;
  onArchive: (item: PMProductListItem) => void;
}

export function ProductTable({
  items,
  pagination,
  isLoading,
  onPageChange,
  onView,
  onEdit,
  onSubmitApproval,
  onAssignSmm,
  onArchive,
}: ProductTableProps) {
  if (isLoading) {
    return (
      <div className="rounded-xl border border-border bg-card p-4 space-y-3">
        <div className="space-y-2">
          {Array.from({ length: 6 }).map((_, i) => (
            <Skeleton key={i} className="h-14 w-full rounded-md" />
          ))}
        </div>
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className="rounded-xl border border-border bg-card p-12 text-center space-y-3">
        <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-muted text-muted-foreground">
          <Package className="h-6 w-6" />
        </div>
        <h3 className="text-base font-semibold text-foreground">No Products Found</h3>
        <p className="text-xs text-muted-foreground max-w-sm mx-auto">
          No catalog items match your search or filter parameters. Create a new product or import items via Product Discovery.
        </p>
      </div>
    );
  }

  return (
    <div className="rounded-xl border border-border bg-card overflow-hidden shadow-sm">
      <Table>
        <TableHeader>
          <TableRow className="bg-muted/50 text-[11px] uppercase tracking-wider text-muted-foreground">
            <TableHead className="w-[80px]">Image</TableHead>
            <TableHead>Product Name & Slug</TableHead>
            <TableHead>Category</TableHead>
            <TableHead>Brand</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Social (SMM)</TableHead>
            <TableHead className="text-center">Offers</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody className="text-xs divide-y divide-border">
          {items.map((prod) => {
            const canSubmit = prod.status === "DRAFT" || prod.status === "REJECTED";
            const isArchived = prod.status === "ARCHIVED";

            return (
              <TableRow key={prod.id} className="hover:bg-muted/30 transition-colors">
                <TableCell>
                  {prod.mainImage ? (
                    <img
                      src={prod.mainImage}
                      alt={prod.name}
                      className="h-10 w-10 rounded-md object-contain border bg-white p-0.5"
                    />
                  ) : (
                    <div className="h-10 w-10 rounded-md bg-muted flex items-center justify-center text-muted-foreground">
                      <Package className="h-4 w-4" />
                    </div>
                  )}
                </TableCell>

                <TableCell className="max-w-[280px]">
                  <p className="font-semibold text-foreground line-clamp-1">{prod.name}</p>
                  <p className="text-[11px] text-muted-foreground font-mono truncate">{prod.slug}</p>
                </TableCell>

                <TableCell>
                  <span className="capitalize">{prod.category?.name || "—"}</span>
                </TableCell>

                <TableCell>
                  <span className="font-medium text-muted-foreground">{prod.brand || "—"}</span>
                </TableCell>

                <TableCell>
                  <Badge
                    variant={
                      prod.status === "APPROVED"
                        ? "deal"
                        : prod.status === "PENDING_APPROVAL"
                        ? "outline"
                        : prod.status === "REJECTED"
                        ? "destructive"
                        : prod.status === "ARCHIVED"
                        ? "outline"
                        : "secondary"
                    }
                    className="text-[10px]"
                  >
                    {prod.status}
                  </Badge>
                </TableCell>

                <TableCell>
                  {prod.isAssignedToSmm ? (
                    <Badge
                      variant="deal"
                      className="text-[10px] gap-1 cursor-help"
                      title="Queued for Social Media broadcast - SMM module deferred"
                    >
                      <Share2 className="h-2.5 w-2.5" />
                      Queued for SMM
                    </Badge>
                  ) : (
                    <span className="text-[11px] text-muted-foreground">Unassigned</span>
                  )}
                </TableCell>

                <TableCell className="text-center font-semibold">
                  {prod._count?.offers ?? 0}
                </TableCell>

                <TableCell className="text-right">
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon" className="h-8 w-8">
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-48 text-xs">
                      <DropdownMenuItem onClick={() => onView(prod)} className="gap-2">
                        <Eye className="h-3.5 w-3.5" />
                        <span>View Details</span>
                      </DropdownMenuItem>

                      {!isArchived && (
                        <DropdownMenuItem onClick={() => onEdit(prod)} className="gap-2">
                          <Edit className="h-3.5 w-3.5" />
                          <span>Edit Product</span>
                        </DropdownMenuItem>
                      )}

                      {canSubmit && (
                        <DropdownMenuItem onClick={() => onSubmitApproval(prod)} className="gap-2 text-purple-600">
                          <Send className="h-3.5 w-3.5" />
                          <span>Submit for Approval</span>
                        </DropdownMenuItem>
                      )}

                      {!isArchived && (
                        <DropdownMenuItem onClick={() => onAssignSmm(prod)} className="gap-2">
                          <Share2 className="h-3.5 w-3.5" />
                          <span>
                            {prod.isAssignedToSmm ? "Unassign from SMM" : "Assign to SMM"}
                          </span>
                        </DropdownMenuItem>
                      )}

                      {!isArchived && (
                        <>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem
                            onClick={() => onArchive(prod)}
                            className="gap-2 text-destructive focus:text-destructive"
                          >
                            <Archive className="h-3.5 w-3.5" />
                            <span>Archive Product</span>
                          </DropdownMenuItem>
                        </>
                      )}
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>

      {/* Pagination Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 p-4 border-t bg-muted/20 text-xs text-muted-foreground">
        <div>
          Showing page <strong>{pagination.page}</strong> of{" "}
          <strong>{pagination.totalPages || 1}</strong> ({pagination.total} total products)
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => onPageChange(pagination.page - 1)}
            disabled={pagination.page <= 1}
            className="h-8 px-2.5 gap-1"
          >
            <ChevronLeft className="h-3.5 w-3.5" />
            <span>Previous</span>
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => onPageChange(pagination.page + 1)}
            disabled={pagination.page >= pagination.totalPages}
            className="h-8 px-2.5 gap-1"
          >
            <span>Next</span>
            <ChevronRight className="h-3.5 w-3.5" />
          </Button>
        </div>
      </div>
    </div>
  );
}
