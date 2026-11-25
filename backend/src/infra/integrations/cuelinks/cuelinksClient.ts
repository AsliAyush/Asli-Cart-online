import { env } from '../../../config/env.js';
import { AppError } from '../../../utils/appError.js';

export type CuelinksErrorCategory =
  | 'NOT_CONFIGURED'
  | 'AUTHENTICATION_FAILED'
  | 'PERMISSION_DENIED'
  | 'RATE_LIMITED'
  | 'SERVER_ERROR'
  | 'TIMEOUT'
  | 'NETWORK_ERROR'
  | 'UNKNOWN_ERROR';

export interface CuelinksPingResult {
  configured: boolean;
  connected: boolean;
  statusCode?: number;
  latencyMs?: number;
  errorCategory?: CuelinksErrorCategory;
  message: string;
  details?: Record<string, unknown>;
}

export interface CuelinksApiCampaign {
  id: number;
  name: string;
  description?: string | null;
  url?: string | null;
  domain?: string | null;
  image?: string | null;
  logo_url?: string | null;
  tracking_url?: string | null;
  access_status?: string; // 'open' | 'approval_required' | 'pending' | 'paused' | 'rejected'
  payout?: string | number | null;
  payout_currency?: string | null;
  currency?: string | null;
  epc_7d?: string | number | null;
  epc_90d?: string | number | null;
  campaign_type?: string | null;
  is_featured?: boolean;
  country?: string | null;
  category?: string | null;
  platforms?: string[] | null;
  media?: any;
  [key: string]: any;
}

export interface CuelinksCampaignQueryParams {
  page?: number;
  per_page?: number;
  q?: string;
  access_status?: string;
  category?: string;
  country?: string;
  sort?: string;
  order?: 'asc' | 'desc';
}

export interface CuelinksCampaignsResponse {
  data: CuelinksApiCampaign[];
  meta: {
    total: number;
    page?: number;
    per_page?: number;
  };
}

export interface CuelinksCampaignDetailResponse {
  data: CuelinksApiCampaign;
}

export interface CuelinksRequestAccessResponse {
  success: boolean;
  message: string;
  status?: string;
  data?: any;
}

export interface CuelinksConvertLinkParams {
  url: string;
  subid?: string;
  shorten?: boolean;
}

export interface CuelinksConvertLinkData {
  original_url: string;
  tracking_url?: string;
  affiliate_url?: string;
  short_url?: string;
  campaign_id?: number;
  affiliated?: boolean;
  status?: string;
  [key: string]: any;
}

export interface CuelinksLinkConversionResult {
  originalUrl: string;
  affiliateUrl: string | null;
  affiliated: boolean;
  conversionStatus: 'CONVERTED' | 'NOT_AFFILIATED' | 'FAILED';
  errorCategory?: string;
  message?: string;
  raw?: any;
}

export interface CuelinksApiTransaction {
  id: number | string;
  campaign_id?: number | null;
  campaign_name?: string | null;
  campaign_type?: string | null;
  transaction_date: string;
  status: string; // 'pending' | 'validated' | 'payable' | 'claimed' | 'rejected' | string
  sale_amount?: string | number | null;
  user_commission?: string | number | null;
  currency?: string | null;
  merchant_ref_id?: string | null;
  order_id?: string | null;
  product_name?: string | null;
  category?: string | null;
  channel_id?: number | null;
  channel_name?: string | null;
  sub_id?: string | null;
  sub_id2?: string | null;
  sub_id3?: string | null;
  sub_id4?: string | null;
  sub_id5?: string | null;
  invoice_number?: string | null;
  created_at?: string | null;
  updated_at?: string | null;
  [key: string]: any;
}

export interface CuelinksTransactionQueryParams {
  start_date?: string;
  end_date?: string;
  status?: string;
  campaign_id?: number | string;
  sub_id?: string;
  invoice_number?: string;
  updated_since?: string;
  sort?: string;
  order?: 'asc' | 'desc';
  page?: number;
  per_page?: number;
}

export interface CuelinksTransactionsResponse {
  data: CuelinksApiTransaction[];
  meta: {
    total: number;
    page: number;
    per_page: number;
  };
}

export interface CuelinksTransactionDetailResponse {
  data: CuelinksApiTransaction;
}

export interface CuelinksPerformanceReportItem {
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

export interface CuelinksPerformanceReportQueryParams {
  start_date?: string;
  end_date?: string;
  campaign_id?: number | string;
  channel_id?: number | string;
  sort?: string;
  order?: 'asc' | 'desc';
  page?: number;
  per_page?: number;
}

export interface CuelinksPerformanceReportResponse {
  data: CuelinksPerformanceReportItem[];
  meta: {
    total: number;
    page: number;
    per_page: number;
  };
}

export interface CuelinksEarningsReportItem {
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

export interface CuelinksEarningsReportQueryParams {
  start_date?: string;
  end_date?: string;
  sort?: string;
  order?: 'asc' | 'desc';
  page?: number;
  per_page?: number;
}

export interface CuelinksEarningsReportResponse {
  data: CuelinksEarningsReportItem[];
  meta: {
    total: number;
    page: number;
    per_page: number;
  };
}

export interface CuelinksClientOptions {
  apiKey?: string;
  baseUrl?: string;
  timeoutMs?: number;
}

export class CuelinksClient {
  private apiKey?: string;
  private baseUrl: string;
  private timeoutMs: number;

  constructor(options?: CuelinksClientOptions) {
    this.apiKey = options?.apiKey ?? env.CUELINKS_API_KEY;
    this.baseUrl = (options?.baseUrl ?? env.CUELINKS_BASE_URL ?? 'https://developers.cuelinks.com/pub_api/v3').replace(/\/+$/, '');
    this.timeoutMs = options?.timeoutMs ?? 10000;
  }

  public isConfigured(): boolean {
    return Boolean(this.apiKey && this.apiKey.trim().length > 0);
  }

  public async ping(): Promise<CuelinksPingResult> {
    if (!this.isConfigured()) {
      return {
        configured: false,
        connected: false,
        errorCategory: 'NOT_CONFIGURED',
        message: 'Cuelinks API key is not configured in environment (CUELINKS_API_KEY)',
      };
    }

    const url = `${this.baseUrl}/ping`;
    const startTime = Date.now();

    try {
      const response = await fetch(url, {
        method: 'GET',
        headers: {
          Authorization: `Token ${this.apiKey}`,
          Accept: 'application/json',
        },
        signal: AbortSignal.timeout(this.timeoutMs),
      });

      const latencyMs = Date.now() - startTime;

      if (response.ok) {
        let data: any = null;
        try {
          data = await response.json();
        } catch {
          data = null;
        }

        return {
          configured: true,
          connected: true,
          statusCode: response.status,
          latencyMs,
          message: 'Successfully connected to Cuelinks V3 API',
          details: data ? this.sanitize(data) : undefined,
        };
      }

      let errorCategory: CuelinksErrorCategory;
      let errorMessage = `Cuelinks API returned status ${response.status}`;

      if (response.status === 401) {
        errorCategory = 'AUTHENTICATION_FAILED';
        errorMessage = 'Authentication failed: Invalid or expired Cuelinks API key';
      } else if (response.status === 403) {
        errorCategory = 'PERMISSION_DENIED';
        errorMessage = 'Permission denied: API key lacks required permissions';
      } else if (response.status === 429) {
        errorCategory = 'RATE_LIMITED';
        errorMessage = 'Rate limit exceeded for Cuelinks API';
      } else if (response.status >= 500) {
        errorCategory = 'SERVER_ERROR';
        errorMessage = `Cuelinks server error (${response.status})`;
      } else {
        errorCategory = 'UNKNOWN_ERROR';
      }

      return {
        configured: true,
        connected: false,
        statusCode: response.status,
        latencyMs,
        errorCategory,
        message: errorMessage,
      };
    } catch (err: any) {
      const latencyMs = Date.now() - startTime;
      if (err.name === 'TimeoutError' || err.name === 'AbortError') {
        return {
          configured: true,
          connected: false,
          latencyMs,
          errorCategory: 'TIMEOUT',
          message: `Request timed out after ${this.timeoutMs}ms`,
        };
      }

      return {
        configured: true,
        connected: false,
        latencyMs,
        errorCategory: 'NETWORK_ERROR',
        message: err.message ? this.sanitizeString(err.message) : 'Network connection error while contacting Cuelinks API',
      };
    }
  }

  public async getCampaigns(params: CuelinksCampaignQueryParams = {}): Promise<CuelinksCampaignsResponse> {
    if (!this.isConfigured()) {
      throw AppError.badRequest('Cuelinks API key is not configured in environment (CUELINKS_API_KEY)');
    }

    const searchParams = new URLSearchParams();
    if (params.page) searchParams.set('page', String(params.page));
    if (params.per_page) searchParams.set('per_page', String(params.per_page));
    if (params.q) searchParams.set('q', params.q);
    if (params.access_status) searchParams.set('access_status', params.access_status);
    if (params.category) searchParams.set('category', params.category);
    if (params.country) searchParams.set('country', params.country);
    if (params.sort) searchParams.set('sort', params.sort);
    if (params.order) searchParams.set('order', params.order);

    const query = searchParams.toString();
    const url = `${this.baseUrl}/campaigns${query ? `?${query}` : ''}`;

    const json = await this.makeRequest(url, { method: 'GET' });
    return {
      data: Array.isArray(json?.data) ? json.data : [],
      meta: {
        total: Number(json?.meta?.total ?? json?.data?.length ?? 0),
        page: params.page ?? 1,
        per_page: params.per_page ?? 20,
      },
    };
  }

  public async getCampaignById(id: number | string): Promise<CuelinksCampaignDetailResponse> {
    if (!this.isConfigured()) {
      throw AppError.badRequest('Cuelinks API key is not configured in environment (CUELINKS_API_KEY)');
    }

    const url = `${this.baseUrl}/campaigns/${id}`;
    const json = await this.makeRequest(url, { method: 'GET' });
    return {
      data: json?.data ?? json,
    };
  }

  public async requestAccess(id: number | string): Promise<CuelinksRequestAccessResponse> {
    if (!this.isConfigured()) {
      throw AppError.badRequest('Cuelinks API key is not configured in environment (CUELINKS_API_KEY)');
    }

    const url = `${this.baseUrl}/campaigns/${id}/request_access`;
    const json = await this.makeRequest(url, { method: 'POST' });
    return {
      success: true,
      message: json?.message ?? 'Access request submitted successfully to Cuelinks',
      status: json?.status ?? 'pending',
      data: this.sanitize(json),
    };
  }

  public async convertLink(params: CuelinksConvertLinkParams): Promise<CuelinksConvertLinkData> {
    if (!params.url || typeof params.url !== 'string') {
      throw AppError.badRequest('A valid URL is required for affiliate link conversion');
    }

    const trimmedUrl = params.url.trim();
    try {
      const parsed = new URL(trimmedUrl);
      if (!['http:', 'https:'].includes(parsed.protocol)) {
        throw new Error('Invalid URL protocol');
      }
    } catch {
      throw AppError.badRequest('Invalid target URL: malformed or unsupported scheme');
    }

    if (!this.isConfigured()) {
      throw AppError.badRequest('Cuelinks API key is not configured in environment (CUELINKS_API_KEY)');
    }

    const url = `${this.baseUrl}/links/convert`;
    const body: Record<string, any> = {
      url: trimmedUrl,
    };
    if (params.subid) {
      body.subid = params.subid;
    }
    if (typeof params.shorten === 'boolean') {
      body.shorten = params.shorten;
    }

    const json = await this.makeRequest(url, {
      method: 'POST',
      body: JSON.stringify(body),
      headers: {
        'Content-Type': 'application/json',
      },
    });

    return json?.data ?? json;
  }

  public async getTransactions(params: CuelinksTransactionQueryParams = {}): Promise<CuelinksTransactionsResponse> {
    if (!this.isConfigured()) {
      throw AppError.badRequest('Cuelinks API key is not configured in environment (CUELINKS_API_KEY)');
    }

    const query = new URLSearchParams();
    // When updated_since is provided, start_date and end_date are ignored per official docs
    if (params.updated_since) {
      query.set('updated_since', params.updated_since);
    } else {
      if (params.start_date) query.set('start_date', params.start_date);
      if (params.end_date) query.set('end_date', params.end_date);
    }

    if (params.status) query.set('status', params.status);
    if (params.campaign_id !== undefined && params.campaign_id !== null) {
      query.set('campaign_id', String(params.campaign_id));
    }
    if (params.sub_id) query.set('sub_id', params.sub_id);
    if (params.invoice_number) query.set('invoice_number', params.invoice_number);
    if (params.sort) query.set('sort', params.sort);
    if (params.order) query.set('order', params.order);
    if (params.page) query.set('page', String(params.page));

    // Limit per_page to documented maximum 500 (default 30)
    const perPage = params.per_page ? Math.min(Math.max(1, params.per_page), 500) : 30;
    query.set('per_page', String(perPage));

    const qs = query.toString();
    const url = `${this.baseUrl}/transactions${qs ? `?${qs}` : ''}`;
    const json = await this.makeRequest(url, { method: 'GET' });

    return {
      data: Array.isArray(json?.data) ? json.data : [],
      meta: {
        total: json?.meta?.total ?? (Array.isArray(json?.data) ? json.data.length : 0),
        page: json?.meta?.page ?? (params.page || 1),
        per_page: json?.meta?.per_page ?? perPage,
      },
    };
  }

  public async getTransactionById(id: number | string): Promise<CuelinksTransactionDetailResponse> {
    if (!this.isConfigured()) {
      throw AppError.badRequest('Cuelinks API key is not configured in environment (CUELINKS_API_KEY)');
    }

    if (!id) {
      throw AppError.badRequest('Transaction ID is required');
    }

    const url = `${this.baseUrl}/transactions/${encodeURIComponent(String(id))}`;
    const json = await this.makeRequest(url, { method: 'GET' });

    return {
      data: json?.data ?? json,
    };
  }

  public async getPerformanceReport(params: CuelinksPerformanceReportQueryParams = {}): Promise<CuelinksPerformanceReportResponse> {
    if (!this.isConfigured()) {
      throw AppError.badRequest('Cuelinks API key is not configured in environment (CUELINKS_API_KEY)');
    }

    const query = new URLSearchParams();
    if (params.start_date) query.set('start_date', params.start_date);
    if (params.end_date) query.set('end_date', params.end_date);
    if (params.campaign_id !== undefined && params.campaign_id !== null) {
      query.set('campaign_id', String(params.campaign_id));
    }
    if (params.channel_id !== undefined && params.channel_id !== null) {
      query.set('channel_id', String(params.channel_id));
    }
    if (params.sort) query.set('sort', params.sort);
    if (params.order) query.set('order', params.order);
    if (params.page) query.set('page', String(params.page));
    if (params.per_page) query.set('per_page', String(params.per_page));

    const qs = query.toString();
    const url = `${this.baseUrl}/reports/performance${qs ? `?${qs}` : ''}`;
    const json = await this.makeRequest(url, { method: 'GET' });

    return {
      data: Array.isArray(json?.data) ? json.data : [],
      meta: {
        total: json?.meta?.total ?? (Array.isArray(json?.data) ? json.data.length : 0),
        page: json?.meta?.page ?? (params.page || 1),
        per_page: json?.meta?.per_page ?? (params.per_page || 30),
      },
    };
  }

  public async getEarningsReport(params: CuelinksEarningsReportQueryParams = {}): Promise<CuelinksEarningsReportResponse> {
    if (!this.isConfigured()) {
      throw AppError.badRequest('Cuelinks API key is not configured in environment (CUELINKS_API_KEY)');
    }

    const query = new URLSearchParams();
    if (params.start_date) query.set('start_date', params.start_date);
    if (params.end_date) query.set('end_date', params.end_date);
    if (params.sort) query.set('sort', params.sort);
    if (params.order) query.set('order', params.order);
    if (params.page) query.set('page', String(params.page));
    if (params.per_page) query.set('per_page', String(params.per_page));

    const qs = query.toString();
    const url = `${this.baseUrl}/reports/earnings${qs ? `?${qs}` : ''}`;
    const json = await this.makeRequest(url, { method: 'GET' });

    return {
      data: Array.isArray(json?.data) ? json.data : [],
      meta: {
        total: json?.meta?.total ?? (Array.isArray(json?.data) ? json.data.length : 0),
        page: json?.meta?.page ?? (params.page || 1),
        per_page: json?.meta?.per_page ?? (params.per_page || 30),
      },
    };
  }

  private async makeRequest(url: string, init: RequestInit): Promise<any> {
    const headers: Record<string, string> = {
      Authorization: `Token ${this.apiKey}`,
      Accept: 'application/json',
      ...((init.headers as Record<string, string>) || {}),
    };

    try {
      const response = await fetch(url, {
        ...init,
        headers,
        signal: AbortSignal.timeout(this.timeoutMs),
      });

      if (!response.ok) {
        if (response.status === 401) {
          throw AppError.unauthorized('Cuelinks API authentication failed: Invalid or expired API key');
        }
        if (response.status === 403) {
          throw AppError.forbidden('Cuelinks API permission denied');
        }
        if (response.status === 404) {
          throw AppError.notFound('Campaign not found on Cuelinks');
        }
        if (response.status === 429) {
          throw new AppError('Cuelinks API rate limit exceeded', 429);
        }
        throw new AppError(`Cuelinks API error (${response.status})`, response.status >= 500 ? 502 : response.status);
      }

      return await response.json();
    } catch (err: any) {
      if (err instanceof AppError) throw err;
      if (err.name === 'TimeoutError' || err.name === 'AbortError') {
        throw new AppError(`Cuelinks API request timed out after ${this.timeoutMs}ms`, 504);
      }
      const safeMessage = err.message ? this.sanitizeString(err.message) : 'Error connecting to Cuelinks API';
      throw new AppError(safeMessage, 502);
    }
  }

  private sanitizeString(str: string): string {
    if (!this.apiKey) return str;
    return str.split(this.apiKey).join('[REDACTED]');
  }

  private sanitize(obj: any): any {
    if (!obj || typeof obj !== 'object') return obj;
    const copy = Array.isArray(obj) ? [...obj] : { ...obj };
    for (const key of Object.keys(copy)) {
      if (/token|key|secret|password|auth/i.test(key)) {
        copy[key] = '[REDACTED]';
      } else if (typeof copy[key] === 'object') {
        copy[key] = this.sanitize(copy[key]);
      }
    }
    return copy;
  }
}

export const cuelinksClient = new CuelinksClient();
