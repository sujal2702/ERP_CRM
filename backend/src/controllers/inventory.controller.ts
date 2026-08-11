import { Request, Response, NextFunction } from 'express';
import { InventoryService } from '../services/inventory.service';
import { stockAdjustmentSchema, productQuerySchema } from '../validators/product.validator';

export class InventoryController {
  static async getInventory(req: Request, res: Response, next: NextFunction) {
    try {
      const queryValidation = productQuerySchema.safeParse(req.query);
      const { search, page, limit, lowStock } = queryValidation.success
        ? queryValidation.data
        : { search: undefined, page: 1, limit: 10, lowStock: false };

      const result = await InventoryService.getInventory(search, page, limit, lowStock);

      return res.status(200).json({
        success: true,
        message: 'Inventory status retrieved successfully',
        data: result,
      });
    } catch (error) {
      next(error);
    }
  }

  static async getStockMovements(req: Request, res: Response, next: NextFunction) {
    try {
      const productId = req.query.productId as string | undefined;
      const page = req.query.page ? parseInt(req.query.page as string, 10) : 1;
      const limit = req.query.limit ? parseInt(req.query.limit as string, 10) : 10;

      const result = await InventoryService.getStockMovements(productId, page, limit);

      return res.status(200).json({
        success: true,
        message: 'Stock movements retrieved successfully',
        data: result,
      });
    } catch (error) {
      next(error);
    }
  }

  static async createStockAdjustment(req: Request, res: Response, next: NextFunction) {
    try {
      const validationResult = stockAdjustmentSchema.safeParse(req.body);

      if (!validationResult.success) {
        const errorMessages = validationResult.error.errors.map(e => e.message).join(', ');
        return res.status(400).json({
          success: false,
          message: errorMessages || 'Invalid stock adjustment payload',
        });
      }

      if (!req.user) {
        return res.status(401).json({ success: false, message: 'Unauthenticated' });
      }

      const result = await InventoryService.createStockAdjustment(validationResult.data, req.user.id);

      return res.status(201).json({
        success: true,
        message: `Stock ${validationResult.data.movementType} adjustment applied successfully`,
        data: result,
      });
    } catch (error: any) {
      if (error.statusCode) {
        return res.status(error.statusCode).json({ success: false, message: error.message });
      }
      next(error);
    }
  }
}
