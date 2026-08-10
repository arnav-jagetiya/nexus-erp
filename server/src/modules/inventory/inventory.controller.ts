import { Request, Response, NextFunction } from 'express';
import { MovementType } from '@prisma/client';
import { InventoryService, StockStatus } from './inventory.service.js';
import { ApiResponse } from '../../utils/apiResponse.js';
import { parsePaginationParams } from '../../utils/pagination.js';

export class InventoryController {
  static async getOverview(req: Request, res: Response, next: NextFunction) {
    try {
      const pagination = parsePaginationParams(req);
      const filters = {
        search: req.query.search as string,
        category: req.query.category as string,
        stockStatus: req.query.stockStatus as StockStatus,
      };

      const result = await InventoryService.getInventoryOverview(pagination, filters);
      return ApiResponse.paginated(res, result.data, result.meta, 'Inventory overview fetched successfully');
    } catch (error) {
      next(error);
    }
  }

  static async listMovements(req: Request, res: Response, next: NextFunction) {
    try {
      const pagination = parsePaginationParams(req);
      const filters = {
        productId: req.query.productId as string,
        movementType: req.query.movementType as MovementType,
        from: req.query.from as string,
        to: req.query.to as string,
      };

      const result = await InventoryService.getMovements(pagination, filters);
      return ApiResponse.paginated(res, result.data, result.meta, 'Stock movements fetched successfully');
    } catch (error) {
      next(error);
    }
  }

  static async createMovement(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = req.user!.id;
      const result = await InventoryService.createMovement(req.body, userId);
      return ApiResponse.success(
        res,
        result,
        `Stock ${req.body.movementType} movement recorded successfully`,
        201
      );
    } catch (error) {
      next(error);
    }
  }
}
