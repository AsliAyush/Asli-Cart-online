import { Router } from 'express';
import { customerAuthController } from './auth.controller.js';
import { validateRequest } from '../../../middlewares/validateRequest.js';
import { authenticate } from '../../../middlewares/authMiddleware.js';
import {
  registerCustomerSchema,
  loginCustomerSchema,
  refreshTokenSchema,
} from './auth.validator.js';

const router = Router();

router.post(
  '/register',
  validateRequest({ body: registerCustomerSchema }),
  customerAuthController.register
);

router.post(
  '/login',
  validateRequest({ body: loginCustomerSchema }),
  customerAuthController.login
);

router.post(
  '/refresh',
  validateRequest({ body: refreshTokenSchema }),
  customerAuthController.refreshToken
);

router.post(
  '/logout',
  customerAuthController.logout
);

router.get(
  '/me',
  authenticate,
  customerAuthController.getMe
);

export default router;

