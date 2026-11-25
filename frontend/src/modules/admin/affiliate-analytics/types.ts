export type TransactionStatus =
  | 'pending'
  | 'validated'
  | 'payable'
  | 'claimed'
  | 'rejected'
  | string;

export interface CuelinksTransactionItem {
  id: string;
  externalTransactionId: string;
  campaignId?: number | null;
  campaignName?: string | null;
  campaignType?: string | null;
  transactionDate: string;
  status: TransactionStatus;
  saleAmount?: number | string | null;
  commissionAmount?: number | string | null;
  currency: string;
  merchantRefId?: string | null;
  orderId?: string | null;
  productName?: string | null;
  category?: string | null;
  channelId?: number | null;
  channelName?: string | null;
  subId?: string | null;
  subId2?: string | null;
  subId3?: string | null;
  subId4?: string | null;
  subId5?: string | null;
  invoiceNumber?: string | null;
  rawMetadata?: any;
  lastSyncedAt: string;
  createdAt: string;
  updatedAt: string;
}

export interface TransactionFilterParams {
  page?: number;
  limit?: number;
  startDate?: string;
  endDate?: string;
  status?: string;
  campaignId?: number | string;
  subId?: string;
  invoiceNumber?: string;
  currency?: string;
  search?: string;
  sort?: string;
  order?: 'asc' | 'desc';
}

export interface TransactionSyncLogItem {
  id: string;
  status: 'IN_PROGRESS' | 'COMPLETED' | 'PARTIALLY_COMPLETED' | 'FAILED' | string;
  startedAt: string;
  completedAt?: string | null;
  updatedSince?: string | null;
  recordsFetched: number;
  recordsCreated: number;
  recordsUpdated: number;
  failedRecords: number;
  isPartial?: boolean;
  checkpointPage?: number | null;
  reachedPageLimit?: boolean;
  lastProcessedDate?: string | null;
  error?: string | null;
  createdAt: string;
}

export interface TransactionSyncStatus {
  isSyncInProgress: boolean;
  isDistributedLockActive?: boolean;
  totalTransactions: number;
  latestLog?: TransactionSyncLogItem | null;
  lastSuccessfulSyncAt?: string | null;
}

export interface TransactionSyncSummary {
  status: 'COMPLETED' | 'PARTIALLY_COMPLETED' | 'FAILED';
  startedAt: string;
  completedAt: string;
  updatedSince?: string | null;
  totalFetched: number;
  created: number;
  updated: number;
  failed: number;
  durationMs: number;
  isPartial?: boolean;
  checkpointPage?: number | null;
  reachedPageLimit?: boolean;
  lastProcessedDate?: string | null;
  error?: string | null;
}

export interface PerformanceReportItem {
  date: string;
  clicks: number;
  transactions: number;
  commission: string | number;
  sale_amount: string | number;
  conversion_rate?: string | number;
  earnings_per_click?: string | number;
  currency?: string;
  campaign_id?: number | null;
  campaign_name?: string | null;
  channel_id?: number | null;
  channel_name?: string | null;
  [key: string]: any;
}

export interface PerformanceReportFilterParams {
  start_date?: string;
  end_date?: string;
  campaign_id?: number | string;
  channel_id?: number | string;
  sort?: string;
  order?: 'asc' | 'desc';
  page?: number;
  per_page?: number;
}

export interface EarningsReportItem {
  month: string;
  pending: string | number;
  validated: string | number;
  payable: string | number;
  claimed: string | number;
  rejected: string | number;
  total: string | number;
  currency?: string;
  [key: string]: any;
}

export interface EarningsReportFilterParams {
  start_date?: string;
  end_date?: string;
  sort?: string;
  order?: 'asc' | 'desc';
  page?: number;
  per_page?: number;
}

export interface CurrencyMetricSummary {
  currency: string;
  totalSaleAmount: string;
  totalCommission: string;
  pendingCommission: string;
  validatedCommission: string;
  payableCommission: string;
  claimedCommission: string;
  rejectedCommission: string;
  transactionCount: number;
}

export interface DashboardSummary {
  dataSource?: 'LIVE_API' | 'LOCAL_DB';
  isFallback?: boolean;
  isStale?: boolean;
  isLiveAvailable?: boolean;
  currency: string;
  totalClicks: number;
  totalTransactions: number;
  totalSaleAmount: string;
  totalCommission: string;
  pendingCommission: string;
  validatedCommission: string;
  payableCommission: string;
  claimedCommission: string;
  rejectedCommission: string;
  lastSuccessfulSyncAt?: string | null;
  reportingPeriod?: {
    startDate: string;
    endDate: string;
    days: number;
  };
  currencies?: Record<string, CurrencyMetricSummary>;
}
