import { Prisma, CustomerStatus, CustomerType } from '@prisma/client';
import { prisma } from '../../config/prisma.js';
import { ApiError } from '../../utils/apiError.js';
import { CreateCustomerInput, UpdateCustomerInput, CreateFollowUpInput } from './customer.schema.js';
import { PaginationParams, buildPaginationMeta } from '../../utils/pagination.js';

export class CustomerService {
  static async createCustomer(data: CreateCustomerInput) {
    const existing = await prisma.customer.findUnique({
      where: { email: data.email.toLowerCase() },
    });

    if (existing) {
      throw ApiError.conflict('CONFLICT', `A customer with email '${data.email}' already exists`);
    }

    return prisma.customer.create({
      data: {
        ...data,
        email: data.email.toLowerCase(),
        followUpDate: data.followUpDate ? new Date(data.followUpDate) : null,
      },
    });
  }

  static async getCustomers(
    pagination: PaginationParams,
    filters: { search?: string; status?: CustomerStatus; customerType?: CustomerType }
  ) {
    const where: Prisma.CustomerWhereInput = {};

    if (filters.status) {
      where.status = filters.status;
    }

    if (filters.customerType) {
      where.customerType = filters.customerType;
    }

    if (filters.search && filters.search.trim() !== '') {
      const query = filters.search.trim();
      where.OR = [
        { name: { contains: query, mode: 'insensitive' } },
        { email: { contains: query, mode: 'insensitive' } },
        { mobile: { contains: query, mode: 'insensitive' } },
        { businessName: { contains: query, mode: 'insensitive' } },
      ];
    }

    const [total, customers] = await Promise.all([
      prisma.customer.count({ where }),
      prisma.customer.findMany({
        where,
        skip: pagination.skip,
        take: pagination.limit,
        orderBy: { createdAt: 'desc' },
        include: {
          _count: {
            select: { followUps: true, challans: true },
          },
        },
      }),
    ]);

    const meta = buildPaginationMeta(pagination.page, pagination.limit, total);
    return { data: customers, meta };
  }

  static async getCustomerById(id: string) {
    const customer = await prisma.customer.findUnique({
      where: { id },
      include: {
        followUps: {
          orderBy: { createdAt: 'desc' },
          take: 50,
        },
        _count: {
          select: { challans: true },
        },
      },
    });

    if (!customer) {
      throw ApiError.notFound('Customer');
    }

    return customer;
  }

  static async updateCustomer(id: string, data: UpdateCustomerInput) {
    const existing = await prisma.customer.findUnique({ where: { id } });

    if (!existing) {
      throw ApiError.notFound('Customer');
    }

    if (data.email && data.email.toLowerCase() !== existing.email.toLowerCase()) {
      const emailConflict = await prisma.customer.findUnique({
        where: { email: data.email.toLowerCase() },
      });
      if (emailConflict) {
        throw ApiError.conflict('CONFLICT', `A customer with email '${data.email}' already exists`);
      }
    }

    const updateData: Prisma.CustomerUpdateInput = { ...data };
    if (data.email) {
      updateData.email = data.email.toLowerCase();
    }
    if (data.followUpDate !== undefined) {
      updateData.followUpDate = data.followUpDate ? new Date(data.followUpDate) : null;
    }

    return prisma.customer.update({
      where: { id },
      data: updateData,
    });
  }

  static async deleteCustomer(id: string) {
    const existing = await prisma.customer.findUnique({
      where: { id },
      include: {
        _count: {
          select: { challans: true },
        },
      },
    });

    if (!existing) {
      throw ApiError.notFound('Customer');
    }

    if (existing._count.challans > 0) {
      throw ApiError.conflict(
        'HAS_DEPENDENT_CHALLANS',
        `Cannot delete customer with ${existing._count.challans} existing sales challans`
      );
    }

    return prisma.customer.delete({
      where: { id },
    });
  }

  static async createFollowUp(customerId: string, input: CreateFollowUpInput, userId: string) {
    const customer = await prisma.customer.findUnique({ where: { id: customerId } });

    if (!customer) {
      throw ApiError.notFound('Customer');
    }

    const followUpDate = input.followUpDate ? new Date(input.followUpDate) : null;

    return prisma.$transaction(async (tx) => {
      const followUp = await tx.customerFollowUp.create({
        data: {
          customerId,
          note: input.note,
          createdBy: userId,
        },
      });

      if (followUpDate) {
        await tx.customer.update({
          where: { id: customerId },
          data: { followUpDate },
        });
      }

      return followUp;
    });
  }

  static async getFollowUps(customerId: string) {
    const customer = await prisma.customer.findUnique({ where: { id: customerId } });

    if (!customer) {
      throw ApiError.notFound('Customer');
    }

    return prisma.customerFollowUp.findMany({
      where: { customerId },
      orderBy: { createdAt: 'desc' },
    });
  }
}
