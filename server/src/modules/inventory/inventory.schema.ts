import { z } from 'zod';
import { MovementType } from '@prisma/client';

export const createMovementSchema = z.object({
  body: z.object({
    productId: z.string({ required_error: 'Product ID is required' }).min(1, 'Product ID is required'),
    quantity: z.number({ required_error: 'Quantity is required' }).int('Quantity must be an integer').positive('Quantity must be greater than 0'),
    movementType: z.nativeEnum(MovementType, { required_error: 'Movement type must be IN or OUT' }),
    reason: z.string({ required_error: 'Reason is required' }).min(1, 'Reason cannot be empty').max(500, 'Reason is too long'),
  }),
});

export type CreateMovementInput = z.infer<typeof createMovementSchema>['body'];
