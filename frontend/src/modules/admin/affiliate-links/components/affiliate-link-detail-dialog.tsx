import React from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  ExternalLink,
  RotateCw,
  Link2,
  AlertTriangle,
  Building2,
  Calendar,
  CheckCircle2,
  XCircle,
} from 'lucide-react';
import type { AffiliateOfferItem } from '../types';

interface AffiliateLinkDetailDialogProps {
  offer: AffiliateOfferItem | null;
  isOpen: boolean;
  onClose: () => void;
  onRetry: (offer: AffiliateOfferItem) => void;
  isRetrying: boolean;
}

export function AffiliateLinkDetailDialog({
  offer,
  isOpen,
  onClose,
  onRetry,
  isRetrying,
}: AffiliateLinkDetailDialogProps) {
  if (!offer) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <div className="flex items-center justify-between gap-3 pr-6">
            <div className="space-y-1">
              <DialogTitle className="text-base font-bold text-foreground">
                Affiliate Link Details
              </DialogTitle>
              <DialogDescription className="text-xs text-muted-foreground">
                Cuelinks V3 conversion metadata & routing status
              </DialogDescription>
            </div>
            <Badge
              variant={
                offer.conversionStatus === 'CONVERTED'
                  ? 'default'
                  : offer.conversionStatus === 'FAILED'
                  ? 'destructive'
                  : 'secondary'
              }
              className="text-xs"
            >
              {offer.conversionStatus}
            </Badge>
          </div>
        </DialogHeader>

        <div className="space-y-4 text-xs">
          {/* Offer & Merchant Banner */}
          <div className="p-3 bg-secondary/30 rounded-xl border border-border space-y-2">
            <div className="flex items-center justify-between">
              <span className="font-semibold text-sm text-foreground">{offer.title}</span>
              <span className="font-bold text-foreground font-mono">
                ₹{Number(offer.sellingPrice).toLocaleString('en-IN')}
              </span>
            </div>
            <div className="flex items-center gap-4 text-muted-foreground text-[11px]">
              <span className="flex items-center gap-1">
                <Building2 className="h-3 w-3" />
                <span>Merchant: {offer.merchant?.name || 'Unknown'}</span>
              </span>
              <span className="flex items-center gap-1">
                <Calendar className="h-3 w-3" />
                <span>Status: {offer.status}</span>
              </span>
            </div>
          </div>

          {/* URLs section */}
          <div className="space-y-3">
            <div>
              <span className="text-[11px] font-semibold text-muted-foreground block mb-1">
                Original Merchant URL (Preserved)
              </span>
              <div className="p-2.5 bg-muted/50 rounded-lg border font-mono text-[11px] break-all flex items-center justify-between gap-2">
                <span className="text-foreground">{offer.originalUrl}</span>
                <a
                  href={offer.originalUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-primary hover:underline shrink-0"
                  title="Open original URL"
                >
                  <ExternalLink className="h-3.5 w-3.5" />
                </a>
              </div>
            </div>

            <div>
              <span className="text-[11px] font-semibold text-muted-foreground block mb-1">
                Cuelinks Tracking URL
              </span>
              {offer.affiliateUrl ? (
                <div className="p-2.5 bg-primary/5 border border-primary/20 rounded-lg font-mono text-[11px] break-all flex items-center justify-between gap-2">
                  <span className="text-primary font-medium">{offer.affiliateUrl}</span>
                  <a
                    href={offer.affiliateUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-primary hover:underline shrink-0"
                    title="Open tracking URL"
                  >
                    <ExternalLink className="h-3.5 w-3.5" />
                  </a>
                </div>
              ) : (
                <div className="p-2.5 bg-muted/30 border border-dashed rounded-lg text-muted-foreground italic text-[11px]">
                  No affiliate tracking URL generated. Traffic routes to the original merchant URL.
                </div>
              )}
            </div>
          </div>

          {/* Metadata Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
            <div className="p-2.5 bg-card border rounded-lg">
              <span className="text-[10px] text-muted-foreground block">Is Affiliated</span>
              <span className="font-semibold text-foreground flex items-center gap-1 mt-0.5">
                {offer.isAffiliated ? (
                  <>
                    <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600" />
                    <span>Yes (Eligible)</span>
                  </>
                ) : (
                  <>
                    <XCircle className="h-3.5 w-3.5 text-muted-foreground" />
                    <span>No</span>
                  </>
                )}
              </span>
            </div>

            <div className="p-2.5 bg-card border rounded-lg">
              <span className="text-[10px] text-muted-foreground block">Provider</span>
              <span className="font-semibold text-foreground mt-0.5 block">
                {offer.affiliateProvider || 'CUELINKS'}
              </span>
            </div>

            <div className="p-2.5 bg-card border rounded-lg">
              <span className="text-[10px] text-muted-foreground block">Last Converted</span>
              <span className="font-semibold text-foreground mt-0.5 block truncate">
                {offer.lastConvertedAt
                  ? new Date(offer.lastConvertedAt).toLocaleString()
                  : 'Never'}
              </span>
            </div>
          </div>

          {/* Conversion Error Banner */}
          {offer.conversionError && (
            <div className="p-3 bg-destructive/10 border border-destructive/20 rounded-lg text-destructive space-y-1">
              <div className="flex items-center gap-1.5 font-semibold">
                <AlertTriangle className="h-3.5 w-3.5 shrink-0" />
                <span>Conversion Notice</span>
              </div>
              <p className="text-[11px] leading-relaxed">{offer.conversionError}</p>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex items-center justify-end gap-2 pt-2 border-t border-border">
            <Button variant="outline" size="sm" onClick={onClose}>
              Close
            </Button>
            <Button
              size="sm"
              onClick={() => onRetry(offer)}
              disabled={isRetrying}
              className="gap-1.5"
            >
              <RotateCw className={`h-3.5 w-3.5 ${isRetrying ? 'animate-spin' : ''}`} />
              <span>Retry Conversion</span>
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
