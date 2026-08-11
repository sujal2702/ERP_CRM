import { z } from 'zod';
import { CustomerType, CustomerStatus } from '@prisma/client';

export const createCustomerSchema = z.object({
  name: z.string().min(2, 'Customer name must be at least 2 characters'),
  mobile: z.string().min(7, 'Mobile number must be at least 7 digits'),
  email: z.string().email('Invalid email address format').optional().or(z.literal('')),
  businessName: z.string().min(2, 'Business name must be at least 2 characters'),
  gstNumber: z.string().optional().or(z.literal('')),
  customerType: z.nativeEnum(CustomerType, {
    errorMap: () => ({ message: 'Invalid customer type. Must be RETAIL, WHOLESALE, or DISTRIBUTOR' }),
  }),
  address: z.string().min(3, 'Address must be at least 3 characters'),
  status: z.nativeEnum(CustomerStatus, {
    errorMap: () => ({ message: 'Invalid customer status. Must be LEAD, ACTIVE, or INACTIVE' }),
  }).default(CustomerStatus.LEAD),
  followUpDate: z.string().optional().or(z.literal('')),
  notes: z.string().optional(),
});

export const updateCustomerSchema = createCustomerSchema.partial();

export const addCustomerNoteSchema = z.object({
  note: z.string().min(1, 'Note content cannot be empty'),
});

export const customerQuerySchema = z.object({
  search: z.string().optional(),
  page: z.string().optional().transform(val => (val ? parseInt(val, 10) : 1)),
  limit: z.string().optional().transform(val => (val ? parseInt(val, 10) : 10)),
});

export type CreateCustomerInput = z.infer<typeof createCustomerSchema>;
export type UpdateCustomerInput = z.infer<typeof updateCustomerSchema>;
export type AddCustomerNoteInput = z.infer<typeof addCustomerNoteSchema>;
