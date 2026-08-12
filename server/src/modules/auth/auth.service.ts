import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { prisma } from '../../config/prisma.js';
import { env } from '../../config/env.js';
import { ApiError } from '../../utils/apiError.js';
import { LoginInput, RegisterInput } from './auth.schema.js';
import { JwtPayload } from '../../types/index.js';
import { UserRole, ApprovalStatus, AccountStatus } from '@prisma/client';

export class AuthService {
  static async login(input: LoginInput) {
    const user = await prisma.user.findUnique({
      where: { email: input.email.toLowerCase() },
    });

    if (!user) {
      throw ApiError.unauthorized('Invalid email or password');
    }

    if (user.approvalStatus === ApprovalStatus.PENDING) {
      throw ApiError.forbidden('Your account is awaiting administrator approval.');
    }

    if (user.approvalStatus === ApprovalStatus.REJECTED) {
      throw ApiError.forbidden('Your registration request was rejected.');
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

    const isPasswordValid = await bcrypt.compare(input.password, user.password);

    if (!isPasswordValid) {
      throw ApiError.unauthorized('Invalid email or password');
    }

    const payload: JwtPayload = {
      id: user.id,
      email: user.email,
      role: user.role,
      name: user.name,
    };

    const token = jwt.sign(payload, env.JWT_SECRET, {
      expiresIn: env.JWT_EXPIRES_IN as any,
    });

    return {
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        createdAt: user.createdAt,
      },
    };
  }

  static async getProfile(userId: string) {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        status: true,
        approvalStatus: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    if (!user) {
      throw ApiError.unauthorized('User not found');
    }
    if (user.status !== AccountStatus.ACTIVE) {
      throw ApiError.unauthorized('Account is not active');
    }

    return user;
  }

  static async register(input: RegisterInput) {
    const existingUser = await prisma.user.findUnique({
      where: { email: input.email.toLowerCase() },
    });

    if (existingUser) {
      throw ApiError.conflict('USER_EXISTS', 'Email is already registered');
    }

    const passwordHash = await bcrypt.hash(input.password, 10);
    const isAdmin = input.requestedRole === UserRole.ADMIN;

    const user = await prisma.user.create({
      data: {
        name: input.name,
        email: input.email.toLowerCase(),
        password: passwordHash,
        requestedRole: input.requestedRole,
        role: input.requestedRole, // Even if admin, it's inactive so safe
        approvalStatus: isAdmin ? ApprovalStatus.PENDING : ApprovalStatus.APPROVED,
        status: isAdmin ? AccountStatus.SUSPENDED : AccountStatus.ACTIVE,
      },
    });

    if (isAdmin) {
      return {
        message: 'Registration successful. Administrator access requires approval.',
        status: 'PENDING',
      };
    }

    // Auto-login for normal roles
    const payload: JwtPayload = {
      id: user.id,
      email: user.email,
      role: user.role,
      name: user.name,
    };

    const token = jwt.sign(payload, env.JWT_SECRET, {
      expiresIn: env.JWT_EXPIRES_IN as any,
    });

    return {
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        createdAt: user.createdAt,
      },
    };
  }
}
