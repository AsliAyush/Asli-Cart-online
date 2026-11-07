import { Router } from 'express';
import { customerDashboardController } from './dashboard.controller.js';
import { authenticate } from '../../../middlewares/authMiddleware.js';
import { requirePermission } from '../../../middlewares/permissionMiddleware.js';
import { MODULES, PERMISSIONS } from '../../../constants/modules.js';

const router = Router();

router.use(authenticate);

router.get(
  '/summary',
  requirePermission(MODULES.DASHBOARD, PERMISSIONS.VIEW),
  customerDashboardController.getSummary
);

export default router;

