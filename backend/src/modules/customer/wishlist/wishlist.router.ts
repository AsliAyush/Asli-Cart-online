import { Router } from 'express';
import { customerWishlistController } from './wishlist.controller.js';
import { authenticate } from '../../../middlewares/authMiddleware.js';
import { requirePermission } from '../../../middlewares/permissionMiddleware.js';
import { validateRequest } from '../../../middlewares/validateRequest.js';
import { addToWishlistSchema, wishlistItemIdParamSchema } from './wishlist.validator.js';
import { MODULES, PERMISSIONS } from '../../../constants/modules.js';

const router = Router();

router.use(authenticate);

router.get(
  '/',
  requirePermission(MODULES.WISHLIST, PERMISSIONS.VIEW),
  customerWishlistController.getWishlist
);

router.post(
  '/items',
  requirePermission(MODULES.WISHLIST, PERMISSIONS.CREATE),
  validateRequest({ body: addToWishlistSchema }),
  customerWishlistController.addItem
);

router.delete(
  '/items/:itemId',
  requirePermission(MODULES.WISHLIST, PERMISSIONS.DELETE),
  validateRequest({ params: wishlistItemIdParamSchema }),
  customerWishlistController.removeItem
);

export default router;

