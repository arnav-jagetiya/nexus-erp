import { Request, Response, NextFunction } from 'express';
import { CustomerStatus, CustomerType } from '@prisma/client';
import { CustomerService } from './customer.service.js';
import { ApiResponse } from '../../utils/apiResponse.js';
import { parsePaginationParams } from '../../utils/pagination.js';

export class CustomerController {
  static async create(req: Request, res: Response, next: NextFunction) {
    try {
      const customer = await CustomerService.createCustomer(req.body);
      return ApiResponse.success(res, customer, 'Customer created successfully', 201);
    } catch (error) {
      next(error);
    }
  }

  static async list(req: Request, res: Response, next: NextFunction) {
    try {
      const pagination = parsePaginationParams(req);
      const filters = {
        search: req.query.search as string,
        status: req.query.status as CustomerStatus,
        customerType: req.query.customerType as CustomerType,
      };

      const result = await CustomerService.getCustomers(pagination, filters);
      return ApiResponse.paginated(res, result.data, result.meta, 'Customers fetched successfully');
    } catch (error) {
      next(error);
    }
  }

  static async getById(req: Request, res: Response, next: NextFunction) {
    try {
      const customer = await CustomerService.getCustomerById(req.params.id);
      return ApiResponse.success(res, customer, 'Customer fetched successfully');
    } catch (error) {
      next(error);
    }
  }

  static async update(req: Request, res: Response, next: NextFunction) {
    try {
      const customer = await CustomerService.updateCustomer(req.params.id, req.body);
      return ApiResponse.success(res, customer, 'Customer updated successfully');
    } catch (error) {
      next(error);
    }
  }

  static async delete(req: Request, res: Response, next: NextFunction) {
    try {
      await CustomerService.deleteCustomer(req.params.id);
      return ApiResponse.success(res, null, 'Customer deleted successfully');
    } catch (error) {
      next(error);
    }
  }

  static async createFollowUp(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = req.user!.id;
      const followUp = await CustomerService.createFollowUp(req.params.id, req.body, userId);
      return ApiResponse.success(res, followUp, 'Follow-up note added successfully', 201);
    } catch (error) {
      next(error);
    }
  }

  static async listFollowUps(req: Request, res: Response, next: NextFunction) {
    try {
      const followUps = await CustomerService.getFollowUps(req.params.id);
      return ApiResponse.success(res, followUps, 'Follow-up notes fetched successfully');
    } catch (error) {
      next(error);
    }
  }
}
