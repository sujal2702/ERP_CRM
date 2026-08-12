import { z } from 'zod';
import { ChallanStatus } from '@prisma/client';

export const challanItemInputSchema = z.object({
  productId: z.string().min(1, 'Product ID is required'),
  quantity: z.number().int('Quantity must be an integer').gt(0, 'Quantity must be greater than 0'),
});

export const createChallanSchema = z.object({
  customerId: z.string().min(1, 'Customer selection is required'),
  items: z.array(challanItemInputSchema).min(1, 'Challan must contain at least one product item'),
});

export const challanQuerySchema = z.object({
  search: z.string().optional(),
  status: z.nativeEnum(ChallanStatus).optional(),
  page: z.string().optional().transform(val => (val ? parseInt(val, 10) : 1)),
  limit: z.string().optional().transform(val => (val ? parseInt(val, 10) : 10)),
});

export type CreateChallanInput = z.infer<typeof createChallanSchema>;
