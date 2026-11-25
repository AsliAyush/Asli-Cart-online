import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  RotateCw,
  CheckCircle2,
  AlertTriangle,
  Clock,
  Database,
  Lock,
  ArrowDownCircle,
} from 'lucide-react';
import type { TransactionSyncStatus } from '../types';

interface SyncStatusCardProps {
  syncStatus?: TransactionSyncStatus;
  isLoading: boolean;
  onSync: () => void;
  isSyncing: boolean;
}

export function SyncStatusCard({
  syncStatus,
  isLoading,
  onSync,
  isSyncing,
}: SyncStatusCardProps) {
  const latest = syncStatus?.latestLog;
  const isSyncActive = isSyncing || syncStatus?.isSyncInProgress;
  const isPartial = latest?.status === 'PARTIALLY_COMPLETED' || latest?.isPartial;

  return (
    <Card className="rounded-xl border border-border shadow-sm bg-card">
      <CardContent className="p-4 flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-primary/10 rounded-xl text-primary">
            <Database className="h-5 w-5" />
          </div>
          <div className="space-y-0.5">
            <div className="flex items-center gap-2">
              <span className="font-semibold text-sm text-foreground">
                Cuelinks Transactions Ledger
              </span>
              <Badge
                variant={isSyncActive ? 'default' : isPartial ? 'outline' : 'outline'}
                className={
                  isSyncActive
                    ? 'bg-primary animate-pulse text-[10px]'
                    : isPartial
                    ? 'border-amber-500/50 bg-amber-500/10 text-amber-700 text-[10px]'
                    : 'text-[10px]'
                }
              >
                {isSyncActive ? 'SYNCING...' : isPartial ? 'PARTIALLY SYNCED' : 'UP TO DATE'}
              </Badge>

              {syncStatus?.isDistributedLockActive && !isSyncActive && (
                <Badge variant="secondary" className="gap-1 text-[10px] text-muted-foreground">
                  <Lock className="h-2.5 w-2.5" />
                  <span>Lock Active</span>
                </Badge>
              )}
            </div>
            <p className="text-xs text-muted-foreground flex items-center gap-3">
              <span>
                Total records: <strong className="text-foreground">{syncStatus?.totalTransactions || 0}</strong>
              </span>
              <span>•</span>
              <span>
                Last completed:{' '}
                {syncStatus?.lastSuccessfulSyncAt
                  ? new Date(syncStatus.lastSuccessfulSyncAt).toLocaleString()
                  : 'Never'}
              </span>
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2.5">
          {latest && latest.recordsFetched > 0 && (
            <div className="hidden sm:flex items-center gap-2 text-[11px] text-muted-foreground px-3 py-1.5 bg-muted/40 rounded-lg border">
              <span>Fetched: {latest.recordsFetched}</span>
              <span>•</span>
              <span className="text-emerald-600 font-medium">+{latest.recordsCreated} new</span>
              <span>•</span>
              <span>{latest.recordsUpdated} updated</span>
              {latest.failedRecords > 0 && (
                <>
                  <span>•</span>
                  <span className="text-rose-600 font-medium">{latest.failedRecords} failed</span>
                </>
              )}
              {latest.checkpointPage && (
                <>
                  <span>•</span>
                  <span className="text-amber-600 font-medium">Page {latest.checkpointPage} checkpoint</span>
                </>
              )}
            </div>
          )}

          <Button
            size="sm"
            onClick={onSync}
            disabled={isSyncActive || isLoading}
            className="gap-2"
          >
            <RotateCw className={`h-3.5 w-3.5 ${isSyncActive ? 'animate-spin' : ''}`} />
            <span>{isSyncActive ? 'Syncing...' : 'Sync Now'}</span>
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
