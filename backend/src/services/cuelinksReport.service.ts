import { cuelinksClient, CuelinksClient, CuelinksPerformanceReportQueryParams, CuelinksEarningsReportQueryParams } from '../infra/integrations/cuelinks/cuelinksClient.js';
import prisma from '../infra/database/prisma.js';
import { AppError } from '../utils/appError.js';

export interface CurrencyMetrics {
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

export interface DashboardSummaryResponse {
  dataSource: 'LIVE_API' | 'LOCAL_DB';
  isFallback: boolean;
  isLiveAvailable: boolean;
  isStale: boolean;
  lastSuccessfulSyncAt: Date | null;
  reportingPeriod: {
    startDate: string;
    endDate: string;
    days: number;
  };
  totalClicks: number;
  totalTransactions: number;
  currency: string; // Primary currency
  totalSaleAmount: string;
  totalCommission: string;
  pendingCommission: string;
  validatedCommission: string;
  payableCommission: string;
  claimedCommission: string;
  rejectedCommission: string;
  currencies: Record<string, CurrencyMetrics>;
}

export class CuelinksReportService {
  private client: CuelinksClient;

  constructor(clientInstance: CuelinksClient = cuelinksClient) {
    this.client = clientInstance;
  }

  /**
   * Helper to format Date to YYYY-MM-DD
   */
  private formatDate(date: Date): string {
    return date.toISOString().split('T')[0];
  }

  /**
   * Get Performance Report (Daily: clicks, transactions, commission, sale amount, EPC, conversion rate)
   * Max date range allowed: 90 days.
   */
  public async getPerformanceReport(params: CuelinksPerformanceReportQueryParams = {}) {
    const today = new Date();
    let startDate = params.start_date;
    let endDate = params.end_date;

    if (!startDate) {
      const past30 = new Date(today.getTime() - 30 * 24 * 60 * 60 * 1000);
      startDate = this.formatDate(past30);
    }

    if (!endDate) {
      endDate = this.formatDate(today);
    }

    // Validate 90-day maximum date range rule
    const startMs = new Date(startDate).getTime();
    const endMs = new Date(endDate).getTime();
    if (isNaN(startMs) || isNaN(endMs)) {
      throw AppError.badRequest('Invalid date format for performance report. Use YYYY-MM-DD.');
    }

    if (startMs > endMs) {
      throw AppError.badRequest('start_date cannot be after end_date');
    }

    const diffDays = Math.ceil((endMs - startMs) / (1000 * 60 * 60 * 24));
    if (diffDays > 90) {
      throw AppError.badRequest('Date range for performance report exceeds maximum allowed limit of 90 days');
    }

    return this.client.getPerformanceReport({
      ...params,
      start_date: startDate,
      end_date: endDate,
    });
  }

  /**
   * Get Monthly Earnings Report (pending, validated, payable, claimed, rejected, total)
   * Max date range allowed: 24 months.
   */
  public async getEarningsReport(params: CuelinksEarningsReportQueryParams = {}) {
    const today = new Date();
    let startDate = params.start_date;
    let endDate = params.end_date;

    if (!startDate) {
      const past12m = new Date(today);
      past12m.setMonth(past12m.getMonth() - 12);
      startDate = this.formatDate(past12m);
    }

    if (!endDate) {
      endDate = this.formatDate(today);
    }

    // Validate 24-month maximum date range rule
    const startMs = new Date(startDate).getTime();
    const endMs = new Date(endDate).getTime();
    if (isNaN(startMs) || isNaN(endMs)) {
      throw AppError.badRequest('Invalid date format for earnings report. Use YYYY-MM-DD.');
    }

    if (startMs > endMs) {
      throw AppError.badRequest('start_date cannot be after end_date');
    }

    const diffDays = Math.ceil((endMs - startMs) / (1000 * 60 * 60 * 24));
    if (diffDays > 732) {
      throw AppError.badRequest('Date range for earnings report exceeds maximum allowed limit of 24 months');
    }

    return this.client.getEarningsReport({
      ...params,
      start_date: startDate,
      end_date: endDate,
    });
  }

  /**
   * Aggregate complete Super Admin Dashboard Summary with multi-currency separation and data-source attribution.
   */
  public async getDashboardSummary(): Promise<DashboardSummaryResponse> {
    const lastSyncLog = await prisma.cuelinksTransactionSyncLog.findFirst({
      where: { status: 'COMPLETED' },
      orderBy: { completedAt: 'desc' },
    });

    const lastSuccessfulSyncAt = lastSyncLog?.completedAt || null;
    const isStale = !lastSuccessfulSyncAt || Date.now() - new Date(lastSuccessfulSyncAt).getTime() > 2 * 60 * 60 * 1000;

    const today = new Date();
    const past30 = new Date(today.getTime() - 30 * 24 * 60 * 60 * 1000);
    const reportingPeriod = {
      startDate: this.formatDate(past30),
      endDate: this.formatDate(today),
      days: 30,
    };

    let totalClicks = 0;
    let totalTransactions = 0;
    let dataSource: 'LIVE_API' | 'LOCAL_DB' = 'LIVE_API';
    let isFallback = false;

    // Currency buckets to prevent cross-currency aggregation
    const currencyBuckets: Record<string, {
      sale: number;
      comm: number;
      pending: number;
      validated: number;
      payable: number;
      claimed: number;
      rejected: number;
      count: number;
    }> = {};

    const getBucket = (curr: string) => {
      const c = curr && typeof curr === 'string' && curr.trim() ? curr.trim().toUpperCase() : 'UNKNOWN';
      if (!currencyBuckets[c]) {
        currencyBuckets[c] = {
          sale: 0,
          comm: 0,
          pending: 0,
          validated: 0,
          payable: 0,
          claimed: 0,
          rejected: 0,
          count: 0,
        };
      }
      return currencyBuckets[c];
    };

    try {
      if (!this.client.isConfigured()) {
        throw new Error('Cuelinks API key not configured');
      }

      // 1. Fetch 30-day performance report
      const perfReport = await this.getPerformanceReport({
        start_date: reportingPeriod.startDate,
        end_date: reportingPeriod.endDate,
      });
      const perfItems = perfReport.data || [];

      for (const item of perfItems) {
        totalClicks += Number(item.clicks) || 0;
        totalTransactions += Number(item.transactions) || 0;
        const bucket = getBucket(item.currency || 'INR');
        bucket.sale += Number(item.sale_amount) || 0;
        bucket.comm += Number(item.commission) || 0;
        bucket.count += Number(item.transactions) || 0;
      }

      // 2. Fetch earnings report for lifecycle status breakdown
      const earningsReport = await this.getEarningsReport();
      const earningsItems = earningsReport.data || [];

      for (const month of earningsItems) {
        const bucket = getBucket(month.currency || 'INR');
        bucket.pending += Number(month.pending) || 0;
        bucket.validated += Number(month.validated) || 0;
        bucket.payable += Number(month.payable) || 0;
        bucket.claimed += Number(month.claimed) || 0;
        bucket.rejected += Number(month.rejected) || 0;
      }

      dataSource = 'LIVE_API';
      isFallback = false;
    } catch {
      // 3. Fallback: compute strictly from local database without mixing currencies
      dataSource = 'LOCAL_DB';
      isFallback = true;

      const dbRecords = await prisma.cuelinksTransaction.findMany({
        select: {
          status: true,
          saleAmount: true,
          commissionAmount: true,
          currency: true,
        },
      });

      totalTransactions = dbRecords.length;

      for (const tx of dbRecords) {
        const curr = tx.currency || 'UNKNOWN';
        const bucket = getBucket(curr);
        const sale = tx.saleAmount ? Number(tx.saleAmount) : 0;
        const comm = tx.commissionAmount ? Number(tx.commissionAmount) : 0;

        bucket.sale += sale;
        bucket.comm += comm;
        bucket.count += 1;

        const st = (tx.status || '').toLowerCase();
        if (st === 'pending') bucket.pending += comm;
        else if (st === 'validated') bucket.validated += comm;
        else if (st === 'payable') bucket.payable += comm;
        else if (st === 'claimed') bucket.claimed += comm;
        else if (st === 'rejected') bucket.rejected += comm;
      }
    }

    // Map currency buckets to response map
    const currencies: Record<string, CurrencyMetrics> = {};
    for (const [curr, b] of Object.entries(currencyBuckets)) {
      currencies[curr] = {
        currency: curr,
        totalSaleAmount: b.sale.toFixed(2),
        totalCommission: b.comm.toFixed(2),
        pendingCommission: b.pending.toFixed(2),
        validatedCommission: b.validated.toFixed(2),
        payableCommission: b.payable.toFixed(2),
        claimedCommission: b.claimed.toFixed(2),
        rejectedCommission: b.rejected.toFixed(2),
        transactionCount: b.count,
      };
    }

    // Determine primary currency (prefer INR if present, otherwise largest bucket or UNKNOWN)
    const primaryCurrency = currencies['INR']
      ? 'INR'
      : Object.keys(currencies)[0] || 'UNKNOWN';

    const primaryMetrics = currencies[primaryCurrency] || {
      currency: primaryCurrency,
      totalSaleAmount: '0.00',
      totalCommission: '0.00',
      pendingCommission: '0.00',
      validatedCommission: '0.00',
      payableCommission: '0.00',
      claimedCommission: '0.00',
      rejectedCommission: '0.00',
      transactionCount: 0,
    };

    return {
      dataSource,
      isFallback,
      isLiveAvailable: !isFallback,
      isStale,
      lastSuccessfulSyncAt,
      reportingPeriod,
      totalClicks,
      totalTransactions,
      currency: primaryCurrency,
      totalSaleAmount: primaryMetrics.totalSaleAmount,
      totalCommission: primaryMetrics.totalCommission,
      pendingCommission: primaryMetrics.pendingCommission,
      validatedCommission: primaryMetrics.validatedCommission,
      payableCommission: primaryMetrics.payableCommission,
      claimedCommission: primaryMetrics.claimedCommission,
      rejectedCommission: primaryMetrics.rejectedCommission,
      currencies,
    };
  }
}

export const cuelinksReportService = new CuelinksReportService();
