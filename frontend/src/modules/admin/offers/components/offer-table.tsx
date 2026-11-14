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
import type { AdminOfferListItem } from "../types";
import { OfferDetailsDialog } from "./offer-details-dialog";
import { OfferStatusModal } from "./offer-status-modal";
import {
  MoreHorizontal,
  Eye,
  CheckCircle2,
  Clock,
  PauseCircle,
  Tag,
  ChevronLeft,
  ChevronRight,
  Link as LinkIcon,
} from "lucide-react";

interface OfferTableProps {
  offers: AdminOfferListItem[];
  isLoading: boolean;
  page: number;
  totalPages: number;
  total: number;
  limit: number;
  onPageChange: (newPage: number) => void;
}

export function OfferTable({
  offers,
  isLoading,
  page,
  totalPages,
  total,
  limit,
  onPageChange,
}: OfferTableProps) {
  const [selectedOfferId, setSelectedOfferId] = useState<string | null>(null);
  const [selectedOfferForStatus, setSelectedOfferForStatus] = useState<AdminOfferListItem | null>(null);
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);
  const [isStatusModalOpen, setIsStatusModalOpen] = useState(false);

  const handleOpenDetails = (id: string) => {
    setSelectedOfferId(id);
    setIsDetailsOpen(true);
  };

  const handleOpenStatusModal = (offer: AdminOfferListItem) => {
    setSelectedOfferForStatus(offer);
    setIsStatusModalOpen(true);
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "PUBLISHED":
        return <Badge className="bg-emerald-500/10 text-emerald-600 border-emerald-500/20 text-[10px]">Published</Badge>;
      case "PENDING_APPROVAL":
        return <Badge className="bg-amber-500/10 text-amber-600 border-amber-500/20 text-[10px]">Pending Review</Badge>;
      case "APPROVED":
        return <Badge className="bg-blue-500/10 text-blue-600 border-blue-500/20 text-[10px]">Approved</Badge>;
      case "DRAFT":
        return <Badge variant="secondary" className="text-[10px]">Draft</Badge>;
      case "PAUSED":
        return <Badge variant="outline" className="text-amber-600 text-[10px]">Paused</Badge>;
      case "EXPIRED":
        return <Badge variant="outline" className="text-muted-foreground text-[10px]">Expired</Badge>;
      case "REJECTED":
      default:
        return <Badge variant="destructive" className="text-[10px]">Rejected</Badge>;
    }
  };

  if (isLoading) {
    return (
      <div className="border rounded-lg bg-card overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Deal / Product</TableHead>
              <TableHead>Merchant</TableHead>
              <TableHead>Pricing</TableHead>
              <TableHead>Monetization</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="w-16 text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {Array.from({ length: 5 }).map((_, i) => (
              <TableRow key={i}>
                <TableCell>
                  <div className="space-y-1">
                    <Skeleton className="h-4 w-40" />
                    <Skeleton className="h-3 w-28" />
                  </div>
                </TableCell>
                <TableCell><Skeleton className="h-5 w-20" /></TableCell>
                <TableCell><Skeleton className="h-5 w-24" /></TableCell>
                <TableCell><Skeleton className="h-5 w-20" /></TableCell>
                <TableCell><Skeleton className="h-5 w-16" /></TableCell>
                <TableCell className="text-right"><Skeleton className="h-8 w-8 ml-auto" /></TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    );
  }

  if (offers.length === 0) {
    return (
      <div className="border border-dashed rounded-lg p-12 text-center bg-card">
        <Tag className="h-10 w-10 text-muted-foreground/50 mx-auto mb-3" />
        <h3 className="text-base font-semibold text-foreground">No merchant offers found</h3>
        <p className="text-xs text-muted-foreground mt-1 max-w-sm mx-auto">
          No merchant deals match the selected status filters. Adjust criteria or refresh.
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
              <TableHead>Deal & Target Product</TableHead>
              <TableHead>Merchant</TableHead>
              <TableHead>Selling Price</TableHead>
              <TableHead>Monetization</TableHead>
              <TableHead>Lifecycle Status</TableHead>
              <TableHead className="w-16 text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {offers.map((offer) => (
              <TableRow key={offer.id} className="hover:bg-muted/20">
                {/* Title & Product */}
                <TableCell>
                  <div className="min-w-0 max-w-xs space-y-0.5">
                    <p className="text-sm font-semibold text-foreground truncate">
                      {offer.title}
                    </p>
                    <p className="text-[11px] text-muted-foreground truncate">
                      Product: {offer.product?.name || "Catalog Product"}
                    </p>
                  </div>
                </TableCell>

                {/* Merchant */}
                <TableCell>
                  <Badge variant="outline" className="text-[11px] font-medium">
                    {offer.merchant?.name || "Merchant"}
                  </Badge>
                </TableCell>

                {/* Price & Discount */}
                <TableCell>
                  <div className="space-y-0.5">
                    <div className="text-sm font-bold text-foreground">
                      ₹{Number(offer.sellingPrice).toLocaleString()}
                    </div>
                    <div className="flex items-center gap-1.5 text-[11px]">
                      <span className="text-muted-foreground line-through">
                        ₹{Number(offer.originalPrice).toLocaleString()}
                      </span>
                      {Number(offer.discountPercentage) > 0 && (
                        <span className="font-semibold text-emerald-600">
                          {Number(offer.discountPercentage)}% OFF
                        </span>
                      )}
                    </div>
                  </div>
                </TableCell>

                {/* Monetization Status */}
                <TableCell>
                  {offer.affiliateUrl ? (
                    <span className="inline-flex items-center gap-1 text-[11px] font-medium text-emerald-600">
                      <LinkIcon className="h-3 w-3" />
                      Monetized
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1 text-[11px] text-muted-foreground">
                      Direct Link
                    </span>
                  )}
                </TableCell>

                {/* Status */}
                <TableCell>
                  {getStatusBadge(offer.status)}
                </TableCell>

                {/* Actions Menu */}
                <TableCell className="text-right">
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                        <MoreHorizontal className="h-4 w-4" />
                        <span className="sr-only">Open menu</span>
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-48 text-xs">
                      <DropdownMenuLabel className="text-xs font-normal text-muted-foreground">
                        Offer Governance
                      </DropdownMenuLabel>
                      <DropdownMenuItem onClick={() => handleOpenDetails(offer.id)}>
                        <Eye className="h-3.5 w-3.5 mr-2" />
                        Inspect Details
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem onClick={() => handleOpenStatusModal(offer)}>
                        <Clock className="h-3.5 w-3.5 mr-2" />
                        Review / Change Status
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>

        {/* Pagination Bar */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 p-3 border-t bg-muted/10 text-xs text-muted-foreground">
          <div>
            Showing {(page - 1) * limit + 1} to {Math.min(page * limit, total)} of {total} merchant deals
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

      <OfferDetailsDialog
        offerId={selectedOfferId}
        open={isDetailsOpen}
        onOpenChange={setIsDetailsOpen}
      />

      <OfferStatusModal
        offer={selectedOfferForStatus}
        open={isStatusModalOpen}
        onOpenChange={setIsStatusModalOpen}
      />
    </>
  );
}

