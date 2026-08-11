import { Request, Response, NextFunction } from 'express';
import { CustomerService } from '../services/customer.service';
import {
  createCustomerSchema,
  updateCustomerSchema,
  addCustomerNoteSchema,
  customerQuerySchema,
} from '../validators/customer.validator';

export class CustomerController {
  static async getCustomers(req: Request, res: Response, next: NextFunction) {
    try {
      const queryValidation = customerQuerySchema.safeParse(req.query);
      const { search, page, limit } = queryValidation.success
        ? queryValidation.data
        : { search: undefined, page: 1, limit: 10 };

      const result = await CustomerService.getCustomers(search, page, limit);

      return res.status(200).json({
        success: true,
        message: 'Customers retrieved successfully',
        data: result,
      });
    } catch (error) {
      next(error);
    }
  }

  static async createCustomer(req: Request, res: Response, next: NextFunction) {
    try {
      const validationResult = createCustomerSchema.safeParse(req.body);

      if (!validationResult.success) {
        const errorMessages = validationResult.error.errors.map(e => e.message).join(', ');
        return res.status(400).json({
          success: false,
          message: errorMessages || 'Invalid customer creation payload',
        });
      }

      if (!req.user) {
        return res.status(401).json({ success: false, message: 'Unauthenticated' });
      }

      const customer = await CustomerService.createCustomer(validationResult.data, req.user.id);

      return res.status(201).json({
        success: true,
        message: 'Customer created successfully',
        data: { customer },
      });
    } catch (error: any) {
      if (error.statusCode) {
        return res.status(error.statusCode).json({ success: false, message: error.message });
      }
      next(error);
    }
  }

  static async getCustomerById(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const customer = await CustomerService.getCustomerById(id);

      return res.status(200).json({
        success: true,
        message: 'Customer details retrieved successfully',
        data: { customer },
      });
    } catch (error: any) {
      if (error.statusCode) {
        return res.status(error.statusCode).json({ success: false, message: error.message });
      }
      next(error);
    }
  }

  static async updateCustomer(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const validationResult = updateCustomerSchema.safeParse(req.body);

      if (!validationResult.success) {
        const errorMessages = validationResult.error.errors.map(e => e.message).join(', ');
        return res.status(400).json({
          success: false,
          message: errorMessages || 'Invalid customer update payload',
        });
      }

      const customer = await CustomerService.updateCustomer(id, validationResult.data);

      return res.status(200).json({
        success: true,
        message: 'Customer updated successfully',
        data: { customer },
      });
    } catch (error: any) {
      if (error.statusCode) {
        return res.status(error.statusCode).json({ success: false, message: error.message });
      }
      next(error);
    }
  }

  static async getCustomerNotes(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const notes = await CustomerService.getCustomerNotes(id);

      return res.status(200).json({
        success: true,
        message: 'Customer notes retrieved successfully',
        data: { notes },
      });
    } catch (error: any) {
      if (error.statusCode) {
        return res.status(error.statusCode).json({ success: false, message: error.message });
      }
      next(error);
    }
  }

  static async addCustomerNote(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const validationResult = addCustomerNoteSchema.safeParse(req.body);

      if (!validationResult.success) {
        const errorMessages = validationResult.error.errors.map(e => e.message).join(', ');
        return res.status(400).json({
          success: false,
          message: errorMessages || 'Invalid note content',
        });
      }

      if (!req.user) {
        return res.status(401).json({ success: false, message: 'Unauthenticated' });
      }

      const note = await CustomerService.addCustomerNote(id, validationResult.data.note, req.user.id);

      return res.status(201).json({
        success: true,
        message: 'Follow-up note added successfully',
        data: { note },
      });
    } catch (error: any) {
      if (error.statusCode) {
        return res.status(error.statusCode).json({ success: false, message: error.message });
      }
      next(error);
    }
  }
}
