import { Router } from 'express';
import { customerOfferController } from './offer.controller.js';
import { validateRequest } from '../../../middlewares/validateRequest.js';
import {
  compareOffersParamsSchema,
  compareOffersQuerySchema,
  offerIdParamSchema,
} from './offer.validator.js';

const router = Router();

// Public offer discovery and comparison endpoints
router.get(
  '/compare/:productId',
  validateRequest({ params: compareOffersParamsSchema, query: compareOffersQuerySchema }),
  customerOfferController.compareOffers
);

router.get(
  '/:id',
  validateRequest({ params: offerIdParamSchema }),
  customerOfferController.getOfferById
);

export default router;

