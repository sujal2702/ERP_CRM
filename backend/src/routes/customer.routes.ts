import { Router } from 'express';
import { CustomerController } from '../controllers/customer.controller';
import { authenticateJWT } from '../middleware/auth.middleware';
import { requireRole } from '../middleware/role.middleware';
import { Role } from '@prisma/client';

const router = Router();

// Apply Authentication Middleware to all customer routes
router.use(authenticateJWT);

// Customer CRUD Routes
router.get('/', CustomerController.getCustomers);
router.post('/', requireRole(Role.ADMIN, Role.SALES), CustomerController.createCustomer);
router.get('/:id', CustomerController.getCustomerById);
router.put('/:id', requireRole(Role.ADMIN, Role.SALES), CustomerController.updateCustomer);

// Follow-up Notes Routes
router.get('/:id/notes', CustomerController.getCustomerNotes);
router.post('/:id/notes', requireRole(Role.ADMIN, Role.SALES), CustomerController.addCustomerNote);

export default router;
