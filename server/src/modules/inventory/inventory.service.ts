import { Prisma, MovementType } from '@prisma/client';
import { prisma } from '../../config/prisma.js';
import { ApiError } from '../../utils/apiError.js';
import { CreateMovementInput } from './inventory.schema.js';
import { PaginationParams, buildPaginationMeta } from '../../utils/pagination.js';

export type StockStatus = 'HEALTHY' | 'LOW' | 'CRITICAL';

export class InventoryService {
  static getStockStatus(currentStock: number, minStockAlert: number): StockStatus {
    if (currentStock === 0) return 'CRITICAL';
    if (currentStock <= minStockAlert) return 'LOW';
    return 'HEALTHY';
  }

  static async getInventoryOverview(
    pagination: PaginationParams,
    filters: { search?: string; category?: string; stockStatus?: StockStatus }
  ) {
    const where: Prisma.ProductWhereInput = {};

    if (filters.category && filters.category.trim() !== '') {
      where.category = { equals: filters.category.trim(), mode: 'insensitive' };
    }

    if (filters.search && filters.search.trim() !== '') {
      const query = filters.search.trim();
      where.OR = [
        { name: { contains: query, mode: 'insensitive' } },
        { sku: { contains: query, mode: 'insensitive' } },
        { location: { contains: query, mode: 'insensitive' } },
      ];
    }

    // Fetch products
    const products = await prisma.product.findMany({
      where,
      orderBy: { name: 'asc' },
    });

    // Map derived stockStatus
    let enriched = products.map((p) => ({
      ...p,
      unitPrice: Number(p.unitPrice),
      stockStatus: this.getStockStatus(p.currentStock, p.minStockAlert),
    }));

    // Filter in-memory by derived stockStatus if requested
    if (filters.stockStatus) {
      enriched = enriched.filter((p) => p.stockStatus === filters.stockStatus);
    }

    const total = enriched.length;
    const paginatedItems = enriched.slice(pagination.skip, pagination.skip + pagination.limit);
    const meta = buildPaginationMeta(pagination.page, pagination.limit, total);

    return { data: paginatedItems, meta };
  }

  static async getMovements(
    pagination: PaginationParams,
    filters: { productId?: string; movementType?: MovementType; from?: string; to?: string }
  ) {
    const where: Prisma.StockMovementWhereInput = {};

    if (filters.productId) {
      where.productId = filters.productId;
    }

    if (filters.movementType) {
      where.movementType = filters.movementType;
    }

    if (filters.from || filters.to) {
      where.createdAt = {};
      if (filters.from) {
        where.createdAt.gte = new Date(filters.from);
      }
      if (filters.to) {
        where.createdAt.lte = new Date(filters.to);
      }
    }

    const [total, movements] = await Promise.all([
      prisma.stockMovement.count({ where }),
      prisma.stockMovement.findMany({
        where,
        skip: pagination.skip,
        take: pagination.limit,
        orderBy: { createdAt: 'desc' },
        include: {
          product: {
            select: {
              id: true,
              name: true,
              sku: true,
              category: true,
              location: true,
            },
          },
          createdBy: {
            select: {
              id: true,
              name: true,
              email: true,
              role: true,
            },
          },
        },
      }),
    ]);

    const meta = buildPaginationMeta(pagination.page, pagination.limit, total);
    return { data: movements, meta };
  }

  static async createMovement(input: CreateMovementInput, userId: string) {
    return prisma.$transaction(async (tx) => {
      // 1. Verify product exists
      const product = await tx.product.findUnique({
        where: { id: input.productId },
      });

      if (!product) {
        throw ApiError.notFound('Product');
      }

      if (input.movementType === 'IN') {
        // Increment stock atomically
        const updatedProduct = await tx.product.update({
          where: { id: input.productId },
          data: {
            currentStock: { increment: input.quantity },
          },
        });

        // Record IN movement log
        const movement = await tx.stockMovement.create({
          data: {
            productId: input.productId,
            quantity: input.quantity,
            movementType: 'IN',
            reason: input.reason,
            createdById: userId,
          },
          include: {
            product: true,
          },
        });

        return { movement, updatedStock: updatedProduct.currentStock };
      } else {
        // OUT movement: Conditional atomic UPDATE raw SQL to prevent negative stock
        const rowsAffected: number = await tx.$executeRawUnsafe(
          `UPDATE products
           SET "currentStock" = "currentStock" - $1,
               "updatedAt" = NOW()
           WHERE id = $2
             AND "currentStock" >= $1`,
          input.quantity,
          input.productId
        );

        if (rowsAffected === 0) {
          // Stock was insufficient -> abort transaction
          throw ApiError.insufficientStock(
            product.name,
            product.currentStock,
            input.quantity
          );
        }

        // Record OUT movement log
        const movement = await tx.stockMovement.create({
          data: {
            productId: input.productId,
            quantity: input.quantity,
            movementType: 'OUT',
            reason: input.reason,
            createdById: userId,
          },
          include: {
            product: true,
          },
        });

        const refreshedProduct = await tx.product.findUnique({
          where: { id: input.productId },
        });

        return { movement, updatedStock: refreshedProduct?.currentStock ?? 0 };
      }
    }, {
      maxWait: 5000,
      timeout: 10000,
    });
  }
}
