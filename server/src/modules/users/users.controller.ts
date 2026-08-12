import { Request, Response, NextFunction } from 'express';
import { UsersService } from './users.service.js';
import { ApiResponse } from '../../utils/apiResponse.js';
import { ApprovalStatus, AccountStatus, UserRole } from '@prisma/client';

export class UsersController {
  static async listUsers(req: Request, res: Response, next: NextFunction) {
    try {
      const { approvalStatus, status, role } = req.query;
      const filters = {
        approvalStatus: approvalStatus as ApprovalStatus,
        status: status as AccountStatus,
        role: role as UserRole
      };
      const users = await UsersService.listUsers(filters);
      return ApiResponse.success(res, users, 'Users fetched successfully');
    } catch (error) {
      next(error);
    }
  }

  static async approve(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const adminId = req.user!.id;
      const result = await UsersService.approveAdminRequest(id, adminId);
      return ApiResponse.success(res, result, 'User approved successfully');
    } catch (error) {
      next(error);
    }
  }

  static async reject(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const adminId = req.user!.id;
      const result = await UsersService.rejectAdminRequest(id, adminId);
      return ApiResponse.success(res, result, 'User rejected successfully');
    } catch (error) {
      next(error);
    }
  }

  static async suspend(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const { reason, until } = req.body;
      const adminId = req.user!.id;
      const suspendUntilDate = until ? new Date(until) : undefined;
      const result = await UsersService.suspendUser(id, adminId, reason, suspendUntilDate);
      return ApiResponse.success(res, result, 'User suspended successfully');
    } catch (error) {
      next(error);
    }
  }

  static async reactivate(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const adminId = req.user!.id;
      const result = await UsersService.reactivateUser(id, adminId);
      return ApiResponse.success(res, result, 'User reactivated successfully');
    } catch (error) {
      next(error);
    }
  }

  static async revoke(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const { reason } = req.body;
      const adminId = req.user!.id;
      const result = await UsersService.revokeUser(id, adminId, reason);
      return ApiResponse.success(res, result, 'User access revoked successfully');
    } catch (error) {
      next(error);
    }
  }

  static async revokeAdmin(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const { newRole, reason } = req.body;
      const adminId = req.user!.id;
      const result = await UsersService.revokeAdminPrivileges(id, adminId, newRole);
      return ApiResponse.success(res, result, 'Administrator privileges revoked successfully');
    } catch (error) {
      next(error);
    }
  }
}
