import { Router } from 'express';
import { affiliateController } from './affiliate.controller.js';
import { authenticate } from '../../../middlewares/authMiddleware.js';
import { requirePermission } from '../../../middlewares/permissionMiddleware.js';
import { validateRequest } from '../../../middlewares/validateRequest.js';
import {
  convertAffiliateSchema,
  listAffiliateLinksQuerySchema,
  linkIdParamSchema,
} from './affiliate.validator.js';
import { MODULES, PERMISSIONS } from '../../../constants/modules.js';

const router = Router();

router.use(authenticate);

router.post(
  '/convert',
  requirePermission(MODULES.AFFILIATE, PERMISSIONS.CREATE),
  validateRequest({ body: convertAffiliateSchema }),
  affiliateController.convertUrl
);

router.get(
  '/links',
  requirePermission(MODULES.AFFILIATE, PERMISSIONS.VIEW),
  validateRequest({ query: listAffiliateLinksQuerySchema }),
  affiliateController.listLinks
);

router.get(
  '/links/:id',
  requirePermission(MODULES.AFFILIATE, PERMISSIONS.VIEW),
  validateRequest({ params: linkIdParamSchema }),
  affiliateController.getLinkById
);

export default router;

