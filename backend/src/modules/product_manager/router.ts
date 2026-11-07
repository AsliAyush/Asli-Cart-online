import { Router } from 'express';
import dashboardRouter from './dashboard/dashboard.router.js';
import productRouter from './product/product.router.js';
import discoveryRouter from './productDiscovery/productDiscovery.router.js';
import pricingRouter from './pricing/pricing.router.js';
import offerRouter from './offer/offer.router.js';
import affiliateRouter from './affiliate/affiliate.router.js';
import { authenticate, requireRole } from '../../middlewares/authMiddleware.js';
import { ROLES } from '../../constants/roles.js';

const router = Router();

// Enforce role-based access to Product Manager module
router.use(authenticate);
router.use(requireRole(ROLES.PRODUCT_MANAGER, ROLES.SUPER_ADMIN));

router.use('/dashboard', dashboardRouter);
router.use('/products', productRouter);
router.use('/discovery', discoveryRouter);
router.use('/pricing', pricingRouter);
router.use('/offers', offerRouter);
router.use('/affiliate', affiliateRouter);

export default router;
