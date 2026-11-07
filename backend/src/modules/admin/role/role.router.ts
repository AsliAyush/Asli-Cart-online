import { Router } from 'express';
import { roleController } from './role.controller.js';
import { authenticate, requireRole } from '../../../middlewares/authMiddleware.js';
import { validateRequest } from '../../../middlewares/validateRequest.js';
import { roleIdParamSchema, updateRolePermissionsSchema } from './role.validator.js';
import { ROLES } from '../../../constants/roles.js';

const router = Router();

router.use(authenticate);
router.use(requireRole(ROLES.SUPER_ADMIN));

router.get('/', roleController.listRoles);

router.get(
  '/:id',
  validateRequest({ params: roleIdParamSchema }),
  roleController.getRoleById
);

router.get(
  '/:id/permissions',
  validateRequest({ params: roleIdParamSchema }),
  roleController.getRolePermissions
);

router.put(
  '/:id/permissions',
  validateRequest({ params: roleIdParamSchema, body: updateRolePermissionsSchema }),
  roleController.updateRolePermissions
);

export default router;

