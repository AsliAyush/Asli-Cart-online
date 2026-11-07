import { Request, Response, NextFunction } from 'express';
import { roleService } from './role.service.js';
import { ResponseFormatter } from '../../../utils/apiResponse.js';

export class RoleController {
  async listRoles(_req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const roles = await roleService.listRoles();
      ResponseFormatter.success(res, 'Roles retrieved successfully', roles);
    } catch (err) {
      next(err);
    }
  }

  async getRoleById(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const role = await roleService.getRoleById(req.params.id);
      ResponseFormatter.success(res, 'Role details retrieved successfully', role);
    } catch (err) {
      next(err);
    }
  }

  async getRolePermissions(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const permissions = await roleService.getRolePermissions(req.params.id);
      ResponseFormatter.success(
        res,
        'Role permissions retrieved successfully',
        permissions
      );
    } catch (err) {
      next(err);
    }
  }

  async updateRolePermissions(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const updatedPermissions = await roleService.updateRolePermissions(
        req.params.id,
        req.body.permissionIds,
        req.user!.id
      );
      ResponseFormatter.success(
        res,
        'Role permissions updated successfully',
        updatedPermissions
      );
    } catch (err) {
      next(err);
    }
  }
}

export const roleController = new RoleController();

