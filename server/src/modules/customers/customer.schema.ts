import { z } from 'zod';
import { CustomerType, CustomerStatus } from '@prisma/client';

export const createCustomerSchema = z.object({
  body: z.object({
    name: z.string({ required_error: 'Customer name is required' }).min(1, 'Name is required').max(200),
    mobile: z.string({ required_error: 'Mobile number is required' }).min(10, 'Mobile must be at least 10 digits').max(15),
    email: z.string({ required_error: 'Email is required' }).email('Please enter a valid email address'),
    businessName: z.string({ required_error: 'Business name is required' }).min(1, 'Business name is required').max(200),
    gstNumber: z.string().max(15).optional().nullable(),
    customerType: z.nativeEnum(CustomerType, { required_error: 'Customer type is required (RETAIL, WHOLESALE, DISTRIBUTOR)' }),
    address: z.string({ required_error: 'Address is required' }).min(1, 'Address is required'),
    status: z.nativeEnum(CustomerStatus).optional(),
    followUpDate: z.string().datetime().optional().nullable(),
    notes: z.string().optional().nullable(),
  }),
});

export const updateCustomerSchema = z.object({
  body: createCustomerSchema.shape.body.partial(),
});

export const createFollowUpSchema = z.object({
  body: z.object({
    note: z.string({ required_error: 'Follow-up note is required' }).min(1, 'Note cannot be empty').max(2000, 'Note is too long (max 2000 characters)'),
    followUpDate: z.string().datetime().optional().nullable(),
  }),
});

export type CreateCustomerInput = z.infer<typeof createCustomerSchema>['body'];
export type UpdateCustomerInput = z.infer<typeof updateCustomerSchema>['body'];
export type CreateFollowUpInput = z.infer<typeof createFollowUpSchema>['body'];
