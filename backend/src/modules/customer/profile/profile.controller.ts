import { Request, Response, NextFunction } from 'express';
import { customerProfileService } from '../../../services/customerProfile.service.js';
import { ResponseFormatter } from '../../../utils/apiResponse.js';

export class CustomerProfileController {
  async getProfile(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = (req as any).user.userId;
      const profile = await customerProfileService.getProfile(userId);
      ResponseFormatter.success(res, 'Profile retrieved successfully', profile);
    } catch (error) {
      next(error);
    }
  }

  async updateProfile(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = (req as any).user.userId;
      const updated = await customerProfileService.updateProfile(userId, req.body);
      ResponseFormatter.success(res, 'Profile updated successfully', updated);
    } catch (error) {
      next(error);
    }
  }

  async changePassword(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = (req as any).user.userId;
      const { currentPassword, newPassword } = req.body;
      const result = await customerProfileService.changePassword(userId, currentPassword, newPassword);

      res.clearCookie('refreshToken', {
        httpOnly: true,
        sameSite: 'strict',
      });

      ResponseFormatter.success(res, 'Password changed successfully', result);
    } catch (error) {
      next(error);
    }
  }
}

export const customerProfileController = new CustomerProfileController();
