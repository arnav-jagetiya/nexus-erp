import { z } from 'zod';
import { UserRole } from '@prisma/client';

export const userIdSchema = z.object({
  params: z.object({
    id: z.string({ required_error: 'User ID is required' }),
  }),
});

export const suspendSchema = z.object({
  params: z.object({
    id: z.string({ required_error: 'User ID is required' }),
  }),
  body: z.object({
    reason: z.string({ required_error: 'Suspension reason is required' }),
    until: z.string().optional().refine((val) => !val || !isNaN(Date.parse(val)), { message: 'Invalid date format' }),
  }),
});

export const revokeSchema = z.object({
  params: z.object({
    id: z.string({ required_error: 'User ID is required' }),
  }),
  body: z.object({
    reason: z.string({ required_error: 'Revocation reason is required' }),
  }),
});

export const revokeAdminSchema = z.object({
  params: z.object({
    id: z.string({ required_error: 'User ID is required' }),
  }),
  body: z.object({
    newRole: z.enum([UserRole.SALES, UserRole.WAREHOUSE, UserRole.ACCOUNTS], { required_error: 'New operational role is required' }),
    reason: z.string().optional(),
  }),
});
