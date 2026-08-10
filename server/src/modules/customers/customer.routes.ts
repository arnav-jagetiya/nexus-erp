import { Router } from 'express';
import { CustomerController } from './customer.controller.js';
import { auth } from '../../middleware/auth.js';
import { rbac } from '../../middleware/rbac.js';
import { validate } from '../../middleware/validate.js';
import {
  createCustomerSchema,
  updateCustomerSchema,
  createFollowUpSchema,
} from './customer.schema.js';

const router = Router();

// Protect all customer routes with JWT authentication
router.use(auth);

router.post(
  '/',
  rbac(['ADMIN', 'SALES']),
  validate(createCustomerSchema),
  CustomerController.create
);

router.get(
  '/',
  rbac(['ADMIN', 'SALES', 'ACCOUNTS']),
  CustomerController.list
);

router.get(
  '/:id',
  rbac(['ADMIN', 'SALES', 'ACCOUNTS']),
  CustomerController.getById
);

router.patch(
  '/:id',
  rbac(['ADMIN', 'SALES']),
  validate(updateCustomerSchema),
  CustomerController.update
);

router.delete(
  '/:id',
  rbac(['ADMIN']),
  CustomerController.delete
);

router.post(
  '/:id/followups',
  rbac(['ADMIN', 'SALES']),
  validate(createFollowUpSchema),
  CustomerController.createFollowUp
);

router.get(
  '/:id/followups',
  rbac(['ADMIN', 'SALES', 'ACCOUNTS']),
  CustomerController.listFollowUps
);

export default router;
