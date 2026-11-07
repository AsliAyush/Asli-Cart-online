import { Request, Response, NextFunction } from 'express';
import { customerDashboardService } from '../../../services/customerDashboard.service.js';
import { ResponseFormatter } from '../../../utils/apiResponse.js';

export class CustomerDashboardController {
  async getSummary(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const customerId = (req as any).user.userId;
      const summary = await customerDashboardService.getSummary(customerId);
      ResponseFormatter.success(res, 'Customer dashboard summary retrieved successfully', summary);
    } catch (error) {
      next(error);
    }
  }
}

export const customerDashboardController = new CustomerDashboardController();
