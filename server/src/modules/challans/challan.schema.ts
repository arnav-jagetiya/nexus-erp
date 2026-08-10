import { z } from 'zod';

const challanItemSchema = z.object({
  productId: z.string({ required_error: 'Product ID is required' }).min(1, 'Product ID is required'),
  quantity: z
    .number({ required_error: 'Quantity is required' })
    .int('Quantity must be an integer')
    .positive('Quantity must be greater than 0'),
});

export const createChallanSchema = z.object({
  body: z
    .object({
      customerId: z.string({ required_error: 'Customer ID is required' }).min(1, 'Customer ID is required'),
      items: z
        .array(challanItemSchema, { required_error: 'Items list is required' })
        .min(1, 'Challan must contain at least one line item'),
    })
    .refine(
      (data) => {
        const productIds = data.items.map((i) => i.productId);
        return new Set(productIds).size === productIds.length;
      },
      {
        message: 'Duplicate products are not allowed in the same challan line items',
        path: ['items'],
      }
    ),
});

export const updateChallanSchema = z.object({
  body: z
    .object({
      customerId: z.string().min(1).optional(),
      items: z
        .array(challanItemSchema)
        .min(1, 'Challan must contain at least one line item')
        .optional(),
    })
    .refine(
      (data) => {
        if (!data.items) return true;
        const productIds = data.items.map((i) => i.productId);
        return new Set(productIds).size === productIds.length;
      },
      {
        message: 'Duplicate products are not allowed in the same challan line items',
        path: ['items'],
      }
    ),
});

export type CreateChallanInput = z.infer<typeof createChallanSchema>['body'];
export type UpdateChallanInput = z.infer<typeof updateChallanSchema>['body'];
