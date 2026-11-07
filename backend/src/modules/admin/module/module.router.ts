import { Router } from 'express';
import { moduleController } from './module.controller.js';
import { authenticate, requireRole } from '../../../middlewares/authMiddleware.js';
import { validateRequest } from '../../../middlewares/validateRequest.js';
import { moduleIdParamSchema } from './module.validator.js';
import { ROLES } from '../../../constants/roles.js';

const router = Router();

router.use(authenticate);
router.use(requireRole(ROLES.SUPER_ADMIN));

router.get('/', moduleController.listModules);

router.get(
  '/:id',
  validateRequest({ params: moduleIdParamSchema }),
  moduleController.getModuleById
);

router.get(
  '/:id/permissions',
  validateRequest({ params: moduleIdParamSchema }),
  moduleController.getModulePermissions
);

export default router;

