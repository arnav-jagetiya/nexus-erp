import { Request, Response, NextFunction } from 'express';
import { UserRole } from '@prisma/client';
import { ApiError } from '../utils/apiError.js';

export const rbac = (allowedRoles: UserRole[]) => {
  return (req: Request, res: Response, next: NextFunction) => {
    if (!req.user) {
      return next(ApiError.unauthorized('Authentication required'));
    }

    if (!allowedRoles.includes(req.user.role)) {
      return next(
        ApiError.forbidden(
          `User role '${req.user.role}' is not authorized to perform this operation`
        )
      );
    }

    next();
  };
};
