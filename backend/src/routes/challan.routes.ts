import { Router } from 'express';
import { ChallanController } from '../controllers/challan.controller';
import { authenticateJWT } from '../middleware/auth.middleware';
import { requireRole } from '../middleware/role.middleware';
import { Role } from '@prisma/client';

const router = Router();

router.use(authenticateJWT);

router.get('/', ChallanController.getChallans);
router.post('/', requireRole(Role.ADMIN, Role.SALES), ChallanController.createChallan);
router.get('/:id', ChallanController.getChallanById);
router.post('/:id/confirm', requireRole(Role.ADMIN, Role.SALES), ChallanController.confirmChallan);
router.post('/:id/cancel', requireRole(Role.ADMIN, Role.SALES), ChallanController.cancelChallan);

export default router;
