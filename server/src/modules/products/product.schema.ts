import { z } from 'zod';

export const createProductSchema = z.object({
  body: z.object({
    name: z.string({ required_error: 'Product name is required' }).min(1, 'Name is required').max(200),
    sku: z.string({ required_error: 'SKU is required' }).min(1, 'SKU is required').max(50),
    category: z.string({ required_error: 'Category is required' }).min(1, 'Category is required').max(100),
    unitPrice: z.number({ required_error: 'Unit price is required' }).min(0, 'Unit price cannot be negative'),
    currentStock: z.number().int('Current stock must be an integer').min(0, 'Current stock cannot be negative').optional().default(0),
    minStockAlert: z.number().int('Minimum stock alert must be an integer').min(0, 'Min stock alert cannot be negative').optional().default(0),
    location: z.string({ required_error: 'Location/warehouse is required' }).min(1, 'Location is required').max(100),
  }),
});

export const updateProductSchema = z.object({
  body: z.object({
    name: z.string().min(1).max(200).optional(),
    sku: z.string().min(1).max(50).optional(),
    category: z.string().min(1).max(100).optional(),
    unitPrice: z.number().min(0, 'Unit price cannot be negative').optional(),
    minStockAlert: z.number().int().min(0, 'Min stock alert cannot be negative').optional(),
    location: z.string().min(1).max(100).optional(),
  }),
});

export type CreateProductInput = z.infer<typeof createProductSchema>['body'];
export type UpdateProductInput = z.infer<typeof updateProductSchema>['body'];
