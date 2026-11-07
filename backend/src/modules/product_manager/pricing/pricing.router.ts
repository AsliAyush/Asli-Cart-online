import { Router } from 'express';
import { pricingController } from './pricing.controller.js';
import { authenticate } from '../../../middlewares/authMiddleware.js';
import { requirePermission } from '../../../middlewares/permissionMiddleware.js';
import { validateRequest } from '../../../middlewares/validateRequest.js';
import { calculatePricingSchema, productIdParamSchema } from './pricing.validator.js';
import { MODULES, PERMISSIONS } from '../../../constants/modules.js';

const router = Router();

router.use(authenticate);

router.post(
  '/calculate',
  requirePermission(MODULES.PRICING, PERMISSIONS.VIEW),
  validateRequest({ body: calculatePricingSchema }),
  pricingController.calculateDiscount
);

router.get(
  '/history/:productId',
  requirePermission(MODULES.PRICING, PERMISSIONS.VIEW),
  validateRequest({ params: productIdParamSchema }),
  pricingController.getPriceHistory
);

export default router;

