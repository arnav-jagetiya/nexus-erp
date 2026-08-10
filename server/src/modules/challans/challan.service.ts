import { Prisma, ChallanStatus } from '@prisma/client';
import { prisma } from '../../config/prisma.js';
import { ApiError } from '../../utils/apiError.js';
import { CreateChallanInput, UpdateChallanInput } from './challan.schema.js';
import { PaginationParams, buildPaginationMeta } from '../../utils/pagination.js';

export class ChallanService {
  /**
   * Format: CHN-YYYYMMDD-NNNN
   */
  private static async generateChallanNumber(): Promise<string> {
    const today = new Date().toISOString().slice(0, 10).replace(/-/g, '');
    const prefix = `CHN-${today}-`;

    const lastChallan = await prisma.challan.findFirst({
      where: { challanNumber: { startsWith: prefix } },
      orderBy: { challanNumber: 'desc' },
    });

    const nextSeq = lastChallan
      ? parseInt(lastChallan.challanNumber.split('-').pop()!) + 1
      : 1;

    return `${prefix}${nextSeq.toString().padStart(4, '0')}`;
  }

  static async createChallan(data: CreateChallanInput, userId: string) {
    // 1. Verify Customer exists
    const customer = await prisma.customer.findUnique({
      where: { id: data.customerId },
    });

    if (!customer) {
      throw ApiError.notFound('Customer');
    }

    // 2. Fetch and verify all products
    const productIds = data.items.map((i) => i.productId);
    const products = await prisma.product.findMany({
      where: { id: { in: productIds } },
    });

    if (products.length !== productIds.length) {
      const foundIds = new Set(products.map((p) => p.id));
      const missingId = productIds.find((id) => !foundIds.has(id));
      throw ApiError.notFound(`Product with ID '${missingId}'`);
    }

    const productMap = new Map(products.map((p) => [p.id, p]));

    // 3. Capture snapshot data AT DRAFT CREATION TIME
    let totalAmountDecimal = new Prisma.Decimal(0);
    const itemsData = data.items.map((item) => {
      const product = productMap.get(item.productId)!;
      const unitPriceDecimal = product.unitPrice;
      const lineTotalDecimal = unitPriceDecimal.mul(item.quantity);
      totalAmountDecimal = totalAmountDecimal.add(lineTotalDecimal);

      return {
        productId: product.id,
        productName: product.name, // Snapshot
        sku: product.sku,          // Snapshot
        unitPrice: unitPriceDecimal,// Snapshot
        quantity: item.quantity,
        lineTotal: lineTotalDecimal,
      };
    });

    // 4. Retry-safe creation handling concurrent challan number collisions (P2002)
    const MAX_RETRIES = 3;
    let attempt = 0;

    while (attempt < MAX_RETRIES) {
      attempt++;
      try {
        const challanNumber = await this.generateChallanNumber();

        const challan = await prisma.challan.create({
          data: {
            challanNumber,
            customerId: data.customerId,
            status: ChallanStatus.DRAFT,
            totalAmount: totalAmountDecimal,
            createdById: userId,
            items: {
              create: itemsData,
            },
          },
          include: {
            customer: true,
            createdBy: {
              select: { id: true, name: true, email: true, role: true },
            },
            items: true,
          },
        });

        return challan;
      } catch (error) {
        if (
          error instanceof Prisma.PrismaClientKnownRequestError &&
          error.code === 'P2002' &&
          attempt < MAX_RETRIES
        ) {
          console.warn(`⚠️ Challan number collision on attempt ${attempt}. Retrying...`);
          continue;
        }
        throw error;
      }
    }

    throw ApiError.conflict('CHALLAN_NUMBER_COLLISION', 'Failed to generate a unique challan number. Please try again.');
  }

  static async getChallans(
    pagination: PaginationParams,
    filters: { search?: string; status?: ChallanStatus; customerId?: string }
  ) {
    const where: Prisma.ChallanWhereInput = {};

    if (filters.status) {
      where.status = filters.status;
    }

    if (filters.customerId) {
      where.customerId = filters.customerId;
    }

    if (filters.search && filters.search.trim() !== '') {
      where.challanNumber = { contains: filters.search.trim(), mode: 'insensitive' };
    }

    const [total, challans] = await Promise.all([
      prisma.challan.count({ where }),
      prisma.challan.findMany({
        where,
        skip: pagination.skip,
        take: pagination.limit,
        orderBy: { createdAt: 'desc' },
        include: {
          customer: {
            select: { id: true, name: true, email: true, mobile: true, businessName: true },
          },
          createdBy: {
            select: { id: true, name: true, email: true, role: true },
          },
          items: true,
        },
      }),
    ]);

    const meta = buildPaginationMeta(pagination.page, pagination.limit, total);
    return { data: challans, meta };
  }

  static async getChallanById(id: string) {
    const challan = await prisma.challan.findUnique({
      where: { id },
      include: {
        customer: true,
        createdBy: {
          select: { id: true, name: true, email: true, role: true },
        },
        items: {
          include: {
            product: {
              select: { id: true, name: true, sku: true, currentStock: true, location: true },
            },
          },
        },
      },
    });

    if (!challan) {
      throw ApiError.notFound('Sales Challan');
    }

    return challan;
  }

  static async updateDraftChallan(id: string, data: UpdateChallanInput) {
    const existing = await prisma.challan.findUnique({
      where: { id },
      include: { items: true },
    });

    if (!existing) {
      throw ApiError.notFound('Sales Challan');
    }

    // Only DRAFT status can be modified
    if (existing.status !== ChallanStatus.DRAFT) {
      throw ApiError.invalidStatusTransition(existing.status, 'UPDATE');
    }

    if (data.customerId) {
      const customerExists = await prisma.customer.findUnique({ where: { id: data.customerId } });
      if (!customerExists) {
        throw ApiError.notFound('Customer');
      }
    }

    return prisma.$transaction(async (tx) => {
      let totalAmountDecimal = existing.totalAmount;

      if (data.items) {
        const existingItemMap = new Map(existing.items.map((item) => [item.productId, item]));

        // Determine which product IDs are new (not present in existing items)
        const newProductIds = data.items
          .filter((item) => !existingItemMap.has(item.productId))
          .map((item) => item.productId);

        let newProductsMap = new Map<string, any>();
        if (newProductIds.length > 0) {
          const fetchedProducts = await tx.product.findMany({
            where: { id: { in: newProductIds } },
          });

          if (fetchedProducts.length !== newProductIds.length) {
            const foundIds = new Set(fetchedProducts.map((p) => p.id));
            const missingId = newProductIds.find((pid) => !foundIds.has(pid));
            throw ApiError.notFound(`Product with ID '${missingId}'`);
          }

          newProductsMap = new Map(fetchedProducts.map((p) => [p.id, p]));
        }

        // Delete previous items
        await tx.challanItem.deleteMany({
          where: { challanId: id },
        });

        totalAmountDecimal = new Prisma.Decimal(0);
        const newItemsData = data.items.map((item) => {
          let productName: string;
          let sku: string;
          let unitPriceDecimal: Prisma.Decimal;

          if (existingItemMap.has(item.productId)) {
            // Preserve original snapshot from initial creation
            const existingItem = existingItemMap.get(item.productId)!;
            productName = existingItem.productName;
            sku = existingItem.sku;
            unitPriceDecimal = existingItem.unitPrice;
          } else {
            // Capture snapshot for newly added product at edit time
            const product = newProductsMap.get(item.productId)!;
            productName = product.name;
            sku = product.sku;
            unitPriceDecimal = product.unitPrice;
          }

          const lineTotalDecimal = unitPriceDecimal.mul(item.quantity);
          totalAmountDecimal = totalAmountDecimal.add(lineTotalDecimal);

          return {
            challanId: id,
            productId: item.productId,
            productName,
            sku,
            unitPrice: unitPriceDecimal,
            quantity: item.quantity,
            lineTotal: lineTotalDecimal,
          };
        });

        await tx.challanItem.createMany({
          data: newItemsData,
        });
      }

      const updatedChallan = await tx.challan.update({
        where: { id },
        data: {
          customerId: data.customerId || existing.customerId,
          totalAmount: totalAmountDecimal,
        },
        include: {
          customer: true,
          createdBy: { select: { id: true, name: true, email: true, role: true } },
          items: true,
        },
      });

      return updatedChallan;
    });
  }

  static async cancelChallan(id: string) {
    const existing = await prisma.challan.findUnique({ where: { id } });

    if (!existing) {
      throw ApiError.notFound('Sales Challan');
    }

    if (existing.status !== ChallanStatus.DRAFT) {
      throw ApiError.invalidStatusTransition(existing.status, 'CANCELLED');
    }

    return prisma.challan.update({
      where: { id },
      data: { status: ChallanStatus.CANCELLED },
      include: {
        customer: true,
        items: true,
      },
    });
  }

  static async confirmChallan(id: string, userId: string) {
    return prisma.$transaction(async (tx) => {
      // 1. Fetch challan inside transaction
      const challan = await tx.challan.findUnique({
        where: { id },
        include: { items: true },
      });

      // 2. Validate existence
      if (!challan) {
        throw ApiError.notFound('Sales Challan');
      }

      // 3. Validate status is DRAFT
      if (challan.status !== ChallanStatus.DRAFT) {
        throw ApiError.invalidStatusTransition(challan.status, 'CONFIRMED');
      }

      if (challan.items.length === 0) {
        throw ApiError.badRequest('Cannot confirm a challan with zero line items');
      }

      // 4. For EACH item: conditional atomic stock deduction + StockMovement creation
      for (const item of challan.items) {
        const rowsAffected: number = await tx.$executeRawUnsafe(
          `UPDATE products
           SET "currentStock" = "currentStock" - $1,
               "updatedAt" = NOW()
           WHERE id = $2
             AND "currentStock" >= $1`,
          item.quantity,
          item.productId
        );

        if (rowsAffected === 0) {
          // Fetch product name for detailed 409 error message
          const product = await tx.product.findUnique({ where: { id: item.productId } });
          const productName = product?.name || item.productName;
          const availableStock = product?.currentStock ?? 0;

          throw ApiError.insufficientStock(productName, availableStock, item.quantity);
        }

        // Record StockMovement OUT log inside same transaction
        await tx.stockMovement.create({
          data: {
            productId: item.productId,
            quantity: item.quantity,
            movementType: 'OUT',
            reason: `Challan ${challan.challanNumber} confirmed`,
            createdById: userId,
          },
        });
      }

      // 5. Update status to CONFIRMED
      const confirmedChallan = await tx.challan.update({
        where: { id },
        data: { status: ChallanStatus.CONFIRMED },
        include: {
          customer: true,
          createdBy: { select: { id: true, name: true, email: true, role: true } },
          items: true,
        },
      });

      return confirmedChallan;
    }, {
      maxWait: 5000,
      timeout: 10000,
    });
  }
}
