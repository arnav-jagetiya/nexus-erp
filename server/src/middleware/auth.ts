import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { prisma } from '../config/prisma.js';
import { AccountStatus } from '@prisma/client';
import { env } from '../config/env.js';
import { ApiError } from '../utils/apiError.js';
import { JwtPayload } from '../types/index.js';

export const auth = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      throw ApiError.unauthorized('Missing or malformed Authorization header');
    }

    const token = authHeader.split(' ')[1];

    if (!token) {
      throw ApiError.unauthorized('Authentication token is required');
    }

    const decoded = jwt.verify(token, env.JWT_SECRET) as JwtPayload;

    const user = await prisma.user.findUnique({
      where: { id: decoded.id },
      select: { id: true, email: true, role: true, name: true, status: true, suspendedUntil: true }
    });

    if (!user) {
      throw ApiError.unauthorized('User not found');
    }

    if (user.status === AccountStatus.REVOKED) {
      throw ApiError.forbidden('Your account has been revoked.');
    }

    if (user.status === AccountStatus.SUSPENDED) {
      if (user.suspendedUntil && new Date() > user.suspendedUntil) {
        // Natural suspension expiry: Reactivate automatically
        await prisma.user.update({
          where: { id: user.id },
          data: {
            status: AccountStatus.ACTIVE,
            suspendedAt: null,
            suspendedUntil: null,
            suspensionReason: null
          }
        });
        user.status = AccountStatus.ACTIVE;
      } else {
        throw ApiError.forbidden('Your account is currently suspended.');
      }
    }

    req.user = {
      id: user.id,
      email: user.email,
      role: user.role,
      name: user.name,
    };

    next();
  } catch (error) {
    if (error instanceof jwt.TokenExpiredError) {
      return next(ApiError.unauthorized('Authentication token has expired'));
    }
    if (error instanceof jwt.JsonWebTokenError) {
      return next(ApiError.unauthorized('Invalid authentication token'));
    }
    next(error);
  }
};
