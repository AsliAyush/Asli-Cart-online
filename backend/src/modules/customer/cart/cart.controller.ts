import { Request, Response, NextFunction } from 'express';
import { customerCartService } from '../../../services/customerCart.service.js';
import { ResponseFormatter } from '../../../utils/apiResponse.js';

export class CustomerCartController {
  async getCart(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const customerId = (req as any).user.userId;
      const cart = await customerCartService.getCart(customerId);
      ResponseFormatter.success(res, 'Shopping cart retrieved successfully', cart);
    } catch (error) {
      next(error);
    }
  }

  async addItem(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const customerId = (req as any).user.userId;
      const { offerId, quantity = 1 } = req.body;
      const item = await customerCartService.addToCart(customerId, offerId, quantity);
      ResponseFormatter.created(res, 'Item added to cart successfully', item);
    } catch (error) {
      next(error);
    }
  }

  async updateItemQuantity(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const customerId = (req as any).user.userId;
      const { itemId } = req.params;
      const { quantity } = req.body;
      const item = await customerCartService.updateItemQuantity(customerId, itemId, quantity);
      ResponseFormatter.success(res, 'Cart item quantity updated successfully', item);
    } catch (error) {
      next(error);
    }
  }

  async removeItem(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const customerId = (req as any).user.userId;
      const { itemId } = req.params;
      const result = await customerCartService.removeItem(customerId, itemId);
      ResponseFormatter.success(res, 'Cart item removed successfully', result);
    } catch (error) {
      next(error);
    }
  }

  async clearCart(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const customerId = (req as any).user.userId;
      const result = await customerCartService.clearCart(customerId);
      ResponseFormatter.success(res, 'Cart cleared successfully', result);
    } catch (error) {
      next(error);
    }
  }

  async generateMerchantRedirect(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const customerId = (req as any).user.userId;
      const { offerId, source } = req.body;
      const ipAddress = req.ip || req.socket.remoteAddress;
      const userAgent = req.headers['user-agent'];

      const result = await customerCartService.generateMerchantRedirect({
        customerId,
        offerId,
        source,
        ipAddress,
        userAgent,
      });

      ResponseFormatter.success(res, 'Merchant outbound redirect generated', result);
    } catch (error) {
      next(error);
    }
  }
}

export const customerCartController = new CustomerCartController();
