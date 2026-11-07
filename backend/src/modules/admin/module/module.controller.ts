import { Request, Response, NextFunction } from 'express';
import { moduleService } from './module.service.js';
import { ResponseFormatter } from '../../../utils/apiResponse.js';

export class ModuleController {
  async listModules(_req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const modules = await moduleService.listModules();
      ResponseFormatter.success(res, 'Modules retrieved successfully', modules);
    } catch (err) {
      next(err);
    }
  }

  async getModuleById(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const mod = await moduleService.getModuleById(req.params.id);
      ResponseFormatter.success(res, 'Module details retrieved successfully', mod);
    } catch (err) {
      next(err);
    }
  }

  async getModulePermissions(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const permissions = await moduleService.getModulePermissions(req.params.id);
      ResponseFormatter.success(
        res,
        'Module permissions retrieved successfully',
        permissions
      );
    } catch (err) {
      next(err);
    }
  }
}

export const moduleController = new ModuleController();

