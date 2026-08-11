import { Router } from 'express';
import { InventoryController } from '../controllers/inventory.controller';
import { authenticateJWT } from '../middleware/auth.middleware';
import { requireRole } from '../middleware/role.middleware';
import { Role } from '@prisma/client';

const router = Router();

router.use(authenticateJWT);

router.get('/', InventoryController.getInventory);
router.get('/movements', InventoryController.getStockMovements);
router.post('/adjustments', requireRole(Role.ADMIN, Role.WAREHOUSE), InventoryController.createStockAdjustment);

export default router;
