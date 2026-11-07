import { Request, Response, NextFunction } from 'express';
import { AppError } from '../utils/appError.js';
import { ROLES } from '../constants/roles.js';
import prisma from '../infra/database/prisma.js';

export const requirePermission = (moduleName: string, permissionKey: string) => {
  return async (req: Request, _res: Response, next: NextFunction): Promise<void> => {
    try {
      if (!req.user) {
        throw AppError.unauthorized('Authentication required');
      }

      // SUPER_ADMIN has full system privileges across all modules
      if (req.user.roleName === ROLES.SUPER_ADMIN) {
        return next();
      }

      // Check database-backed role-permission mapping
      const hasPermission = await prisma.roleModulePermission.findFirst({
        where: {
          roleId: req.user.roleId,
          modulePermission: {
            permissionKey: permissionKey,
            module: {
              name: moduleName,
              isActive: true,
            },
          },
        },
      });

      if (!hasPermission) {
        throw AppError.forbidden(
          `Insufficient permissions: ${moduleName}.${permissionKey} is required`
        );
      }

      next();
    } catch (err) {
      next(err);
    }
  };
};

