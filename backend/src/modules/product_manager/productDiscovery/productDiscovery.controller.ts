import { Request, Response, NextFunction } from 'express';
import { productDiscoveryService } from './productDiscovery.service.js';
import { ResponseFormatter } from '../../../utils/apiResponse.js';

export class ProductDiscoveryController {
  async searchDiscovered(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { keyword, category, merchant, limit } = req.query as any;
      const items = await productDiscoveryService.searchDiscovered({
        keyword,
        category,
        merchant,
        limit: Number(limit) || 20,
      });

      ResponseFormatter.success(res, 'Discovered products retrieved successfully', items);
    } catch (err) {
      next(err);
    }
  }

  async getDiscoveredItem(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const item = await productDiscoveryService.getDiscoveredItem(req.params.externalId);
      ResponseFormatter.success(res, 'Discovered product details retrieved successfully', item);
    } catch (err) {
      next(err);
    }
  }

  async importProduct(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const result = await productDiscoveryService.importProduct(
        req.body.externalId,
        req.user!.id
      );
      ResponseFormatter.created(res, result.message, {
        product: result.product,
        offer: result.offer,
      });
    } catch (err) {
      next(err);
    }
  }
}

export const productDiscoveryController = new ProductDiscoveryController();

