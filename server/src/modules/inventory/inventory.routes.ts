import { Router } from 'express';
import { InventoryController } from './inventory.controller.js';
import { auth } from '../../middleware/auth.js';
import { rbac } from '../../middleware/rbac.js';
import { validate } from '../../middleware/validate.js';
import { createMovementSchema } from './inventory.schema.js';

const router = Router();

// Protect all inventory routes with JWT authentication
router.use(auth);

router.get(
  '/',
  rbac(['ADMIN', 'SALES', 'WAREHOUSE', 'ACCOUNTS']),
  InventoryController.getOverview
);

router.get(
  '/movements',
  rbac(['ADMIN', 'WAREHOUSE', 'ACCOUNTS']),
  InventoryController.listMovements
);

router.post(
  '/movements',
  rbac(['ADMIN', 'WAREHOUSE']),
  validate(createMovementSchema),
  InventoryController.createMovement
);

export default router;
