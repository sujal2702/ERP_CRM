import { Request, Response, NextFunction } from 'express';
import { ProductService } from '../services/product.service';
import {
  createProductSchema,
  updateProductSchema,
  productQuerySchema,
} from '../validators/product.validator';

export class ProductController {
  static async getProducts(req: Request, res: Response, next: NextFunction) {
    try {
      const queryValidation = productQuerySchema.safeParse(req.query);
      const { search, page, limit, lowStock } = queryValidation.success
        ? queryValidation.data
        : { search: undefined, page: 1, limit: 10, lowStock: false };

      const result = await ProductService.getProducts(search, page, limit, lowStock);

      return res.status(200).json({
        success: true,
        message: 'Products retrieved successfully',
        data: result,
      });
    } catch (error) {
      next(error);
    }
  }

  static async createProduct(req: Request, res: Response, next: NextFunction) {
    try {
      const validationResult = createProductSchema.safeParse(req.body);

      if (!validationResult.success) {
        const errorMessages = validationResult.error.errors.map(e => e.message).join(', ');
        return res.status(400).json({
          success: false,
          message: errorMessages || 'Invalid product creation payload',
        });
      }

      if (!req.user) {
        return res.status(401).json({ success: false, message: 'Unauthenticated' });
      }

      const product = await ProductService.createProduct(validationResult.data, req.user.id);

      return res.status(201).json({
        success: true,
        message: 'Product created successfully',
        data: { product },
      });
    } catch (error: any) {
      if (error.statusCode) {
        return res.status(error.statusCode).json({ success: false, message: error.message });
      }
      next(error);
    }
  }

  static async getProductById(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const product = await ProductService.getProductById(id);

      return res.status(200).json({
        success: true,
        message: 'Product details retrieved successfully',
        data: { product },
      });
    } catch (error: any) {
      if (error.statusCode) {
        return res.status(error.statusCode).json({ success: false, message: error.message });
      }
      next(error);
    }
  }

  static async updateProduct(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const validationResult = updateProductSchema.safeParse(req.body);

      if (!validationResult.success) {
        const errorMessages = validationResult.error.errors.map(e => e.message).join(', ');
        return res.status(400).json({
          success: false,
          message: errorMessages || 'Invalid product update payload',
        });
      }

      const product = await ProductService.updateProduct(id, validationResult.data);

      return res.status(200).json({
        success: true,
        message: 'Product updated successfully',
        data: { product },
      });
    } catch (error: any) {
      if (error.statusCode) {
        return res.status(error.statusCode).json({ success: false, message: error.message });
      }
      next(error);
    }
  }
}
