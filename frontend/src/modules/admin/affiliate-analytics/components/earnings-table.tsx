import React from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Skeleton } from '@/components/ui/skeleton';
import { Info } from 'lucide-react';
import type { EarningsReportItem } from '../types';
import { formatAffiliateCurrency } from '../utils/currency';

interface EarningsTableProps {
  items: EarningsReportItem[];
  isLoading: boolean;
}

export function EarningsTable({ items, isLoading }: EarningsTableProps) {
  if (isLoading) {
    return (
      <div className="rounded-xl border border-border bg-card p-4 space-y-3">
        <div className="space-y-2">
          {Array.from({ length: 6 }).map((_, i) => (
            <Skeleton key={i} className="h-12 w-full rounded-md" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Status Meaning Explanations Notice */}
      <div className="p-4 bg-muted/30 border border-border rounded-xl space-y-2 text-xs">
        <div className="flex items-center gap-1.5 font-semibold text-foreground">
          <Info className="h-4 w-4 text-primary" />
          <span>Understanding Commission Lifecycle Statuses</span>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-5 gap-3 pt-1 text-[11px] text-muted-foreground">
          <div>
            <strong className="text-amber-700 block">Pending</strong>
            Sale reported by merchant; awaiting cancellation/return window clearance.
          </div>
          <div>
            <strong className="text-blue-700 block">Validated</strong>
            Merchant confirmed sale as valid; awaiting invoicing and payment release (not funds in bank).
          </div>
          <div>
            <strong className="text-emerald-700 block">Payable</strong>
            Cleared for publisher payout disbursement by Cuelinks network.
          </div>
          <div>
            <strong className="text-purple-700 block">Claimed</strong>
            Invoices raised and claimed by publisher from the network (payout requested; not confirmed bank deposit).
          </div>
          <div>
            <strong className="text-rose-700 block">Rejected</strong>
            Order cancelled, returned, or flagged as non-commissionable by advertiser.
          </div>
        </div>
      </div>

      <div className="rounded-xl border border-border bg-card overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow className="hover:bg-transparent text-xs">
              <TableHead className="w-[120px]">Month</TableHead>
              <TableHead className="text-amber-700">Pending</TableHead>
              <TableHead className="text-blue-700">Validated</TableHead>
              <TableHead className="text-emerald-700">Payable</TableHead>
              <TableHead className="text-purple-700">Claimed</TableHead>
              <TableHead className="text-rose-700">Rejected</TableHead>
              <TableHead className="text-right font-bold">Total</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody className="text-xs">
            {items.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                  No monthly earnings reports available.
                </TableCell>
              </TableRow>
            ) : (
              items.map((row) => {
                const currency = row.currency || 'INR';

                return (
                  <TableRow key={row.month}>
                    <TableCell className="font-semibold text-foreground">
                      {row.month}
                    </TableCell>

                    <TableCell className="font-mono text-amber-700 font-medium">
                      {formatAffiliateCurrency(row.pending, currency, { showUnknownLabel: false })}
                    </TableCell>

                    <TableCell className="font-mono text-blue-700 font-medium">
                      {formatAffiliateCurrency(row.validated, currency, { showUnknownLabel: false })}
                    </TableCell>

                    <TableCell className="font-mono text-emerald-700 font-medium">
                      {formatAffiliateCurrency(row.payable, currency, { showUnknownLabel: false })}
                    </TableCell>

                    <TableCell className="font-mono text-purple-700 font-medium">
                      {formatAffiliateCurrency(row.claimed, currency, { showUnknownLabel: false })}
                    </TableCell>

                    <TableCell className="font-mono text-rose-700 font-medium">
                      {formatAffiliateCurrency(row.rejected, currency, { showUnknownLabel: false })}
                    </TableCell>

                    <TableCell className="font-mono text-right font-bold text-foreground">
                      {formatAffiliateCurrency(row.total, currency, { showUnknownLabel: false })}
                    </TableCell>
                  </TableRow>
                );
              })
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
