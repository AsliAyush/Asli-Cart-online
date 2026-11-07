import { Request, Response, NextFunction } from 'express';
import { auditLogService } from './auditLog.service.js';
import { ResponseFormatter } from '../../../utils/apiResponse.js';

export class AuditLogController {
  async listLogs(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { page, limit, moduleName, action, actorUserId } = req.query as any;
      const result = await auditLogService.listLogs({
        page: Number(page) || 1,
        limit: Number(limit) || 20,
        moduleName,
        action,
        actorUserId,
      });

      ResponseFormatter.paginated(
        res,
        result.items,
        Number(page) || 1,
        Number(limit) || 20,
        result.total,
        'Audit logs retrieved successfully'
      );
    } catch (err) {
      next(err);
    }
  }

  async getLogById(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const log = await auditLogService.getLogById(req.params.id);
      ResponseFormatter.success(res, 'Audit log details retrieved successfully', log);
    } catch (err) {
      next(err);
    }
  }
}

export const auditLogController = new AuditLogController();

