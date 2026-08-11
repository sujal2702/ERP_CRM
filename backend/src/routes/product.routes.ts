import { Router } from 'express';
import { ProductController } from '../controllers/product.controller';
import { authenticateJWT } from '../middleware/auth.middleware';
import { requireRole } from '../middleware/role.middleware';
import { Role } from '@prisma/client';

const router = Router();

router.use(authenticateJWT);

router.get('/', ProductController.getProducts);
router.post('/', requireRole(Role.ADMIN, Role.WAREHOUSE), ProductController.createProduct);
router.get('/:id', ProductController.getProductById);
router.put('/:id', requireRole(Role.ADMIN, Role.WAREHOUSE), ProductController.updateProduct);

export default router;
