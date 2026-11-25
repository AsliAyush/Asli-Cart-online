import React from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Skeleton } from '@/components/ui/skeleton';
import {
  MoreHorizontal,
  Eye,
  RotateCw,
  ExternalLink,
  Link2,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  Clock,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';
import type { AffiliateOfferItem } from '../types';
import type { BackendPagination } from '@/types/api';

interface AffiliateLinksTableProps {
  items: AffiliateOfferItem[];
  pagination: BackendPagination;
  isLoading: boolean;
  onPageChange: (newPage: number) => void;
  onView: (item: AffiliateOfferItem) => void;
  onRetry: (item: AffiliateOfferItem) => void;
  retryingId?: string | null;
}

export function AffiliateLinksTable({
  items,
  pagination,
  isLoading,
  onPageChange,
  onView,
  onRetry,
  retryingId,
}: AffiliateLinksTableProps) {
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
          <Link2 className="h-6 w-6" />
        </div>
        <h3 className="font-semibold text-foreground text-sm">No Affiliate Links Found</h3>
        <p className="text-xs text-muted-foreground max-w-sm mx-auto">
          No offers matching the selected criteria were found.
        </p>
      </div>
    );
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'CONVERTED':
        return (
          <Badge variant="default" className="bg-emerald-600 text-white gap-1 text-[10px]">
            <CheckCircle2 className="h-3 w-3" />
            <span>CONVERTED</span>
          </Badge>
        );
      case 'NOT_AFFILIATED':
        return (
          <Badge variant="secondary" className="gap-1 text-[10px]">
            <XCircle className="h-3 w-3" />
            <span>NOT AFFILIATED</span>
          </Badge>
        );
      case 'FAILED':
        return (
          <Badge variant="destructive" className="gap-1 text-[10px]">
            <AlertTriangle className="h-3 w-3" />
            <span>FAILED</span>
          </Badge>
        );
      case 'PENDING':
      default:
        return (
          <Badge variant="outline" className="gap-1 text-[10px]">
            <Clock className="h-3 w-3" />
            <span>PENDING</span>
          </Badge>
        );
    }
  };

  return (
    <div className="rounded-xl border border-border bg-card overflow-hidden">
      <Table>
        <TableHeader>
          <TableRow className="hover:bg-transparent">
            <TableHead className="w-[260px]">Offer & Product</TableHead>
            <TableHead className="w-[140px]">Merchant</TableHead>
            <TableHead className="w-[130px]">Status</TableHead>
            <TableHead className="w-[110px]">Affiliated</TableHead>
            <TableHead>Tracking URL</TableHead>
            <TableHead className="w-[130px]">Last Attempt</TableHead>
            <TableHead className="w-[70px] text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {items.map((offer) => {
            const isRetrying = retryingId === offer.id;

            return (
              <TableRow key={offer.id}>
                <TableCell className="font-medium">
                  <div className="space-y-0.5">
                    <p className="font-semibold text-xs text-foreground truncate max-w-[240px]">
                      {offer.title}
                    </p>
                    {offer.product && (
                      <p className="text-[11px] text-muted-foreground truncate max-w-[240px]">
                        {offer.product.name}
                      </p>
                    )}
                  </div>
                </TableCell>

                <TableCell>
                  <span className="text-xs font-medium text-foreground">
                    {offer.merchant?.name || 'Unknown'}
                  </span>
                </TableCell>

                <TableCell>{getStatusBadge(offer.conversionStatus)}</TableCell>

                <TableCell>
                  {offer.isAffiliated ? (
                    <Badge variant="outline" className="text-emerald-600 border-emerald-300 text-[10px]">
                      Yes
                    </Badge>
                  ) : (
                    <Badge variant="outline" className="text-muted-foreground text-[10px]">
                      No
                    </Badge>
                  )}
                </TableCell>

                <TableCell className="max-w-[260px]">
                  {offer.affiliateUrl ? (
                    <div className="flex items-center gap-1.5 font-mono text-[11px] text-primary truncate">
                      <span className="truncate">{offer.affiliateUrl}</span>
                      <a
                        href={offer.affiliateUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="hover:text-primary/80 shrink-0"
                        title="Open tracking URL"
                      >
                        <ExternalLink className="h-3 w-3" />
                      </a>
                    </div>
                  ) : (
                    <span className="text-[11px] text-muted-foreground italic">
                      None (Fallback: original URL)
                    </span>
                  )}
                </TableCell>

                <TableCell className="text-muted-foreground text-xs whitespace-nowrap">
                  {offer.lastConvertedAt
                    ? new Date(offer.lastConvertedAt).toLocaleString()
                    : 'Never'}
                </TableCell>

                <TableCell className="text-right">
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon" className="h-8 w-8">
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-48 text-xs">
                      <DropdownMenuItem onClick={() => onView(offer)} className="gap-2">
                        <Eye className="h-3.5 w-3.5" />
                        <span>View Details</span>
                      </DropdownMenuItem>

                      <DropdownMenuItem
                        onClick={() => onRetry(offer)}
                        disabled={isRetrying}
                        className="gap-2 text-primary"
                      >
                        <RotateCw className={`h-3.5 w-3.5 ${isRetrying ? 'animate-spin' : ''}`} />
                        <span>Retry Conversion</span>
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>

      {/* Pagination controls */}
      <div className="flex items-center justify-between px-4 py-3 border-t border-border bg-card/50 text-xs">
        <span className="text-muted-foreground">
          Showing page {pagination.page} of {pagination.totalPages || 1} ({pagination.total} offers)
        </span>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => onPageChange(pagination.page - 1)}
            disabled={pagination.page <= 1}
            className="h-8 gap-1"
          >
            <ChevronLeft className="h-3.5 w-3.5" />
            Previous
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => onPageChange(pagination.page + 1)}
            disabled={pagination.page >= (pagination.totalPages || 1)}
            className="h-8 gap-1"
          >
            Next
            <ChevronRight className="h-3.5 w-3.5" />
          </Button>
        </div>
      </div>
    </div>
  );
}
