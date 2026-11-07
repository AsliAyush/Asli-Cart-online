import { Router } from 'express';
import { productController } from './product.controller.js';
import { authenticate } from '../../../middlewares/authMiddleware.js';
import { requirePermission } from '../../../middlewares/permissionMiddleware.js';
import { validateRequest } from '../../../middlewares/validateRequest.js';
import {
  listProductsQuerySchema,
  productIdParamSchema,
  createProductSchema,
  updateProductSchema,
  assignSmmSchema,
} from './product.validator.js';
import { MODULES, PERMISSIONS } from '../../../constants/modules.js';

const router = Router();

router.use(authenticate);

router.get(
  '/',
  requirePermission(MODULES.PRODUCT, PERMISSIONS.VIEW),
  validateRequest({ query: listProductsQuerySchema }),
  productController.listProducts
);

router.get(
  '/:id',
  requirePermission(MODULES.PRODUCT, PERMISSIONS.VIEW),
  validateRequest({ params: productIdParamSchema }),
  productController.getProductById
);

router.post(
  '/',
  requirePermission(MODULES.PRODUCT, PERMISSIONS.CREATE),
  validateRequest({ body: createProductSchema }),
  productController.createProduct
);

router.patch(
  '/:id',
  requirePermission(MODULES.PRODUCT, PERMISSIONS.UPDATE),
  validateRequest({ params: productIdParamSchema, body: updateProductSchema }),
  productController.updateProduct
);

router.patch(
  '/:id/submit-approval',
  requirePermission(MODULES.PRODUCT, PERMISSIONS.UPDATE),
  validateRequest({ params: productIdParamSchema }),
  productController.submitForApproval
);

router.delete(
  '/:id',
  requirePermission(MODULES.PRODUCT, PERMISSIONS.DELETE),
  validateRequest({ params: productIdParamSchema }),
  productController.archiveProduct
);

router.patch(
  '/:id/assign-smm',
  requirePermission(MODULES.PRODUCT, PERMISSIONS.UPDATE),
  validateRequest({ params: productIdParamSchema, body: assignSmmSchema }),
  productController.assignToSmm
);

export default router;

