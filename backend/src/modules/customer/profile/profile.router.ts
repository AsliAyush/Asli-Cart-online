import { Router } from 'express';
import { customerProfileController } from './profile.controller.js';
import { authenticate } from '../../../middlewares/authMiddleware.js';
import { requirePermission } from '../../../middlewares/permissionMiddleware.js';
import { validateRequest } from '../../../middlewares/validateRequest.js';
import { updateProfileSchema, changePasswordSchema } from './profile.validator.js';
import { MODULES, PERMISSIONS } from '../../../constants/modules.js';

const router = Router();

router.use(authenticate);

router.get(
  '/',
  requirePermission(MODULES.PROFILE, PERMISSIONS.VIEW),
  customerProfileController.getProfile
);

router.patch(
  '/',
  requirePermission(MODULES.PROFILE, PERMISSIONS.UPDATE),
  validateRequest({ body: updateProfileSchema }),
  customerProfileController.updateProfile
);

router.patch(
  '/change-password',
  requirePermission(MODULES.PROFILE, PERMISSIONS.UPDATE),
  validateRequest({ body: changePasswordSchema }),
  customerProfileController.changePassword
);

export default router;

