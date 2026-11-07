import { Router } from 'express';
import { dashboardController } from './dashboard.controller.js';
import { authenticate } from '../../../middlewares/authMiddleware.js';
import { requirePermission } from '../../../middlewares/permissionMiddleware.js';
import { MODULES, PERMISSIONS } from '../../../constants/modules.js';

const router = Router();

router.use(authenticate);
router.use(requirePermission(MODULES.DASHBOARD, PERMISSIONS.VIEW));

router.get('/', dashboardController.getSummary);
router.get('/recent-activity', dashboardController.getRecentActivity);
router.get('/pending-reviews', dashboardController.getPendingReviews);

export default router;

