import { Router } from 'express';
import { customerCartController } from './cart.controller.js';
import { authenticate } from '../../../middlewares/authMiddleware.js';
import { requirePermission } from '../../../middlewares/permissionMiddleware.js';
import { validateRequest } from '../../../middlewares/validateRequest.js';
import {
  addToCartSchema,
  updateCartItemSchema,
  cartItemIdParamSchema,
  merchantRedirectSchema,
} from './cart.validator.js';
import { MODULES, PERMISSIONS } from '../../../constants/modules.js';

const router = Router();

router.use(authenticate);

router.get(
  '/',
  requirePermission(MODULES.CART, PERMISSIONS.VIEW),
  customerCartController.getCart
);

router.post(
  '/items',
  requirePermission(MODULES.CART, PERMISSIONS.CREATE),
  validateRequest({ body: addToCartSchema }),
  customerCartController.addItem
);

router.patch(
  '/items/:itemId',
  requirePermission(MODULES.CART, PERMISSIONS.UPDATE),
  validateRequest({ params: cartItemIdParamSchema, body: updateCartItemSchema }),
  customerCartController.updateItemQuantity
);

router.delete(
  '/items/:itemId',
  requirePermission(MODULES.CART, PERMISSIONS.DELETE),
  validateRequest({ params: cartItemIdParamSchema }),
  customerCartController.removeItem
);

router.delete(
  '/clear',
  requirePermission(MODULES.CART, PERMISSIONS.DELETE),
  customerCartController.clearCart
);

router.post(
  '/merchant-redirect',
  requirePermission(MODULES.CART, PERMISSIONS.VIEW),
  validateRequest({ body: merchantRedirectSchema }),
  customerCartController.generateMerchantRedirect
);

export default router;

