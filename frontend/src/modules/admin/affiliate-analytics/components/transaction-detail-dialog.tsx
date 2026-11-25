import React from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import {
  Calendar,
  Building2,
  Tag,
  Hash,
  ShoppingBag,
  Coins,
  Layers,
  ShieldCheck,
} from 'lucide-react';
import type { CuelinksTransactionItem } from '../types';
import { formatAffiliateCurrency } from '../utils/currency';

interface TransactionDetailDialogProps {
  transaction: CuelinksTransactionItem | null;
  isOpen: boolean;
  onClose: () => void;
}

export function TransactionDetailDialog({
  transaction,
  isOpen,
  onClose,
}: TransactionDetailDialogProps) {
  if (!transaction) return null;

  const curr = transaction.currency || 'UNKNOWN';

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-center justify-between gap-3 pr-6">
            <div className="space-y-1">
              <DialogTitle className="text-base font-bold text-foreground">
                Transaction #{transaction.externalTransactionId}
              </DialogTitle>
              <DialogDescription className="text-xs text-muted-foreground">
                Recorded via Cuelinks V3 affiliate conversion ledger
              </DialogDescription>
            </div>
            <Badge
              variant={
                transaction.status === 'payable' || transaction.status === 'validated'
                  ? 'default'
                  : transaction.status === 'rejected'
                  ? 'destructive'
                  : 'secondary'
              }
              className="text-xs uppercase"
            >
              {transaction.status}
            </Badge>
          </div>
        </DialogHeader>

        <div className="space-y-4 text-xs">
          {/* Financial summary card */}
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 p-3 bg-secondary/30 rounded-xl border border-border">
            <div>
              <span className="text-[10px] text-muted-foreground block">Order Sale Value</span>
              <span className="text-base font-bold font-mono text-foreground mt-0.5 block">
                {formatAffiliateCurrency(transaction.saleAmount, curr)}
              </span>
            </div>

            <div>
              <span className="text-[10px] text-muted-foreground block">User Commission</span>
              <span className="text-base font-bold font-mono text-emerald-600 mt-0.5 block">
                {formatAffiliateCurrency(transaction.commissionAmount, curr)}
              </span>
            </div>

            <div>
              <span className="text-[10px] text-muted-foreground block">Currency</span>
              <span className="text-base font-bold font-mono text-foreground mt-0.5 block">
                {transaction.currency || 'UNKNOWN'}
              </span>
            </div>
          </div>

          {/* Core metadata grid */}
          <div className="grid grid-cols-2 gap-3">
            <div className="p-3 bg-card border rounded-lg space-y-1">
              <span className="text-[10px] text-muted-foreground flex items-center gap-1">
                <Building2 className="h-3 w-3" />
                <span>Campaign</span>
              </span>
              <p className="font-semibold text-foreground">{transaction.campaignName || 'N/A'}</p>
              <p className="text-[10px] text-muted-foreground">
                ID: {transaction.campaignId || '—'} {transaction.campaignType && `• ${transaction.campaignType}`}
              </p>
            </div>

            <div className="p-3 bg-card border rounded-lg space-y-1">
              <span className="text-[10px] text-muted-foreground flex items-center gap-1">
                <Tag className="h-3 w-3" />
                <span>Product / Category</span>
              </span>
              <p className="font-semibold text-foreground">{transaction.productName || 'Order Event'}</p>
              <p className="text-[10px] text-muted-foreground">Category: {transaction.category || 'General'}</p>
            </div>

            <div className="p-3 bg-card border rounded-lg space-y-1">
              <span className="text-[10px] text-muted-foreground flex items-center gap-1">
                <Calendar className="h-3 w-3" />
                <span>Transaction Date</span>
              </span>
              <p className="font-mono text-foreground">
                {new Date(transaction.transactionDate).toLocaleString()}
              </p>
              <p className="text-[10px] text-muted-foreground">
                Synced: {new Date(transaction.lastSyncedAt).toLocaleString()}
              </p>
            </div>

            <div className="p-3 bg-card border rounded-lg space-y-1">
              <span className="text-[10px] text-muted-foreground flex items-center gap-1">
                <Hash className="h-3 w-3" />
                <span>Reference Numbers</span>
              </span>
              <p className="font-mono text-foreground">
                Order: {transaction.orderId || '—'}
              </p>
              <p className="text-[10px] text-muted-foreground font-mono">
                Invoice: {transaction.invoiceNumber || '—'}
              </p>
            </div>
          </div>

          {/* Sub ID Attribution Chain */}
          <div className="p-3 bg-card border rounded-lg space-y-2">
            <span className="text-[10px] font-semibold text-foreground flex items-center gap-1">
              <Layers className="h-3 w-3" />
              <span>Sub ID Attribution Chain</span>
            </span>
            <div className="grid grid-cols-2 sm:grid-cols-5 gap-2 font-mono text-[11px]">
              <div className="p-2 bg-muted/30 rounded border">
                <span className="text-[9px] text-muted-foreground block font-sans">Sub ID (Primary)</span>
                <span className="font-medium text-foreground">{transaction.subId || '—'}</span>
              </div>
              <div className="p-2 bg-muted/30 rounded border">
                <span className="text-[9px] text-muted-foreground block font-sans">Sub ID 2</span>
                <span className="font-medium text-foreground">{transaction.subId2 || '—'}</span>
              </div>
              <div className="p-2 bg-muted/30 rounded border">
                <span className="text-[9px] text-muted-foreground block font-sans">Sub ID 3</span>
                <span className="font-medium text-foreground">{transaction.subId3 || '—'}</span>
              </div>
              <div className="p-2 bg-muted/30 rounded border">
                <span className="text-[9px] text-muted-foreground block font-sans">Sub ID 4</span>
                <span className="font-medium text-foreground">{transaction.subId4 || '—'}</span>
              </div>
              <div className="p-2 bg-muted/30 rounded border">
                <span className="text-[9px] text-muted-foreground block font-sans">Sub ID 5</span>
                <span className="font-medium text-foreground">{transaction.subId5 || '—'}</span>
              </div>
            </div>
          </div>

          {/* Raw JSON Payload (Sanitized) */}
          {transaction.rawMetadata && (
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <span className="font-semibold text-foreground">Raw API Metadata</span>
                <span className="text-[10px] text-emerald-600 flex items-center gap-1">
                  <ShieldCheck className="h-3 w-3" />
                  <span>Sensitive tokens &amp; IP addresses redacted</span>
                </span>
              </div>
              <pre className="p-3 bg-muted/50 rounded-lg text-[10px] font-mono overflow-x-auto max-h-40 border border-border">
                {JSON.stringify(transaction.rawMetadata, null, 2)}
              </pre>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
