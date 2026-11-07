import { Request, Response, NextFunction } from 'express';
import { customerAuthService } from '../../../services/customerAuth.service.js';
import { authService } from '../../../services/auth.service.js';
import { ResponseFormatter } from '../../../utils/apiResponse.js';
import { env } from '../../../config/env.js';

export class CustomerAuthController {
  async register(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const ipAddress = req.ip || req.socket.remoteAddress;
      const result = await customerAuthService.register(req.body, ipAddress);

      // Set HTTP-only refresh cookie
      res.cookie('refreshToken', result.refreshToken, {
        httpOnly: true,
        secure: env.NODE_ENV === 'production',
        sameSite: 'strict',
        maxAge: 7 * 24 * 60 * 60 * 1000,
      });

      ResponseFormatter.created(res, 'Customer registered successfully', result);
    } catch (error) {
      next(error);
    }
  }

  async login(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { email, password } = req.body;
      const ipAddress = req.ip || req.socket.remoteAddress;
      const result = await customerAuthService.login(email, password, ipAddress);

      res.cookie('refreshToken', result.refreshToken, {
        httpOnly: true,
        secure: env.NODE_ENV === 'production',
        sameSite: 'strict',
        maxAge: 7 * 24 * 60 * 60 * 1000,
      });

      ResponseFormatter.success(res, 'Login successful', result);
    } catch (error) {
      next(error);
    }
  }

  async refreshToken(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const rawRefreshToken = req.cookies?.refreshToken || req.body?.refreshToken;
      const result = await authService.refreshToken(rawRefreshToken);

      res.cookie('refreshToken', result.refreshToken, {
        httpOnly: true,
        secure: env.NODE_ENV === 'production',
        sameSite: 'strict',
        maxAge: 7 * 24 * 60 * 60 * 1000,
      });

      ResponseFormatter.success(res, 'Token refreshed successfully', result);
    } catch (error) {
      next(error);
    }
  }

  async logout(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const rawRefreshToken = req.cookies?.refreshToken || req.body?.refreshToken;
      const userId = (req as any).user?.userId;

      await authService.logout(rawRefreshToken, userId);

      res.clearCookie('refreshToken', {
        httpOnly: true,
        secure: env.NODE_ENV === 'production',
        sameSite: 'strict',
      });

      ResponseFormatter.success(res, 'Logged out successfully', null);
    } catch (error) {
      next(error);
    }
  }

  async getMe(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = (req as any).user?.userId;
      const user = await authService.getMe(userId);
      ResponseFormatter.success(res, 'User profile retrieved successfully', user);
    } catch (error) {
      next(error);
    }
  }
}

export const customerAuthController = new CustomerAuthController();
