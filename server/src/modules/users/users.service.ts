import { prisma } from '../../config/prisma.js';
import { ApiError } from '../../utils/apiError.js';
import { ApprovalStatus, UserRole, AccountStatus } from '@prisma/client';

export class UsersService {
  static async listUsers(filters: { approvalStatus?: ApprovalStatus; status?: AccountStatus; role?: UserRole }) {
    const where: any = {};
    if (filters.approvalStatus) where.approvalStatus = filters.approvalStatus;
    if (filters.status) where.status = filters.status;
    if (filters.role) where.role = filters.role;

    return prisma.user.findMany({
      where,
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        requestedRole: true,
        approvalStatus: true,
        status: true,
        isPrimaryAdmin: true,
        suspendedAt: true,
        suspendedUntil: true,
        suspensionReason: true,
        revokedAt: true,
        createdAt: true,
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  // Common helper for RBAC hierarchy
  private static async validateHierarchy(targetUserId: string, executingAdminId: string) {
    if (targetUserId === executingAdminId) {
      throw ApiError.forbidden('You cannot perform this action on yourself.');
    }

    const [targetUser, executingAdmin] = await Promise.all([
      prisma.user.findUnique({ where: { id: targetUserId } }),
      prisma.user.findUnique({ where: { id: executingAdminId } })
    ]);

    if (!targetUser) throw ApiError.notFound('Target user not found');
    if (!executingAdmin) throw ApiError.unauthorized('Executing admin not found');

    if (targetUser.isPrimaryAdmin) {
      throw ApiError.forbidden('The primary administrator cannot be modified.');
    }

    if (targetUser.role === UserRole.ADMIN && !executingAdmin.isPrimaryAdmin) {
      throw ApiError.forbidden('Secondary administrators cannot modify other administrators.');
    }

    return { targetUser, executingAdmin };
  }

  static async approveAdminRequest(targetUserId: string, adminId: string) {
    const { targetUser } = await this.validateHierarchy(targetUserId, adminId);

    if (targetUser.requestedRole !== UserRole.ADMIN) {
      throw ApiError.badRequest('This user did not request Administrator access.');
    }

    if (targetUser.approvalStatus !== ApprovalStatus.PENDING) {
      throw ApiError.badRequest(`Cannot approve user with status '${targetUser.approvalStatus}'.`);
    }

    return prisma.user.update({
      where: { id: targetUserId },
      data: {
        role: UserRole.ADMIN,
        status: AccountStatus.ACTIVE,
        approvalStatus: ApprovalStatus.APPROVED,
      },
    });
  }

  static async rejectAdminRequest(targetUserId: string, adminId: string) {
    const { targetUser } = await this.validateHierarchy(targetUserId, adminId);

    if (targetUser.requestedRole !== UserRole.ADMIN) {
      throw ApiError.badRequest('This user did not request Administrator access.');
    }

    if (targetUser.approvalStatus !== ApprovalStatus.PENDING) {
      throw ApiError.badRequest(`Cannot reject user with status '${targetUser.approvalStatus}'.`);
    }

    return prisma.user.update({
      where: { id: targetUserId },
      data: {
        status: AccountStatus.SUSPENDED, // Technically rejected
        approvalStatus: ApprovalStatus.REJECTED,
      },
    });
  }

  static async suspendUser(targetUserId: string, adminId: string, reason: string, until?: Date) {
    const { targetUser } = await this.validateHierarchy(targetUserId, adminId);

    if (targetUser.status === AccountStatus.REVOKED) {
      throw ApiError.badRequest('Cannot suspend a revoked user.');
    }

    return prisma.user.update({
      where: { id: targetUserId },
      data: {
        status: AccountStatus.SUSPENDED,
        suspendedAt: new Date(),
        suspendedUntil: until || null,
        suspensionReason: reason,
      },
    });
  }

  static async reactivateUser(targetUserId: string, adminId: string) {
    const { targetUser } = await this.validateHierarchy(targetUserId, adminId);

    return prisma.user.update({
      where: { id: targetUserId },
      data: {
        status: AccountStatus.ACTIVE,
        suspendedAt: null,
        suspendedUntil: null,
        suspensionReason: null,
        revokedAt: null,
        revocationReason: null,
      },
    });
  }

  static async revokeUser(targetUserId: string, adminId: string, reason: string) {
    await this.validateHierarchy(targetUserId, adminId);

    return prisma.user.update({
      where: { id: targetUserId },
      data: {
        status: AccountStatus.REVOKED,
        revokedAt: new Date(),
        revocationReason: reason,
        // Also clear any suspensions just in case
        suspendedAt: null,
        suspendedUntil: null,
        suspensionReason: null,
      },
    });
  }

  static async revokeAdminPrivileges(targetUserId: string, adminId: string, newRole: UserRole) {
    const { targetUser } = await this.validateHierarchy(targetUserId, adminId);

    if (targetUser.role !== UserRole.ADMIN) {
      throw ApiError.badRequest('Target user is not an administrator.');
    }

    if (newRole === UserRole.ADMIN) {
      throw ApiError.badRequest('Must select a non-admin role.');
    }

    return prisma.user.update({
      where: { id: targetUserId },
      data: {
        role: newRole,
      },
    });
  }
}
