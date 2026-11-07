import { Router } from 'express';
import { productDiscoveryController } from './productDiscovery.controller.js';
import { authenticate } from '../../../middlewares/authMiddleware.js';
import { requirePermission } from '../../../middlewares/permissionMiddleware.js';
import { validateRequest } from '../../../middlewares/validateRequest.js';
import {
  searchDiscoveryQuerySchema,
  externalIdParamSchema,
  importProductSchema,
} from './productDiscovery.validator.js';
import { MODULES, PERMISSIONS } from '../../../constants/modules.js';

const router = Router();

router.use(authenticate);

router.get(
  '/',
  requirePermission(MODULES.PRODUCT_DISCOVERY, PERMISSIONS.VIEW),
  validateRequest({ query: searchDiscoveryQuerySchema }),
  productDiscoveryController.searchDiscovered
);

router.get(
  '/:externalId',
  requirePermission(MODULES.PRODUCT_DISCOVERY, PERMISSIONS.VIEW),
  validateRequest({ params: externalIdParamSchema }),
  productDiscoveryController.getDiscoveredItem
);

router.post(
  '/import',
  requirePermission(MODULES.PRODUCT_DISCOVERY, PERMISSIONS.CREATE),
  validateRequest({ body: importProductSchema }),
  productDiscoveryController.importProduct
);

export default router;

