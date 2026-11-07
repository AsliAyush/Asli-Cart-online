import { Request, Response, NextFunction } from 'express';
import { customerProductService } from '../../../services/customerProduct.service.js';
import { ResponseFormatter } from '../../../utils/apiResponse.js';

export class CustomerProductController {
  async listProducts(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const result = await customerProductService.listProducts(req.query as any);
      ResponseFormatter.paginated(
        res,
        result.items,
        result.pagination.page,
        result.pagination.limit,
        result.pagination.total,
        'Products retrieved successfully'
      );
    } catch (error) {
      next(error);
    }
  }

  async getProductDetails(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id } = req.params;
      const product = await customerProductService.getProductDetails(id);
      ResponseFormatter.success(res, 'Product details retrieved successfully', product);
    } catch (error) {
      next(error);
    }
  }

  async searchProducts(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { q, page = 1, limit = 20 } = req.query as any;
      const result = await customerProductService.listProducts({
        search: q,
        page: Number(page),
        limit: Number(limit),
      });
      ResponseFormatter.paginated(
        res,
        result.items,
        result.pagination.page,
        result.pagination.limit,
        result.pagination.total,
        'Search results retrieved successfully'
      );
    } catch (error) {
      next(error);
    }
  }

  async getCategories(_req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const categories = await customerProductService.getCategories();
      ResponseFormatter.success(res, 'Categories retrieved successfully', categories);
    } catch (error) {
      next(error);
    }
  }
}

export const customerProductController = new CustomerProductController();
