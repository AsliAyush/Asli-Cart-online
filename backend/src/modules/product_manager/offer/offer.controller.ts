import { Request, Response, NextFunction } from 'express';
import { offerService } from './offer.service.js';
import { ResponseFormatter } from '../../../utils/apiResponse.js';

export class OfferController {
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

  async createOffer(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const offer = await offerService.createOffer(req.body, req.user!.id);
      ResponseFormatter.created(res, 'Merchant offer created successfully', offer);
    } catch (err) {
      next(err);
    }
  }

  async updateOffer(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const updated = await offerService.updateOffer(req.params.id, req.body, req.user!.id);
      ResponseFormatter.success(res, 'Merchant offer updated successfully', updated);
    } catch (err) {
      next(err);
    }
  }

  async submitForApproval(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const updated = await offerService.submitForApproval(req.params.id, req.user!.id);
      ResponseFormatter.success(res, 'Merchant offer submitted for Admin approval', updated);
    } catch (err) {
      next(err);
    }
  }

  async updateStatus(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const updated = await offerService.updateStatus(
        req.params.id,
        req.body.status,
        req.user!.id,
        req.user!.roleName
      );
      ResponseFormatter.success(
        res,
        `Offer status updated to ${req.body.status}`,
        updated
      );
    } catch (err) {
      next(err);
    }
  }
}

export const offerController = new OfferController();

