import { Request, Response, NextFunction } from 'express';
import { pricingService } from './pricing.service.js';
import { ResponseFormatter } from '../../../utils/apiResponse.js';

export class PricingController {
  async calculateDiscount(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { originalPrice, sellingPrice } = req.body;
      const result = pricingService.calculateDiscount(originalPrice, sellingPrice);
      ResponseFormatter.success(res, 'Price calculation successful', result);
    } catch (err) {
      next(err);
    }
  }

  async getPriceHistory(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const limit = Number(req.query.limit) || 20;
      const history = await pricingService.getPriceHistory(req.params.productId, limit);
      ResponseFormatter.success(res, 'Price history retrieved successfully', history);
    } catch (err) {
      next(err);
    }
  }
}

export const pricingController = new PricingController();

