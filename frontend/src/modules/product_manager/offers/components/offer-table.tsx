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
  PauseCircle,
  Clock,
  AlertCircle,
  ChevronLeft,
  ChevronRight,
  Tag,
  ExternalLink,
} from "lucide-react";
import type { PMOfferListItem } from "../types";
import type { BackendPagination } from "@/types/api";

interface OfferTableProps {
  items: PMOfferListItem[];
  pagination: BackendPagination;
  isLoading: boolean;
  onPageChange: (newPage: number) => void;
  onView: (item: PMOfferListItem) => void;
  onEdit: (item: PMOfferListItem) => void;
  onSubmitApproval: (item: PMOfferListItem) => void;
  onPause: (item: PMOfferListItem) => void;
  onExpire: (item: PMOfferListItem) => void;
}

export function OfferTable({
  items,
  pagination,
  isLoading,
  onPageChange,
  onView,
  onEdit,
  onSubmitApproval,
  onPause,
  onExpire,
}: OfferTableProps) {
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
          <Tag className="h-6 w-6" />
        </div>
        <h3 className="text-base font-semibold text-foreground">No Offers Found</h3>
        <p className="text-xs text-muted-foreground max-w-sm mx-auto">
          No merchant offers match the specified filters. Create a new offer or import from Product Discovery.
        </p>
      </div>
    );
  }

  return (
    <div className="rounded-xl border border-border bg-card overflow-hidden shadow-sm">
      <Table>
        <TableHeader>
          <TableRow className="bg-muted/50 text-[11px] uppercase tracking-wider text-muted-foreground">
            <TableHead>Offer Title & Product</TableHead>
            <TableHead>Store</TableHead>
            <TableHead>Original (MRP)</TableHead>
            <TableHead>Selling Price</TableHead>
            <TableHead>Discount %</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Affiliate</TableHead>
            <TableHead>Notes</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody className="text-xs divide-y divide-border">
          {items.map((offer) => {
            const canSubmit = offer.status === "DRAFT" || offer.status === "REJECTED";
            const canPauseOrExpire = offer.status === "PUBLISHED";
            const isRejected = offer.status === "REJECTED";

            return (
              <TableRow key={offer.id} className="hover:bg-muted/30 transition-colors">
                <TableCell className="max-w-[260px]">
                  <p className="font-semibold text-foreground line-clamp-1">{offer.title}</p>
                  <p className="text-[11px] text-muted-foreground truncate">
                    Product: {offer.product?.name || "—"}
                  </p>
                </TableCell>

                <TableCell>
                  <span className="font-medium">{offer.merchant?.name || "Merchant"}</span>
                </TableCell>

                <TableCell className="font-mono text-muted-foreground line-through">
                  ₹{Number(offer.originalPrice).toLocaleString("en-IN")}
                </TableCell>

                <TableCell className="font-mono font-bold text-foreground">
                  ₹{Number(offer.sellingPrice).toLocaleString("en-IN")}
                </TableCell>

                <TableCell>
                  <span className="font-bold text-emerald-600">
                    {offer.discountPercentage}% OFF
                  </span>
                </TableCell>

                <TableCell>
                  <Badge
                    variant={
                      offer.status === "PUBLISHED"
                        ? "deal"
                        : offer.status === "APPROVED"
                        ? "default"
                        : offer.status === "PENDING_APPROVAL"
                        ? "outline"
                        : offer.status === "REJECTED"
                        ? "destructive"
                        : offer.status === "PAUSED"
                        ? "outline"
                        : "secondary"
                    }
                    className="text-[10px]"
                  >
                    {offer.status}
                  </Badge>
                </TableCell>

                <TableCell>
                  <Badge
                    variant={
                      offer.conversionStatus === "CONVERTED"
                        ? "default"
                        : offer.conversionStatus === "FAILED"
                        ? "destructive"
                        : "secondary"
                    }
                    className="text-[10px]"
                  >
                    {offer.conversionStatus || "PENDING"}
                  </Badge>
                </TableCell>

                <TableCell className="max-w-[180px]">
                  {isRejected && offer.rejectionReason ? (
                    <span
                      className="text-[11px] text-destructive flex items-center gap-1 font-medium truncate"
                      title={offer.rejectionReason}
                    >
                      <AlertCircle className="h-3 w-3 shrink-0" />
                      <span>{offer.rejectionReason}</span>
                    </span>
                  ) : (
                    <span className="text-[11px] text-muted-foreground">
                      {offer.availability || "In Stock"}
                    </span>
                  )}
                </TableCell>

                <TableCell className="text-right">
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon" className="h-8 w-8">
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-52 text-xs">
                      <DropdownMenuItem onClick={() => onView(offer)} className="gap-2">
                        <Eye className="h-3.5 w-3.5" />
                        <span>View Details</span>
                      </DropdownMenuItem>

                      <DropdownMenuItem onClick={() => onEdit(offer)} className="gap-2">
                        <Edit className="h-3.5 w-3.5" />
                        <span>Edit Offer</span>
                      </DropdownMenuItem>

                      {canSubmit && (
                        <DropdownMenuItem
                          onClick={() => onSubmitApproval(offer)}
                          className="gap-2 text-purple-600 focus:text-purple-600"
                        >
                          <Send className="h-3.5 w-3.5" />
                          <span>Submit for Admin Approval</span>
                        </DropdownMenuItem>
                      )}

                      {canPauseOrExpire && (
                        <>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem onClick={() => onPause(offer)} className="gap-2 text-amber-600">
                            <PauseCircle className="h-3.5 w-3.5" />
                            <span>Pause Live Offer</span>
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => onExpire(offer)} className="gap-2 text-muted-foreground">
                            <Clock className="h-3.5 w-3.5" />
                            <span>Expire Offer</span>
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
          <strong>{pagination.totalPages || 1}</strong> ({pagination.total} total offers)
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
