import { Router } from 'express';
import healthRouter from './health.router.js';
import adminRouter from '../modules/admin/router.js';
import productManagerRouter from '../modules/product_manager/router.js';
import socialMediaManagerRouter from '../modules/social_media_manager/router.js';
import customerRouter from '../modules/customer/router.js';

const router = Router();

// Health check endpoint: /api/v1/health
router.use('/health', healthRouter);

// Role-based modules
router.use('/admin', adminRouter);
router.use('/product-manager', productManagerRouter);
router.use('/social-media-manager', socialMediaManagerRouter);
router.use('/customer', customerRouter);

export default router;

