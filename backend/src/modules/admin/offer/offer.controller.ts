import { Request, Response, NextFunction } from 'express';
import { offerService } from '../../../services/offer.service.js';
import { ResponseFormatter } from '../../../utils/apiResponse.js';

export class AdminOfferController {
  async listOffers(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { page, limit, productId, merchantId, status, search } = req.query as any;
      const result = await offerService.listOffers({
        page: Number(page) || 1,
        limit: Number(limit) || 10,
        productId,
        merchantId,
        status,
        search,
      });

      ResponseFormatter.paginated(
        res,
        result.items,
        Number(page) || 1,
        Number(limit) || 10,
        result.total,
        'Merchant offers retrieved successfully'
      );
    } catch (err) {
      next(err);
    }
  }

  async getOfferById(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const offer = await offerService.getOfferById(req.params.id);
      ResponseFormatter.success(res, 'Offer details retrieved successfully', offer);
    } catch (err) {
      next(err);
    }
  }

  async approveOffer(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const updated = await offerService.approveOffer(req.params.id, req.user!.id);
      ResponseFormatter.success(res, 'Offer successfully approved', updated);
    } catch (err) {
      next(err);
    }
  }

  async rejectOffer(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const reason = req.body?.reason || req.body?.rejectionReason;
      const updated = await offerService.rejectOffer(req.params.id, reason, req.user!.id);
      ResponseFormatter.success(res, 'Offer successfully rejected', updated);
    } catch (err) {
      next(err);
    }
  }

  async publishOffer(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const updated = await offerService.publishOffer(req.params.id, req.user!.id);
      ResponseFormatter.success(res, 'Offer successfully published', updated);
    } catch (err) {
      next(err);
    }
  }

  async pauseOffer(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const updated = await offerService.pauseOffer(req.params.id, req.user!.id);
      ResponseFormatter.success(res, 'Offer successfully paused', updated);
    } catch (err) {
      next(err);
    }
  }

  async expireOffer(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const updated = await offerService.expireOffer(req.params.id, req.user!.id);
      ResponseFormatter.success(res, 'Offer successfully expired', updated);
    } catch (err) {
      next(err);
    }
  }
}

export const adminOfferController = new AdminOfferController();

