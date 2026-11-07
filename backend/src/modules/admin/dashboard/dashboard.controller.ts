import { Request, Response, NextFunction } from 'express';
import { dashboardService } from './dashboard.service.js';
import { ResponseFormatter } from '../../../utils/apiResponse.js';

export class DashboardController {
  async getSummary(_req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const summary = await dashboardService.getSummary();
      ResponseFormatter.success(res, 'Dashboard summary retrieved successfully', summary);
    } catch (err) {
      next(err);
    }
  }
}

export const dashboardController = new DashboardController();

