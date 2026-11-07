import { Router } from 'express';
import { offerController } from './offer.controller.js';
import { authenticate } from '../../../middlewares/authMiddleware.js';
import { requirePermission } from '../../../middlewares/permissionMiddleware.js';
import { validateRequest } from '../../../middlewares/validateRequest.js';
import {
  listOffersQuerySchema,
  offerIdParamSchema,
  createOfferSchema,
  updateOfferSchema,
  updateOfferStatusSchema,
} from './offer.validator.js';
import { MODULES, PERMISSIONS } from '../../../constants/modules.js';

const router = Router();

router.use(authenticate);

router.get(
  '/',
  requirePermission(MODULES.OFFER, PERMISSIONS.VIEW),
  validateRequest({ query: listOffersQuerySchema }),
  offerController.listOffers
);

router.get(
  '/:id',
  requirePermission(MODULES.OFFER, PERMISSIONS.VIEW),
  validateRequest({ params: offerIdParamSchema }),
  offerController.getOfferById
);

router.post(
  '/',
  requirePermission(MODULES.OFFER, PERMISSIONS.CREATE),
  validateRequest({ body: createOfferSchema }),
  offerController.createOffer
);

router.patch(
  '/:id',
  requirePermission(MODULES.OFFER, PERMISSIONS.UPDATE),
  validateRequest({ params: offerIdParamSchema, body: updateOfferSchema }),
  offerController.updateOffer
);

router.patch(
  '/:id/submit-approval',
  requirePermission(MODULES.OFFER, PERMISSIONS.UPDATE),
  validateRequest({ params: offerIdParamSchema }),
  offerController.submitForApproval
);

router.patch(
  '/:id/status',
  requirePermission(MODULES.OFFER, PERMISSIONS.UPDATE),
  validateRequest({ params: offerIdParamSchema, body: updateOfferStatusSchema }),
  offerController.updateStatus
);

export default router;

