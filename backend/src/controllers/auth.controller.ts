import { Request, Response, NextFunction } from 'express';
import { loginSchema } from '../validators/auth.validator';
import { AuthService } from '../services/auth.service';

export class AuthController {
  static async login(req: Request, res: Response, next: NextFunction) {
    try {
      const validationResult = loginSchema.safeParse(req.body);

      if (!validationResult.success) {
        const errorMessages = validationResult.error.errors.map(e => e.message).join(', ');
        return res.status(400).json({
          success: false,
          message: errorMessages || 'Invalid login request payload',
        });
      }

      const result = await AuthService.login(validationResult.data);

      return res.status(200).json({
        success: true,
        message: 'Login successful',
        data: result,
      });
    } catch (error: any) {
      if (error.statusCode) {
        return res.status(error.statusCode).json({
          success: false,
          message: error.message,
        });
      }
      if (error.code === 'P1001' || (error.message && error.message.includes("Can't reach database server"))) {
        return res.status(503).json({
          success: false,
          message: 'Database connection failed: Cannot reach PostgreSQL server. Please check your DATABASE_URL in backend/.env.',
        });
      }
      next(error);
    }
  }

  static async getMe(req: Request, res: Response, next: NextFunction) {
    try {
      if (!req.user) {
        return res.status(401).json({
          success: false,
          message: 'User unauthenticated',
        });
      }

      const user = await AuthService.getMe(req.user.id);

      return res.status(200).json({
        success: true,
        message: 'User profile retrieved successfully',
        data: { user },
      });
    } catch (error: any) {
      if (error.statusCode) {
        return res.status(error.statusCode).json({
          success: false,
          message: error.message,
        });
      }
      next(error);
    }
  }
}
