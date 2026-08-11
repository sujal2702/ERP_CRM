import { z } from 'zod';
import { StockMovementType } from '@prisma/client';

export const createProductSchema = z.object({
  name: z.string().min(2, 'Product name must be at least 2 characters'),
  sku: z.string().min(2, 'SKU must be at least 2 characters'),
  category: z.string().min(2, 'Category must be at least 2 characters'),
  unitPrice: z.number().gt(0, 'Unit price must be greater than 0'),
  currentStock: z.number().min(0, 'Current stock cannot be negative').default(0),
  minimumStock: z.number().min(0, 'Minimum stock cannot be negative').default(0),
  warehouseLocation: z.string().min(2, 'Warehouse location is required'),
});

export const updateProductSchema = z.object({
  name: z.string().min(2, 'Product name must be at least 2 characters').optional(),
  sku: z.string().min(2, 'SKU must be at least 2 characters').optional(),
  category: z.string().min(2, 'Category must be at least 2 characters').optional(),
  unitPrice: z.number().gt(0, 'Unit price must be greater than 0').optional(),
  minimumStock: z.number().min(0, 'Minimum stock cannot be negative').optional(),
  warehouseLocation: z.string().min(2, 'Warehouse location is required').optional(),
});

export const stockAdjustmentSchema = z.object({
  productId: z.string().min(1, 'Product ID is required'),
  movementType: z.nativeEnum(StockMovementType, {
    errorMap: () => ({ message: 'Movement type must be IN or OUT' }),
  }),
  quantity: z.number().int('Quantity must be an integer').gt(0, 'Quantity must be greater than 0'),
  reason: z.string().min(2, 'Reason for stock movement is required'),
});

export const productQuerySchema = z.object({
  search: z.string().optional(),
  page: z.string().optional().transform(val => (val ? parseInt(val, 10) : 1)),
  limit: z.string().optional().transform(val => (val ? parseInt(val, 10) : 10)),
  lowStock: z.string().optional().transform(val => val === 'true'),
});

export type CreateProductInput = z.infer<typeof createProductSchema>;
export type UpdateProductInput = z.infer<typeof updateProductSchema>;
export type StockAdjustmentInput = z.infer<typeof stockAdjustmentSchema>;
