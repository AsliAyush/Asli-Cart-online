import { Request, Response, NextFunction } from 'express';
import { userService } from './user.service.js';
import { ResponseFormatter } from '../../../utils/apiResponse.js';

export class UserController {
  async listUsers(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { page, limit, roleId, isActive, search } = req.query as any;
      const result = await userService.listUsers({
        page: Number(page) || 1,
        limit: Number(limit) || 10,
        roleId,
        isActive,
        search,
      });

      ResponseFormatter.paginated(
        res,
        result.items,
        Number(page) || 1,
        Number(limit) || 10,
        result.total,
        'Users retrieved successfully'
      );
    } catch (err) {
      next(err);
    }
  }

  async getUserById(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const user = await userService.getUserById(req.params.id);
      ResponseFormatter.success(res, 'User details retrieved successfully', user);
    } catch (err) {
      next(err);
    }
  }

  async createEmployee(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const newUser = await userService.createEmployee(req.body, req.user!.id);
      ResponseFormatter.created(res, 'Employee account created successfully', newUser);
    } catch (err) {
      next(err);
    }
  }

  async updateEmployee(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const updatedUser = await userService.updateEmployee(
        req.params.id,
        req.body,
        req.user!.id
      );
      ResponseFormatter.success(res, 'Employee account updated successfully', updatedUser);
    } catch (err) {
      next(err);
    }
  }

  async updateUserStatus(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const updatedUser = await userService.updateUserStatus(
        req.params.id,
        req.body.isActive,
        req.user!.id
      );
      ResponseFormatter.success(
        res,
        `User successfully ${req.body.isActive ? 'activated' : 'deactivated'}`,
        updatedUser
      );
    } catch (err) {
      next(err);
    }
  }

  async updateUserRole(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const updatedUser = await userService.updateUserRole(
        req.params.id,
        req.body.roleId,
        req.user!.id
      );
      ResponseFormatter.success(res, 'User role updated successfully', updatedUser);
    } catch (err) {
      next(err);
    }
  }
}

export const userController = new UserController();

