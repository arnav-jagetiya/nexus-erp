import { Request, Response, NextFunction } from 'express';
import { ChallanStatus } from '@prisma/client';
import { ChallanService } from './challan.service.js';
import { ApiResponse } from '../../utils/apiResponse.js';
import { parsePaginationParams } from '../../utils/pagination.js';

export class ChallanController {
  static async create(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = req.user!.id;
      const challan = await ChallanService.createChallan(req.body, userId);
      return ApiResponse.success(res, challan, 'Draft sales challan created successfully', 201);
    } catch (error) {
      next(error);
    }
  }

  static async list(req: Request, res: Response, next: NextFunction) {
    try {
      const pagination = parsePaginationParams(req);
      const filters = {
        search: req.query.search as string,
        status: req.query.status as ChallanStatus,
        customerId: req.query.customerId as string,
      };

      const result = await ChallanService.getChallans(pagination, filters);
      return ApiResponse.paginated(res, result.data, result.meta, 'Sales challans fetched successfully');
    } catch (error) {
      next(error);
    }
  }

  static async getById(req: Request, res: Response, next: NextFunction) {
    try {
      const challan = await ChallanService.getChallanById(req.params.id);
      return ApiResponse.success(res, challan, 'Sales challan fetched successfully');
    } catch (error) {
      next(error);
    }
  }

  static async update(req: Request, res: Response, next: NextFunction) {
    try {
      const challan = await ChallanService.updateDraftChallan(req.params.id, req.body);
      return ApiResponse.success(res, challan, 'Draft sales challan updated successfully');
    } catch (error) {
      next(error);
    }
  }

  static async cancel(req: Request, res: Response, next: NextFunction) {
    try {
      const challan = await ChallanService.cancelChallan(req.params.id);
      return ApiResponse.success(res, challan, 'Sales challan cancelled successfully');
    } catch (error) {
      next(error);
    }
  }

  static async confirm(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = req.user!.id;
      const challan = await ChallanService.confirmChallan(req.params.id, userId);
      return ApiResponse.success(res, challan, 'Sales challan confirmed and stock deducted successfully');
    } catch (error) {
      next(error);
    }
  }
}
