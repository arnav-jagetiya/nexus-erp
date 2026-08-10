import { Router } from 'express';
import { ProductController } from './product.controller.js';
import { auth } from '../../middleware/auth.js';
import { rbac } from '../../middleware/rbac.js';
import { validate } from '../../middleware/validate.js';
import { createProductSchema, updateProductSchema } from './product.schema.js';

const router = Router();

// Protect all product routes with JWT authentication
router.use(auth);

router.post(
  '/',
  rbac(['ADMIN', 'WAREHOUSE']),
  validate(createProductSchema),
  ProductController.create
);

router.get(
  '/',
  rbac(['ADMIN', 'SALES', 'WAREHOUSE', 'ACCOUNTS']),
  ProductController.list
);

router.get(
  '/:id',
  rbac(['ADMIN', 'SALES', 'WAREHOUSE', 'ACCOUNTS']),
  ProductController.getById
);

router.patch(
  '/:id',
  rbac(['ADMIN', 'WAREHOUSE']),
  validate(updateProductSchema),
  ProductController.update
);

router.delete(
  '/:id',
  rbac(['ADMIN', 'WAREHOUSE']),
  ProductController.delete
);

export default router;
