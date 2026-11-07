import { Request, Response, NextFunction } from 'express';
import { productManagerDashboardService } from './dashboard.service.js';
import { ResponseFormatter } from '../../../utils/apiResponse.js';

export class DashboardController {
  async getSummary(_req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const summary = await productManagerDashboardService.getSummary();
      ResponseFormatter.success(res, 'Product Manager dashboard summary retrieved', summary);
    } catch (err) {
      next(err);
    }
  }

  async getRecentActivity(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const limit = Number(req.query.limit) || 10;
      const activity = await productManagerDashboardService.getRecentActivity(limit);
      ResponseFormatter.success(res, 'Recent product and offer activity retrieved', activity);
    } catch (err) {
      next(err);
    }
  }

  async getPendingReviews(_req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const pending = await productManagerDashboardService.getPendingReviews();
      ResponseFormatter.success(res, 'Pending reviews retrieved', pending);
    } catch (err) {
      next(err);
    }
  }
}

export const dashboardController = new DashboardController();

