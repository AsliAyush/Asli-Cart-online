import { Router } from 'express';
import { auditLogController } from './auditLog.controller.js';
import { authenticate } from '../../../middlewares/authMiddleware.js';
import { requirePermission } from '../../../middlewares/permissionMiddleware.js';
import { validateRequest } from '../../../middlewares/validateRequest.js';
import { listAuditLogsQuerySchema, auditLogIdParamSchema } from './auditLog.validator.js';
import { MODULES, PERMISSIONS } from '../../../constants/modules.js';

const router = Router();

router.use(authenticate);

router.get(
  '/',
  requirePermission(MODULES.AUDIT_LOG, PERMISSIONS.VIEW),
  validateRequest({ query: listAuditLogsQuerySchema }),
  auditLogController.listLogs
);

router.get(
  '/:id',
  requirePermission(MODULES.AUDIT_LOG, PERMISSIONS.VIEW),
  validateRequest({ params: auditLogIdParamSchema }),
  auditLogController.getLogById
);

export default router;

