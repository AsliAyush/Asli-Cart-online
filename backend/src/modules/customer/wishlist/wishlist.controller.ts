import { Request, Response, NextFunction } from 'express';
import { customerWishlistService } from '../../../services/customerWishlist.service.js';
import { ResponseFormatter } from '../../../utils/apiResponse.js';

export class CustomerWishlistController {
  async getWishlist(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const customerId = (req as any).user.userId;
      const wishlist = await customerWishlistService.getWishlist(customerId);
      ResponseFormatter.success(res, 'Wishlist retrieved successfully', wishlist);
    } catch (error) {
      next(error);
    }
  }

  async addItem(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const customerId = (req as any).user.userId;
      const { productId } = req.body;
      const result = await customerWishlistService.addToWishlist(customerId, productId);
      ResponseFormatter.created(res, 'Product added to wishlist', result);
    } catch (error) {
      next(error);
    }
  }

  async removeItem(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const customerId = (req as any).user.userId;
      const { itemId } = req.params;
      const result = await customerWishlistService.removeFromWishlist(customerId, itemId);
      ResponseFormatter.success(res, 'Product removed from wishlist', result);
    } catch (error) {
      next(error);
    }
  }
}

export const customerWishlistController = new CustomerWishlistController();
