import { z } from 'zod';
import { UserRole } from '@prisma/client';

export const loginSchema = z.object({
  body: z.object({
    email: z
      .string({ required_error: 'Email is required' })
      .email('Please enter a valid email address'),
    password: z
      .string({ required_error: 'Password is required' })
      .min(1, 'Password cannot be empty'),
  }),
});

export const registerSchema = z.object({
  body: z.object({
    name: z.string({ required_error: 'Name is required' }).min(2, 'Name must be at least 2 characters'),
    email: z.string({ required_error: 'Email is required' }).email('Please enter a valid email address'),
    password: z.string({ required_error: 'Password is required' }).min(8, 'Password must be at least 8 characters'),
    requestedRole: z.nativeEnum(UserRole, { required_error: 'Requested role is required' }),
  }),
});

export type LoginInput = z.infer<typeof loginSchema>['body'];
export type RegisterInput = z.infer<typeof registerSchema>['body'];
