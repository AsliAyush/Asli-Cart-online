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
import { Skeleton } from '@/components/ui/skeleton';
import {
  Eye,
  ChevronLeft,
  ChevronRight,
  Clock,
  CheckCircle2,
  XCircle,
  CreditCard,
  CheckCheck,
} from 'lucide-react';
import type { CuelinksTransactionItem } from '../types';
import type { BackendPagination } from '@/types/api';
import { formatAffiliateCurrency } from '../utils/currency';

interface TransactionsTableProps {
  items: CuelinksTransactionItem[];
  pagination: BackendPagination;
  isLoading: boolean;
  onPageChange: (newPage: number) => void;
  onView: (item: CuelinksTransactionItem) => void;
}

export function TransactionsTable({
  items,
  pagination,
  isLoading,
  onPageChange,
  onView,
}: TransactionsTableProps) {
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
        <h3 className="font-semibold text-foreground text-sm">No Transactions Found</h3>
        <p className="text-xs text-muted-foreground max-w-sm mx-auto">
          No affiliate transactions match your search and filter criteria.
        </p>
      </div>
    );
  }

  const getStatusBadge = (status: string) => {
    const s = (status || '').toLowerCase();
    switch (s) {
      case 'validated':
        return (
          <Badge variant="default" className="bg-blue-600 text-white gap-1 text-[10px]">
            <CheckCircle2 className="h-3 w-3" />
            <span>VALIDATED</span>
          </Badge>
        );
      case 'payable':
        return (
          <Badge variant="default" className="bg-emerald-600 text-white gap-1 text-[10px]">
            <CreditCard className="h-3 w-3" />
            <span>PAYABLE</span>
          </Badge>
        );
      case 'claimed':
        return (
          <Badge variant="default" className="bg-purple-600 text-white gap-1 text-[10px]">
            <CheckCheck className="h-3 w-3" />
            <span>CLAIMED</span>
          </Badge>
        );
      case 'rejected':
        return (
          <Badge variant="destructive" className="gap-1 text-[10px]">
            <XCircle className="h-3 w-3" />
            <span>REJECTED</span>
          </Badge>
        );
      case 'pending':
      default:
        return (
          <Badge variant="outline" className="gap-1 text-[10px] text-amber-600 border-amber-300">
            <Clock className="h-3 w-3" />
            <span>PENDING</span>
          </Badge>
        );
    }
  };

  return (
    <div className="space-y-4">
      <div className="rounded-xl border border-border bg-card overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow className="hover:bg-transparent text-xs">
              <TableHead className="w-[120px]">Date</TableHead>
              <TableHead>Transaction / Order ID</TableHead>
              <TableHead>Campaign / Merchant</TableHead>
              <TableHead>Sub ID / Tag</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Sale Value</TableHead>
              <TableHead>Commission</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody className="text-xs">
            {items.map((item) => {
              const currency = item.currency || 'UNKNOWN';

              return (
                <TableRow key={item.id} className="hover:bg-muted/30">
                  <TableCell className="font-mono text-muted-foreground whitespace-nowrap">
                    {new Date(item.transactionDate).toLocaleDateString()}
                  </TableCell>

                  <TableCell>
                    <div className="space-y-0.5">
                      <span className="font-semibold text-foreground font-mono block">
                        #{item.externalTransactionId}
                      </span>
                      {item.orderId && (
                        <span className="text-[10px] text-muted-foreground block font-mono">
                          Order: {item.orderId}
                        </span>
                      )}
                    </div>
                  </TableCell>

                  <TableCell>
                    <div className="space-y-0.5">
                      <span className="font-medium text-foreground block">
                        {item.campaignName || 'Unknown Campaign'}
                      </span>
                      <span className="text-[10px] text-muted-foreground block">
                        ID: {item.campaignId || '—'} {item.productName && `• ${item.productName}`}
                      </span>
                    </div>
                  </TableCell>

                  <TableCell>
                    {item.subId ? (
                      <Badge variant="secondary" className="font-mono text-[10px]">
                        {item.subId}
                      </Badge>
                    ) : (
                      <span className="text-muted-foreground text-[10px]">—</span>
                    )}
                  </TableCell>

                  <TableCell>{getStatusBadge(item.status)}</TableCell>

                  <TableCell className="font-mono font-semibold text-foreground whitespace-nowrap">
                    {formatAffiliateCurrency(item.saleAmount, currency, { showUnknownLabel: false })}
                  </TableCell>

                  <TableCell className="font-mono font-bold text-emerald-600 whitespace-nowrap">
                    {formatAffiliateCurrency(item.commissionAmount, currency, { showUnknownLabel: false })}
                  </TableCell>

                  <TableCell className="text-right">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => onView(item)}
                      className="h-8 gap-1 text-xs"
                    >
                      <Eye className="h-3.5 w-3.5" />
                      <span>Inspect</span>
                    </Button>
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </div>

      {/* Pagination controls */}
      {pagination && pagination.totalPages > 1 && (
        <div className="flex items-center justify-between px-2 text-xs text-muted-foreground">
          <span>
            Page <strong className="text-foreground">{pagination.page}</strong> of{' '}
            <strong className="text-foreground">{pagination.totalPages}</strong> (
            {pagination.total} records)
          </span>

          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              disabled={pagination.page <= 1}
              onClick={() => onPageChange(pagination.page - 1)}
              className="h-8 gap-1 text-xs"
            >
              <ChevronLeft className="h-3.5 w-3.5" />
              <span>Previous</span>
            </Button>
            <Button
              variant="outline"
              size="sm"
              disabled={pagination.page >= pagination.totalPages}
              onClick={() => onPageChange(pagination.page + 1)}
              className="h-8 gap-1 text-xs"
            >
              <span>Next</span>
              <ChevronRight className="h-3.5 w-3.5" />
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
