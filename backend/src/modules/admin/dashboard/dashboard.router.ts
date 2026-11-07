import { Router } from 'express';
import { dashboardController } from './dashboard.controller.js';
import { authenticate } from '../../../middlewares/authMiddleware.js';
import { requirePermission } from '../../../middlewares/permissionMiddleware.js';
import { MODULES, PERMISSIONS } from '../../../constants/modules.js';

const router = Router();

router.use(authenticate);

router.get(
  '/',
  requirePermission(MODULES.DASHBOARD, PERMISSIONS.VIEW),
  dashboardController.getSummary
);

export default router;

