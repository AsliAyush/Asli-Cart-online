import { Request, Response, NextFunction } from 'express';
import { customerOfferService } from '../../../services/customerOffer.service.js';
import { ResponseFormatter } from '../../../utils/apiResponse.js';

export class CustomerOfferController {
  async compareOffers(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { productId } = req.params;
      const { sort = 'price_asc' } = req.query as any;
      const result = await customerOfferService.compareOffersForProduct(productId, sort);
      ResponseFormatter.success(res, 'Merchant offers compared successfully', result);
    } catch (error) {
      next(error);
    }
  }

  async getOfferById(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id } = req.params;
      const offer = await customerOfferService.getOfferById(id);
      ResponseFormatter.success(res, 'Offer details retrieved successfully', offer);
    } catch (error) {
      next(error);
    }
  }
}

export const customerOfferController = new CustomerOfferController();
