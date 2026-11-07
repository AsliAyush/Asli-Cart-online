import { Router } from 'express';
import { authController } from './auth.controller.js';
import { validateRequest } from '../../../middlewares/validateRequest.js';
import { authenticate, requireRole } from '../../../middlewares/authMiddleware.js';
import { loginRateLimiter } from '../../../middlewares/rateLimiter.js';
import { adminLoginSchema, refreshTokenSchema, logoutSchema } from './auth.validator.js';
import { ROLES } from '../../../constants/roles.js';

const router = Router();

router.post(
  '/login',
  loginRateLimiter,
  validateRequest({ body: adminLoginSchema }),
  authController.login
);

router.post(
  '/refresh',
  validateRequest({ body: refreshTokenSchema }),
  authController.refresh
);

router.post(
  '/logout',
  validateRequest({ body: logoutSchema }),
  authController.logout
);

router.get(
  '/me',
  authenticate,
  requireRole(ROLES.SUPER_ADMIN),
  authController.me
);

export default router;

