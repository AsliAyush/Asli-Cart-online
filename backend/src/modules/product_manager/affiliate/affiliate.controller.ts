import { Request, Response, NextFunction } from 'express';
import { affiliateService } from './affiliate.service.js';
import { ResponseFormatter } from '../../../utils/apiResponse.js';

export class AffiliateController {
  async convertUrl(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const link = await affiliateService.convertUrl({
        originalUrl: req.body.originalUrl,
        offerId: req.body.offerId,
        subId1: req.body.subId1,
        subId2: req.body.subId2,
        actorId: req.user!.id,
      });

      ResponseFormatter.created(res, 'Affiliate link generated successfully', link);
    } catch (err) {
      next(err);
    }
  }

  async listLinks(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { page, limit, offerId, provider, status } = req.query as any;
      const result = await affiliateService.listLinks({
        page: Number(page) || 1,
        limit: Number(limit) || 20,
        offerId,
        provider,
        status,
      });

      ResponseFormatter.paginated(
        res,
        result.items,
        Number(page) || 1,
        Number(limit) || 20,
        result.total,
        'Affiliate links retrieved successfully'
      );
    } catch (err) {
      next(err);
    }
  }

  async getLinkById(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const link = await affiliateService.getLinkById(req.params.id);
      ResponseFormatter.success(res, 'Affiliate link details retrieved successfully', link);
    } catch (err) {
      next(err);
    }
  }
}

export const affiliateController = new AffiliateController();

