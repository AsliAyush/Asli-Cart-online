import { Request, Response, NextFunction } from 'express';
import { JwtUtil } from '../utils/jwt.js';
import { AppError } from '../utils/appError.js';
import prisma from '../infra/database/prisma.js';

export const authenticate = async (
  req: Request,
  _res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const authHeader = req.headers.authorization;
    let token: string | undefined;

    if (authHeader && authHeader.startsWith('Bearer ')) {
      token = authHeader.split(' ')[1];
    } else if (req.cookies && req.cookies.accessToken) {
      token = req.cookies.accessToken;
    }

    if (!token) {
      throw AppError.unauthorized('Authentication token is required');
    }

    const payload = JwtUtil.verifyAccessToken(token);

    // Verify user exists and is active in database
    const user = await prisma.user.findUnique({
      where: { id: payload.userId },
      include: {
        role: true,
      },
    });

    if (!user) {
      throw AppError.unauthorized('User associated with token no longer exists');
    }

    if (!user.isActive) {
      throw AppError.unauthorized('User account has been deactivated');
    }

    req.user = {
      id: user.id,
      userId: user.id,
      email: user.email,
      fullName: user.fullName,
      roleId: user.roleId,
      roleName: user.role.name,
      isActive: user.isActive,
    };

    next();
  } catch (err: any) {
    next(err);
  }
};

export const requireRole = (...allowedRoles: string[]) => {
  return (req: Request, _res: Response, next: NextFunction): void => {
    if (!req.user) {
      return next(AppError.unauthorized('Authentication required'));
    }

    if (!allowedRoles.includes(req.user.roleName)) {
      return next(
        AppError.forbidden(`Access restricted to roles: ${allowedRoles.join(', ')}`)
      );
    }

    next();
  };
};

