import { Router } from 'express';
import { adminOfferController } from './offer.controller.js';
import { authenticate, requireRole } from '../../../middlewares/authMiddleware.js';
import { requirePermission } from '../../../middlewares/permissionMiddleware.js';
import { validateRequest } from '../../../middlewares/validateRequest.js';
import {
  listAdminOffersQuerySchema,
  adminOfferIdParamSchema,
  rejectOfferSchema,
} from './offer.validator.js';
import { MODULES, PERMISSIONS } from '../../../constants/modules.js';
import { ROLES } from '../../../constants/roles.js';

const router = Router();

// All admin offer routes require authentication and SUPER_ADMIN role
router.use(authenticate);
router.use(requireRole(ROLES.SUPER_ADMIN));

router.get(
  '/',
  requirePermission(MODULES.OFFER, PERMISSIONS.VIEW),
  validateRequest({ query: listAdminOffersQuerySchema }),
  adminOfferController.listOffers
);

router.get(
  '/:id',
  requirePermission(MODULES.OFFER, PERMISSIONS.VIEW),
  validateRequest({ params: adminOfferIdParamSchema }),
  adminOfferController.getOfferById
);

router.patch(
  '/:id/approve',
  requirePermission(MODULES.OFFER, PERMISSIONS.APPROVE),
  validateRequest({ params: adminOfferIdParamSchema }),
  adminOfferController.approveOffer
);

router.patch(
  '/:id/reject',
  requirePermission(MODULES.OFFER, PERMISSIONS.REJECT),
  validateRequest({ params: adminOfferIdParamSchema, body: rejectOfferSchema }),
  adminOfferController.rejectOffer
);

router.patch(
  '/:id/publish',
  requirePermission(MODULES.OFFER, PERMISSIONS.PUBLISH),
  validateRequest({ params: adminOfferIdParamSchema }),
  adminOfferController.publishOffer
);

router.patch(
  '/:id/pause',
  requirePermission(MODULES.OFFER, PERMISSIONS.UPDATE),
  validateRequest({ params: adminOfferIdParamSchema }),
  adminOfferController.pauseOffer
);

router.patch(
  '/:id/expire',
  requirePermission(MODULES.OFFER, PERMISSIONS.UPDATE),
  validateRequest({ params: adminOfferIdParamSchema }),
  adminOfferController.expireOffer
);

export default router;

