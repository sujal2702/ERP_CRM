import { Request, Response, NextFunction } from 'express';
import { ChallanService } from '../services/challan.service';
import { createChallanSchema, challanQuerySchema } from '../validators/challan.validator';

export class ChallanController {
  static async createChallan(req: Request, res: Response, next: NextFunction) {
    try {
      const validationResult = createChallanSchema.safeParse(req.body);

      if (!validationResult.success) {
        const errorMessages = validationResult.error.errors.map(e => e.message).join(', ');
        return res.status(400).json({
          success: false,
          message: errorMessages || 'Invalid challan creation payload',
        });
      }

      if (!req.user) {
        return res.status(401).json({ success: false, message: 'Unauthenticated' });
      }

      const challan = await ChallanService.createChallan(validationResult.data, req.user.id);

      return res.status(201).json({
        success: true,
        message: 'Sales Challan created successfully as DRAFT',
        data: { challan },
      });
    } catch (error: any) {
      if (error.statusCode) {
        return res.status(error.statusCode).json({ success: false, message: error.message });
      }
      next(error);
    }
  }

  static async getChallans(req: Request, res: Response, next: NextFunction) {
    try {
      const queryValidation = challanQuerySchema.safeParse(req.query);
      const { search, status, page, limit } = queryValidation.success
        ? queryValidation.data
        : { search: undefined, status: undefined, page: 1, limit: 10 };

      const result = await ChallanService.getChallans(search, status, page, limit);

      return res.status(200).json({
        success: true,
        message: 'Sales Challans retrieved successfully',
        data: result,
      });
    } catch (error) {
      next(error);
    }
  }

  static async getChallanById(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const challan = await ChallanService.getChallanById(id);

      return res.status(200).json({
        success: true,
        message: 'Sales Challan details retrieved successfully',
        data: { challan },
      });
    } catch (error: any) {
      if (error.statusCode) {
        return res.status(error.statusCode).json({ success: false, message: error.message });
      }
      next(error);
    }
  }

  static async confirmChallan(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;

      if (!req.user) {
        return res.status(401).json({ success: false, message: 'Unauthenticated' });
      }

      const challan = await ChallanService.confirmChallan(id, req.user.id);

      return res.status(200).json({
        success: true,
        message: `Sales Challan ${challan.challanNumber} confirmed successfully. Stock updated.`,
        data: { challan },
      });
    } catch (error: any) {
      if (error.statusCode === 409) {
        return res.status(409).json({
          success: false,
          message: error.message || 'Insufficient stock to confirm challan',
          details: error.details || [],
        });
      }
      if (error.statusCode) {
        return res.status(error.statusCode).json({ success: false, message: error.message });
      }
      next(error);
    }
  }

  static async cancelChallan(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const challan = await ChallanService.cancelChallan(id);

      return res.status(200).json({
        success: true,
        message: `Sales Challan ${challan.challanNumber} cancelled successfully`,
        data: { challan },
      });
    } catch (error: any) {
      if (error.statusCode) {
        return res.status(error.statusCode).json({ success: false, message: error.message });
      }
      next(error);
    }
  }
}
