import { Router } from 'express';
import { cuelinksController } from './cuelinks.controller.js';
import { authenticate, requireRole } from '../../../middlewares/authMiddleware.js';
import { validateRequest } from '../../../middlewares/validateRequest.js';
import { ROLES } from '../../../constants/roles.js';
import {
  listCampaignsSchema,
  syncCampaignsSchema,
  campaignIdParamSchema,
  transactionIdParamSchema,
  listTransactionsSchema,
  syncTransactionsSchema,
  performanceReportSchema,
  earningsReportSchema,
} from './cuelinks.validator.js';

const router = Router();

// Strict RBAC: Super Admin only across ALL Cuelinks integration endpoints
router.use(authenticate);
router.use(requireRole(ROLES.SUPER_ADMIN));

// Health diagnostic
router.get('/cuelinks/health', cuelinksController.checkHealth);

// Campaign synchronization & status
router.get('/cuelinks/campaigns/sync-status', cuelinksController.getSyncStatus);
router.post(
  '/cuelinks/campaigns/sync',
  validateRequest(syncCampaignsSchema),
  cuelinksController.syncCampaigns
);

// Campaign discovery & browsing
router.get(
  '/cuelinks/campaigns',
  validateRequest(listCampaignsSchema),
  cuelinksController.listCampaigns
);
router.get(
  '/cuelinks/campaigns/:id',
  validateRequest(campaignIdParamSchema),
  cuelinksController.getCampaignById
);

// Request access to private/restricted campaign
router.post(
  '/cuelinks/campaigns/:id/request-access',
  validateRequest(campaignIdParamSchema),
  cuelinksController.requestAccess
);

// Affiliate link management endpoints (Super Admin)
router.get(
  '/cuelinks/affiliate-links',
  cuelinksController.listAffiliateLinks
);
router.get(
  '/cuelinks/affiliate-links/:id',
  validateRequest(campaignIdParamSchema),
  cuelinksController.getAffiliateLinkById
);
router.post(
  '/cuelinks/affiliate-links/:id/retry',
  validateRequest(campaignIdParamSchema),
  cuelinksController.retryAffiliateLinkConversion
);

// Phase 4 & 4.1: Transaction & Commission Tracking Endpoints
// Note: Static subpaths (/sync-status and /sync) MUST be registered before /:id parameter to prevent route collision
router.get(
  '/cuelinks/transactions/sync-status',
  cuelinksController.getTransactionSyncStatus
);
router.post(
  '/cuelinks/transactions/sync',
  validateRequest(syncTransactionsSchema),
  cuelinksController.syncTransactions
);
router.get(
  '/cuelinks/transactions',
  validateRequest(listTransactionsSchema),
  cuelinksController.listTransactions
);
router.get(
  '/cuelinks/transactions/:id',
  validateRequest(transactionIdParamSchema),
  cuelinksController.getTransactionById
);

// Phase 4 & 4.1: Performance & Earnings Reports
router.get(
  '/cuelinks/reports/performance',
  validateRequest(performanceReportSchema),
  cuelinksController.getPerformanceReport
);
router.get(
  '/cuelinks/reports/earnings',
  validateRequest(earningsReportSchema),
  cuelinksController.getEarningsReport
);
router.get(
  '/cuelinks/dashboard-summary',
  cuelinksController.getDashboardSummary
);

export default router;
