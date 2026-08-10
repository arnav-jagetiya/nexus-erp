import { Prisma } from '@prisma/client';
import { prisma } from '../../config/prisma.js';
import { ApiError } from '../../utils/apiError.js';
import { CreateProductInput, UpdateProductInput } from './product.schema.js';
import { PaginationParams, buildPaginationMeta } from '../../utils/pagination.js';

export class ProductService {
  static async createProduct(data: CreateProductInput) {
    const existingSku = await prisma.product.findUnique({
      where: { sku: data.sku.toUpperCase() },
    });

    if (existingSku) {
      throw ApiError.conflict('CONFLICT', `A product with SKU '${data.sku.toUpperCase()}' already exists`);
    }

    return prisma.product.create({
      data: {
        name: data.name,
        sku: data.sku.toUpperCase(),
        category: data.category,
        unitPrice: new Prisma.Decimal(data.unitPrice),
        currentStock: data.currentStock ?? 0,
        minStockAlert: data.minStockAlert ?? 0,
        location: data.location,
      },
    });
  }

  static async getProducts(
    pagination: PaginationParams,
    filters: { search?: string; category?: string }
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
        { category: { contains: query, mode: 'insensitive' } },
        { location: { contains: query, mode: 'insensitive' } },
      ];
    }

    const [total, products] = await Promise.all([
      prisma.product.count({ where }),
      prisma.product.findMany({
        where,
        skip: pagination.skip,
        take: pagination.limit,
        orderBy: { createdAt: 'desc' },
      }),
    ]);

    const meta = buildPaginationMeta(pagination.page, pagination.limit, total);
    return { data: products, meta };
  }

  static async getProductById(id: string) {
    const product = await prisma.product.findUnique({
      where: { id },
      include: {
        _count: {
          select: { stockMovements: true, challanItems: true },
        },
      },
    });

    if (!product) {
      throw ApiError.notFound('Product');
    }

    return product;
  }

  static async updateProduct(id: string, data: UpdateProductInput) {
    const existing = await prisma.product.findUnique({ where: { id } });

    if (!existing) {
      throw ApiError.notFound('Product');
    }

    if (data.sku && data.sku.toUpperCase() !== existing.sku.toUpperCase()) {
      const skuConflict = await prisma.product.findUnique({
        where: { sku: data.sku.toUpperCase() },
      });
      if (skuConflict) {
        throw ApiError.conflict('CONFLICT', `A product with SKU '${data.sku.toUpperCase()}' already exists`);
      }
    }

    const updateData: Prisma.ProductUpdateInput = {};
    if (data.name !== undefined) updateData.name = data.name;
    if (data.sku !== undefined) updateData.sku = data.sku.toUpperCase();
    if (data.category !== undefined) updateData.category = data.category;
    if (data.unitPrice !== undefined) updateData.unitPrice = new Prisma.Decimal(data.unitPrice);
    if (data.minStockAlert !== undefined) updateData.minStockAlert = data.minStockAlert;
    if (data.location !== undefined) updateData.location = data.location;

    return prisma.product.update({
      where: { id },
      data: updateData,
    });
  }

  static async deleteProduct(id: string) {
    const existing = await prisma.product.findUnique({
      where: { id },
      include: {
        _count: {
          select: { stockMovements: true, challanItems: true },
        },
      },
    });

    if (!existing) {
      throw ApiError.notFound('Product');
    }

    const dependentCount = existing._count.stockMovements + existing._count.challanItems;

    if (dependentCount > 0) {
      throw ApiError.conflict(
        'HAS_DEPENDENT_RECORDS',
        `Cannot delete product '${existing.name}' because it has ${existing._count.stockMovements} stock movements and ${existing._count.challanItems} challan items.`
      );
    }

    return prisma.product.delete({
      where: { id },
    });
  }
}
