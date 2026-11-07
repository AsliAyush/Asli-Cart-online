import { Request, Response, NextFunction } from 'express';
import { productService } from './product.service.js';
import { ResponseFormatter } from '../../../utils/apiResponse.js';

export class ProductController {
  async listProducts(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { page, limit, categoryId, status, brand, search, isAssignedToSmm } = req.query as any;
      const result = await productService.listProducts({
        page: Number(page) || 1,
        limit: Number(limit) || 10,
        categoryId,
        status,
        brand,
        search,
        isAssignedToSmm,
      });

      ResponseFormatter.paginated(
        res,
        result.items,
        Number(page) || 1,
        Number(limit) || 10,
        result.total,
        'Products retrieved successfully'
      );
    } catch (err) {
      next(err);
    }
  }

  async getProductById(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const product = await productService.getProductById(req.params.id);
      ResponseFormatter.success(res, 'Product details retrieved successfully', product);
    } catch (err) {
      next(err);
    }
  }

  async createProduct(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const product = await productService.createProduct(req.body, req.user!.id);
      ResponseFormatter.created(res, 'Product created successfully', product);
    } catch (err) {
      next(err);
    }
  }

  async updateProduct(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const updated = await productService.updateProduct(req.params.id, req.body, req.user!.id);
      ResponseFormatter.success(res, 'Product updated successfully', updated);
    } catch (err) {
      next(err);
    }
  }

  async submitForApproval(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const updated = await productService.submitForApproval(req.params.id, req.user!.id);
      ResponseFormatter.success(res, 'Product submitted for Admin review', updated);
    } catch (err) {
      next(err);
    }
  }

  async archiveProduct(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const archived = await productService.archiveProduct(req.params.id, req.user!.id);
      ResponseFormatter.success(res, 'Product archived successfully', archived);
    } catch (err) {
      next(err);
    }
  }

  async assignToSmm(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const updated = await productService.assignToSmm(
        req.params.id,
        req.body.isAssigned,
        req.user!.id
      );
      ResponseFormatter.success(
        res,
        `Product successfully ${req.body.isAssigned ? 'assigned to' : 'unassigned from'} Social Media Manager`,
        updated
      );
    } catch (err) {
      next(err);
    }
  }
}

export const productController = new ProductController();

