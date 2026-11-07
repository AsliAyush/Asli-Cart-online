import { Router } from 'express';
import authRouter from './auth/auth.router.js';
import profileRouter from './profile/profile.router.js';
import productRouter from './product/product.router.js';
import offerRouter from './offer/offer.router.js';
import cartRouter from './cart/cart.router.js';
import wishlistRouter from './wishlist/wishlist.router.js';
import dashboardRouter from './dashboard/dashboard.router.js';
import { customerRedirectService } from '../../services/customerRedirect.service.js';
import { ResponseFormatter } from '../../utils/apiResponse.js';

const router = Router();

// 1. Authentication endpoints (guest & customer)
router.use('/auth', authRouter);

// 2. Customer Profile
router.use('/profile', profileRouter);

// 3. Public Product Catalog & Browsing
router.use('/products', productRouter);

// 4. Public Merchant Offer Comparison
router.use('/offers', offerRouter);

// 5. Customer Shopping Cart & Retailer Checkout Preparation
router.use('/cart', cartRouter);

// 6. Outbound Merchant Redirect with Click Attribution Tracking
router.get('/redirect/:clickReference', async (req, res, next) => {
  try {
    const { clickReference } = req.params;
    const result = await customerRedirectService.resolveRedirect(clickReference);

    if (req.query.format === 'json') {
      ResponseFormatter.success(res, 'Merchant redirect resolved', result);
      return;
    }

    res.redirect(302, result.destinationUrl);
  } catch (error) {
    next(error);
  }
});

// 7. Customer Wishlist
router.use('/wishlist', wishlistRouter);

// 8. Customer Dashboard
router.use('/dashboard', dashboardRouter);

export default router;
