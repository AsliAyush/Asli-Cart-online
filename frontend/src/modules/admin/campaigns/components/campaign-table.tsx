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
import { Eye, ExternalLink, Globe, Sparkles, ChevronLeft, ChevronRight } from 'lucide-react';
import type { CuelinksCampaignItem } from '../types';
import type { BackendPagination } from '@/types/api';

interface CampaignTableProps {
  campaigns: CuelinksCampaignItem[];
  pagination: BackendPagination;
  isLoading: boolean;
  onSelectCampaign: (campaign: CuelinksCampaignItem) => void;
  onRequestAccess: (id: number) => void;
  onPageChange: (newPage: number) => void;
}

export function CampaignTable({
  campaigns,
  pagination,
  isLoading,
  onSelectCampaign,
  onRequestAccess,
  onPageChange,
}: CampaignTableProps) {
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

  if (isLoading) {
    return (
      <div className="space-y-2">
        {Array.from({ length: 6 }).map((_, i) => (
          <Skeleton key={i} className="h-14 w-full rounded-md" />
        ))}
      </div>
    );
  }

  if (campaigns.length === 0) {
    return (
      <div className="text-center py-12 border rounded-lg bg-card text-muted-foreground">
        <Sparkles className="h-8 w-8 mx-auto text-muted-foreground/60 mb-2" />
        <h3 className="font-semibold text-foreground text-sm">No Cuelinks Campaigns Found</h3>
        <p className="text-xs text-muted-foreground mt-1 max-w-sm mx-auto">
          Synchronize campaigns from Cuelinks or adjust your search filter criteria above.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="border rounded-lg bg-card overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[300px]">Campaign & Merchant</TableHead>
              <TableHead>External ID</TableHead>
              <TableHead>Payout</TableHead>
              <TableHead>EPC (7d)</TableHead>
              <TableHead>Access Status</TableHead>
              <TableHead>Last Synced</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {campaigns.map((camp) => (
              <TableRow key={camp.id} className="hover:bg-muted/50 transition-colors">
                {/* Campaign & Merchant */}
                <TableCell>
                  <div className="space-y-0.5">
                    <div className="font-medium text-sm flex items-center gap-1.5">
                      <span>{camp.name}</span>
                      {camp.isFeatured && (
                        <Badge variant="deal" className="text-[10px] py-0 px-1">
                          Featured
                        </Badge>
                      )}
                    </div>
                    {camp.domain && (
                      <div className="text-xs text-muted-foreground flex items-center gap-1">
                        <Globe className="h-3 w-3" />
                        <span>{camp.domain}</span>
                      </div>
                    )}
                  </div>
                </TableCell>

                {/* ID */}
                <TableCell className="text-xs font-mono text-muted-foreground">
                  #{camp.externalCampaignId}
                </TableCell>

                {/* Payout */}
                <TableCell className="text-xs font-medium">
                  {camp.payout ? `${camp.payout} ${camp.payoutCurrency || ''}` : 'Variable'}
                </TableCell>

                {/* EPC 7d */}
                <TableCell className="text-xs font-mono">
                  {camp.epc7d ? `₹${camp.epc7d}` : '—'}
                </TableCell>

                {/* Status */}
                <TableCell>{getStatusBadge(camp.accessStatus)}</TableCell>

                {/* Last Synced */}
                <TableCell className="text-xs text-muted-foreground">
                  {new Date(camp.lastSyncedAt).toLocaleDateString()}
                </TableCell>

                {/* Actions */}
                <TableCell className="text-right">
                  <div className="flex items-center justify-end gap-1.5">
                    {camp.accessStatus === 'approval_required' && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => onRequestAccess(camp.externalCampaignId)}
                        className="h-7 text-xs px-2"
                      >
                        Request
                      </Button>
                    )}
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => onSelectCampaign(camp)}
                      className="h-7 text-xs px-2"
                    >
                      <Eye className="h-3.5 w-3.5 mr-1" />
                      Details
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      {/* Pagination Controls */}
      <div className="flex items-center justify-between text-xs text-muted-foreground px-1">
        <div>
          Showing page <span className="font-medium text-foreground">{pagination.page}</span> of{' '}
          <span className="font-medium text-foreground">{pagination.totalPages}</span> ({pagination.total} total campaigns)
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => onPageChange(pagination.page - 1)}
            disabled={pagination.page <= 1}
            className="h-7 text-xs px-2"
          >
            <ChevronLeft className="h-3.5 w-3.5 mr-1" />
            Previous
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => onPageChange(pagination.page + 1)}
            disabled={pagination.page >= pagination.totalPages}
            className="h-7 text-xs px-2"
          >
            Next
            <ChevronRight className="h-3.5 w-3.5 ml-1" />
          </Button>
        </div>
      </div>
    </div>
  );
}
