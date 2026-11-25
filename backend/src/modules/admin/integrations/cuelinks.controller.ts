import { Request, Response, NextFunction } from 'express';
import { cuelinksService } from '../../../services/cuelinks.service.js';
import { cuelinksLinkConversionService } from '../../../services/cuelinksLinkConversion.service.js';
import { cuelinksTransactionSyncService } from '../../../services/cuelinksTransactionSync.service.js';
import { cuelinksReportService } from '../../../services/cuelinksReport.service.js';

export class CuelinksIntegrationController {
  public checkHealth = async (_req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const result = await cuelinksService.checkHealth();
      res.status(200).json({
        success: true,
        data: result,
      });
    } catch (err) {
      next(err);
    }
  };

  public listCampaigns = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const result = await cuelinksService.listCampaigns(req.query);
      res.status(200).json({
        success: true,
        data: result.campaigns,
        pagination: result.pagination,
      });
    } catch (err) {
      next(err);
    }
  };

  public getCampaignById = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const campaign = await cuelinksService.getCampaignById(req.params.id);
      res.status(200).json({
        success: true,
        data: campaign,
      });
    } catch (err) {
      next(err);
    }
  };

  public syncCampaigns = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const summary = await cuelinksService.syncCampaigns(req.body);
      res.status(200).json({
        success: true,
        message: 'Cuelinks campaigns synchronized successfully',
        data: summary,
      });
    } catch (err) {
      next(err);
    }
  };

  public requestAccess = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const result = await cuelinksService.requestAccess(req.params.id);
      res.status(200).json({
        success: true,
        message: result.message || 'Access request submitted to Cuelinks',
        data: result,
      });
    } catch (err) {
      next(err);
    }
  };

  public getSyncStatus = async (_req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const status = cuelinksService.getSyncStatus();
      res.status(200).json({
        success: true,
        data: status,
      });
    } catch (err) {
      next(err);
    }
  };

  public listAffiliateLinks = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const result = await cuelinksLinkConversionService.listAffiliateOffers(req.query);
      res.status(200).json({
        success: true,
        data: result.items,
        pagination: result.pagination,
      });
    } catch (err) {
      next(err);
    }
  };

  public getAffiliateLinkById = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const offer = await cuelinksLinkConversionService.getOfferAffiliateStatus(req.params.id);
      res.status(200).json({
        success: true,
        data: offer,
      });
    } catch (err) {
      next(err);
    }
  };

  public retryAffiliateLinkConversion = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const result = await cuelinksLinkConversionService.convertOffer(req.params.id, req.user!.id, req.user!.roleName);
      res.status(200).json({
        success: true,
        message: 'Affiliate link conversion executed',
        data: result,
      });
    } catch (err) {
      next(err);
    }
  };

  // Phase 4: Transactions & Commission Endpoints
  public listTransactions = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const result = await cuelinksTransactionSyncService.listTransactions(req.query);
      res.status(200).json({
        success: true,
        data: result.items,
        pagination: result.pagination,
      });
    } catch (err) {
      next(err);
    }
  };

  public getTransactionById = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const tx = await cuelinksTransactionSyncService.getTransactionById(req.params.id);
      res.status(200).json({
        success: true,
        data: tx,
      });
    } catch (err) {
      next(err);
    }
  };

  public getTransactionSyncStatus = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const status = await cuelinksTransactionSyncService.getSyncStatus();
      res.status(200).json({
        success: true,
        data: status,
      });
    } catch (err) {
      next(err);
    }
  };

  public syncTransactions = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const summary = await cuelinksTransactionSyncService.syncTransactions(req.body);
      res.status(200).json({
        success: true,
        message: 'Transactions synchronized successfully',
        data: summary,
      });
    } catch (err) {
      next(err);
    }
  };

  public getPerformanceReport = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const report = await cuelinksReportService.getPerformanceReport(req.query);
      res.status(200).json({
        success: true,
        data: report.data,
        pagination: report.meta,
      });
    } catch (err) {
      next(err);
    }
  };

  public getEarningsReport = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const report = await cuelinksReportService.getEarningsReport(req.query);
      res.status(200).json({
        success: true,
        data: report.data,
        pagination: report.meta,
      });
    } catch (err) {
      next(err);
    }
  };

  public getDashboardSummary = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const summary = await cuelinksReportService.getDashboardSummary();
      res.status(200).json({
        success: true,
        data: summary,
      });
    } catch (err) {
      next(err);
    }
  };
}

export const cuelinksController = new CuelinksIntegrationController();
