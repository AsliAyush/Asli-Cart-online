import { Router } from 'express';
import { customerProductController } from './product.controller.js';
import { validateRequest } from '../../../middlewares/validateRequest.js';
import {
  listCustomerProductsQuerySchema,
  productIdParamSchema,
  searchProductsQuerySchema,
} from './product.validator.js';

const router = Router();

// Public routes accessible to guests and customers alike
router.get(
  '/categories',
  customerProductController.getCategories
);

router.get(
  '/search',
  validateRequest({ query: searchProductsQuerySchema }),
  customerProductController.searchProducts
);

router.get(
  '/',
  validateRequest({ query: listCustomerProductsQuerySchema }),
  customerProductController.listProducts
);

router.get(
  '/:id',
  validateRequest({ params: productIdParamSchema }),
  customerProductController.getProductDetails
);

export default router;

