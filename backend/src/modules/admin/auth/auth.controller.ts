import { Request, Response, NextFunction } from 'express';
import { authService } from './auth.service.js';
import { ResponseFormatter } from '../../../utils/apiResponse.js';
import { env } from '../../../config/env.js';

export class AuthController {
  async login(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { email, password } = req.body;
      const result = await authService.adminLogin(email, password, req.ip);

      // Set refresh token in secure HTTP-only cookie
      res.cookie('refreshToken', result.refreshToken, {
        httpOnly: true,
        secure: env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
      });

      ResponseFormatter.success(res, 'Admin authentication successful', result);
    } catch (err) {
      next(err);
    }
  }

  async refresh(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const rawRefreshToken = req.body?.refreshToken || req.cookies?.refreshToken;
      const result = await authService.refreshToken(rawRefreshToken);

      res.cookie('refreshToken', result.refreshToken, {
        httpOnly: true,
        secure: env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: 7 * 24 * 60 * 60 * 1000,
      });

      ResponseFormatter.success(res, 'Token refreshed successfully', result);
    } catch (err) {
      next(err);
    }
  }

  async logout(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const rawRefreshToken = req.body?.refreshToken || req.cookies?.refreshToken;
      await authService.logout(rawRefreshToken, req.user?.id);

      res.clearCookie('refreshToken');
      ResponseFormatter.success(res, 'Logged out successfully');
    } catch (err) {
      next(err);
    }
  }

  async me(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      if (!req.user) {
        return next(ResponseFormatter.error(res, 'Unauthorized', 401));
      }
      const userDetails = await authService.getMe(req.user.id);
      ResponseFormatter.success(res, 'Admin details retrieved successfully', userDetails);
    } catch (err) {
      next(err);
    }
  }
}

export const authController = new AuthController();

