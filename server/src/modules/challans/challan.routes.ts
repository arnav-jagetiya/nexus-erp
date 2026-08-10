import { Router } from 'express';
import { ChallanController } from './challan.controller.js';
import { auth } from '../../middleware/auth.js';
import { rbac } from '../../middleware/rbac.js';
import { validate } from '../../middleware/validate.js';
import { createChallanSchema, updateChallanSchema } from './challan.schema.js';

const router = Router();

// Protect all challan routes with JWT authentication
router.use(auth);

router.post(
  '/',
  rbac(['ADMIN', 'SALES']),
  validate(createChallanSchema),
  ChallanController.create
);

router.get(
  '/',
  rbac(['ADMIN', 'SALES', 'WAREHOUSE', 'ACCOUNTS']),
  ChallanController.list
);

router.get(
  '/:id',
  rbac(['ADMIN', 'SALES', 'WAREHOUSE', 'ACCOUNTS']),
  ChallanController.getById
);

router.patch(
  '/:id',
  rbac(['ADMIN', 'SALES']),
  validate(updateChallanSchema),
  ChallanController.update
);

router.post(
  '/:id/cancel',
  rbac(['ADMIN', 'SALES']),
  ChallanController.cancel
);

router.post(
  '/:id/confirm',
  rbac(['ADMIN', 'SALES']),
  ChallanController.confirm
);

export default router;
