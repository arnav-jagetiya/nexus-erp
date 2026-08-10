import { Request, Response, NextFunction } from 'express';
import { ProductService } from './product.service.js';
import { ApiResponse } from '../../utils/apiResponse.js';
import { parsePaginationParams } from '../../utils/pagination.js';

export class ProductController {
  static async create(req: Request, res: Response, next: NextFunction) {
    try {
      const product = await ProductService.createProduct(req.body);
      return ApiResponse.success(res, product, 'Product created successfully', 201);
    } catch (error) {
      next(error);
    }
  }

  static async list(req: Request, res: Response, next: NextFunction) {
    try {
      const pagination = parsePaginationParams(req);
      const filters = {
        search: req.query.search as string,
        category: req.query.category as string,
      };

      const result = await ProductService.getProducts(pagination, filters);
      return ApiResponse.paginated(res, result.data, result.meta, 'Products fetched successfully');
    } catch (error) {
      next(error);
    }
  }

  static async getById(req: Request, res: Response, next: NextFunction) {
    try {
      const product = await ProductService.getProductById(req.params.id);
      return ApiResponse.success(res, product, 'Product fetched successfully');
    } catch (error) {
      next(error);
    }
  }

  static async update(req: Request, res: Response, next: NextFunction) {
    try {
      const product = await ProductService.updateProduct(req.params.id, req.body);
      return ApiResponse.success(res, product, 'Product updated successfully');
    } catch (error) {
      next(error);
    }
  }

  static async delete(req: Request, res: Response, next: NextFunction) {
    try {
      await ProductService.deleteProduct(req.params.id);
      return ApiResponse.success(res, null, 'Product deleted successfully');
    } catch (error) {
      next(error);
    }
  }
}
