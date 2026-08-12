import { Request, Response, NextFunction } from 'express';
import { AuthService } from './auth.service.js';
import { ApiResponse } from '../../utils/apiResponse.js';

export class AuthController {
  static async login(req: Request, res: Response, next: NextFunction) {
    try {
      const result = await AuthService.login(req.body);
      return ApiResponse.success(res, result, 'Login successful');
    } catch (error) {
      next(error);
    }
  }

  static async register(req: Request, res: Response, next: NextFunction) {
    try {
      const result = await AuthService.register(req.body);
      return ApiResponse.success(res, result, 'Registration successful');
    } catch (error) {
      next(error);
    }
  }

  static async forgotPassword(req: Request, res: Response, next: NextFunction) {
    return ApiResponse.success(
      res,
      null,
      'Password recovery is not configured for this deployment. Please contact your system administrator.'
    );
  }

  static async resetPassword(req: Request, res: Response, next: NextFunction) {
    return ApiResponse.success(
      res,
      null,
      'Password recovery is not configured for this deployment. Please contact your system administrator.'
    );
  }

  static async me(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = req.user!.id;
      const user = await AuthService.getProfile(userId);
      return ApiResponse.success(res, user, 'Profile fetched successfully');
    } catch (error) {
      next(error);
    }
  }
}
