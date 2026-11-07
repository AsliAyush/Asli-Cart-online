import { Router } from 'express';
import { userController } from './user.controller.js';
import { authenticate } from '../../../middlewares/authMiddleware.js';
import { requirePermission } from '../../../middlewares/permissionMiddleware.js';
import { validateRequest } from '../../../middlewares/validateRequest.js';
import {
  listUsersQuerySchema,
  userIdParamSchema,
  createEmployeeSchema,
  updateEmployeeSchema,
  updateUserStatusSchema,
  updateUserRoleSchema,
} from './user.validator.js';
import { MODULES, PERMISSIONS } from '../../../constants/modules.js';

const router = Router();

// All user management routes require authentication
router.use(authenticate);

router.get(
  '/',
  requirePermission(MODULES.USER, PERMISSIONS.VIEW),
  validateRequest({ query: listUsersQuerySchema }),
  userController.listUsers
);

router.get(
  '/:id',
  requirePermission(MODULES.USER, PERMISSIONS.VIEW),
  validateRequest({ params: userIdParamSchema }),
  userController.getUserById
);

router.post(
  '/',
  requirePermission(MODULES.USER, PERMISSIONS.CREATE),
  validateRequest({ body: createEmployeeSchema }),
  userController.createEmployee
);

router.patch(
  '/:id',
  requirePermission(MODULES.USER, PERMISSIONS.UPDATE),
  validateRequest({ params: userIdParamSchema, body: updateEmployeeSchema }),
  userController.updateEmployee
);

router.patch(
  '/:id/status',
  requirePermission(MODULES.USER, PERMISSIONS.UPDATE),
  validateRequest({ params: userIdParamSchema, body: updateUserStatusSchema }),
  userController.updateUserStatus
);

router.patch(
  '/:id/role',
  requirePermission(MODULES.USER, PERMISSIONS.ASSIGN),
  validateRequest({ params: userIdParamSchema, body: updateUserRoleSchema }),
  userController.updateUserRole
);

export default router;

