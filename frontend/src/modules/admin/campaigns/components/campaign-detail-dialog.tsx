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
import { ExternalLink, Globe, Layers, CheckCircle2, AlertTriangle, ShieldAlert } from 'lucide-react';
import type { CuelinksCampaignItem } from '../types';
import { useRequestAccess } from '../hooks/use-campaigns';

interface CampaignDetailDialogProps {
  campaign: CuelinksCampaignItem | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function CampaignDetailDialog({ campaign, open, onOpenChange }: CampaignDetailDialogProps) {
  const { mutate: requestAccess, isPending } = useRequestAccess();

  if (!campaign) return null;

  const isApprovalRequired = campaign.accessStatus === 'approval_required';
  const isPendingApproval = campaign.accessStatus === 'pending';

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'open':
        return <Badge variant="success">Open</Badge>;
      case 'approval_required':
        return <Badge variant="secondary">Approval Required</Badge>;
      case 'pending':
        return <Badge variant="outline">Pending Approval</Badge>;
      case 'paused':
        return <Badge variant="outline">Paused</Badge>;
      case 'rejected':
        return <Badge variant="destructive">Rejected</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-center justify-between gap-4">
            <div>
              <DialogTitle className="text-xl font-bold flex items-center gap-2">
                {campaign.name}
                {campaign.isFeatured && (
                  <Badge variant="deal" className="text-[10px]">
                    Featured
                  </Badge>
                )}
              </DialogTitle>
              <DialogDescription className="text-xs text-muted-foreground mt-1 flex items-center gap-2">
                <span>Cuelinks ID: #{campaign.externalCampaignId}</span>
                {campaign.domain && (
                  <>
                    <span>•</span>
                    <span className="flex items-center gap-1">
                      <Globe className="h-3 w-3" />
                      {campaign.domain}
                    </span>
                  </>
                )}
              </DialogDescription>
            </div>
            <div>{getStatusBadge(campaign.accessStatus)}</div>
          </div>
        </DialogHeader>

        <div className="space-y-4 py-2 text-sm">
          {/* Key Metrics Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 p-3 bg-muted/40 rounded-lg border">
            <div>
              <span className="text-xs text-muted-foreground block">Payout Rate</span>
              <span className="font-semibold text-foreground">
                {campaign.payout ? `${campaign.payout} ${campaign.payoutCurrency || ''}` : 'Custom / Variable'}
              </span>
            </div>
            <div>
              <span className="text-xs text-muted-foreground block">EPC (7 Days)</span>
              <span className="font-semibold text-foreground">
                {campaign.epc7d ? `₹${campaign.epc7d}` : '—'}
              </span>
            </div>
            <div>
              <span className="text-xs text-muted-foreground block">EPC (90 Days)</span>
              <span className="font-semibold text-foreground">
                {campaign.epc90d ? `₹${campaign.epc90d}` : '—'}
              </span>
            </div>
            <div>
              <span className="text-xs text-muted-foreground block">Region</span>
              <span className="font-semibold text-foreground">
                {campaign.country || 'Global / India'}
              </span>
            </div>
          </div>

          {/* Description & Terms */}
          {campaign.description && (
            <div>
              <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1.5">
                Campaign Terms & Guidelines
              </h4>
              <p className="text-xs text-muted-foreground bg-card border rounded p-3 whitespace-pre-wrap leading-relaxed">
                {campaign.description}
              </p>
            </div>
          )}

          {/* Supported Platforms */}
          {Array.isArray(campaign.platforms) && campaign.platforms.length > 0 && (
            <div>
              <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1.5">
                Eligible Traffic Channels & Platforms
              </h4>
              <div className="flex flex-wrap gap-1.5">
                {campaign.platforms.map((platform, idx) => (
                  <Badge key={idx} variant="outline" className="text-xs font-normal">
                    {platform}
                  </Badge>
                ))}
              </div>
            </div>
          )}

          {/* Destination & Tracking URLs */}
          <div>
            <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1.5">
              Merchant Destination
            </h4>
            <div className="space-y-1.5">
              {campaign.url && (
                <div className="flex items-center justify-between text-xs bg-muted/30 p-2 rounded border">
                  <span className="truncate max-w-[400px] text-muted-foreground font-mono">
                    {campaign.url}
                  </span>
                  <a
                    href={campaign.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-primary hover:underline flex items-center gap-1 font-medium ml-2 shrink-0"
                  >
                    Visit <ExternalLink className="h-3 w-3" />
                  </a>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Action Footer */}
        <div className="flex items-center justify-between pt-4 border-t mt-2">
          <div className="text-xs text-muted-foreground">
            Last Synced: {new Date(campaign.lastSyncedAt).toLocaleString()}
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={() => onOpenChange(false)}>
              Close
            </Button>
            {isApprovalRequired && (
              <Button
                variant="default"
                size="sm"
                onClick={() => requestAccess(campaign.externalCampaignId)}
                disabled={isPending}
              >
                {isPending ? 'Requesting...' : 'Request Campaign Access'}
              </Button>
            )}
            {isPendingApproval && (
              <Button variant="secondary" size="sm" disabled>
                Access Request Pending
              </Button>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
