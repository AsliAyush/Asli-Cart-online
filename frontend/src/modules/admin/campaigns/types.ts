export interface CuelinksCampaignItem {
  id: string;
  externalCampaignId: number;
  name: string;
  description?: string | null;
  url?: string | null;
  domain?: string | null;
  image?: string | null;
  accessStatus: string;
  payout?: string | null;
  payoutCurrency?: string | null;
  epc7d?: string | null;
  epc90d?: string | null;
  campaignType?: string | null;
  isFeatured: boolean;
  country?: string | null;
  category?: string | null;
  platforms?: string[] | null;
  media?: any;
  rawMetadata?: any;
  lastSyncedAt: string;
  createdAt: string;
  updatedAt: string;
}

export interface CampaignFilterParams {
  page?: number;
  limit?: number;
  search?: string;
  accessStatus?: string;
  category?: string;
  country?: string;
  sort?: string;
  order?: 'asc' | 'desc';
}

export interface CampaignSyncSummary {
  totalFetched: number;
  created: number;
  updated: number;
  unchanged: number;
  failed: number;
  startedAt: string;
  completedAt: string;
  durationMs: number;
  status: 'COMPLETED' | 'PARTIALLY_COMPLETED' | 'FAILED';
  error?: string;
}

export interface CampaignSyncStatus {
  status: 'IDLE' | 'IN_PROGRESS' | 'COMPLETED' | 'FAILED';
  lastSyncedAt: string | null;
  lastSummary: CampaignSyncSummary | null;
  currentError: string | null;
}
