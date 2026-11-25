import React from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { RefreshCw, CheckCircle2, AlertCircle, Clock } from 'lucide-react';
import { useSyncCampaigns, useSyncStatus } from '../hooks/use-campaigns';

export function CampaignSyncButton() {
  const { data: syncState } = useSyncStatus();
  const { mutate: syncCampaigns, isPending } = useSyncCampaigns();

  const isSyncing = isPending || syncState?.status === 'IN_PROGRESS';

  const formatLastSync = (dateStr: string | null | undefined) => {
    if (!dateStr) return 'Never';
    try {
      const date = new Date(dateStr);
      return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) + ' ' + date.toLocaleDateString();
    } catch {
      return 'Unknown';
    }
  };

  return (
    <div className="flex items-center gap-3">
      {/* Last Sync Indicator */}
      <div className="hidden sm:flex items-center gap-1.5 text-xs text-muted-foreground bg-muted/40 px-2.5 py-1 rounded-md border">
        {syncState?.status === 'IN_PROGRESS' ? (
          <>
            <RefreshCw className="h-3.5 w-3.5 animate-spin text-primary" />
            <span>Syncing from Cuelinks...</span>
          </>
        ) : syncState?.status === 'FAILED' ? (
          <>
            <AlertCircle className="h-3.5 w-3.5 text-destructive" />
            <span>Sync Error</span>
          </>
        ) : syncState?.lastSyncedAt ? (
          <>
            <Clock className="h-3.5 w-3.5" />
            <span>Last Synced: {formatLastSync(syncState.lastSyncedAt)}</span>
          </>
        ) : (
          <>
            <Clock className="h-3.5 w-3.5" />
            <span>Not yet synced</span>
          </>
        )}
      </div>

      {/* Action Button */}
      <Button
        variant="default"
        size="sm"
        onClick={() => syncCampaigns({ maxPages: 5 })}
        disabled={isSyncing}
        className="h-8 text-xs font-medium"
      >
        <RefreshCw className={`h-3.5 w-3.5 mr-1.5 ${isSyncing ? 'animate-spin' : ''}`} />
        {isSyncing ? 'Synchronizing...' : 'Sync Campaigns'}
      </Button>
    </div>
  );
}
