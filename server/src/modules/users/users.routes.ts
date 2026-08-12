import { Router } from 'express';
import { UsersController } from './users.controller.js';
import { auth } from '../../middleware/auth.js';
import { rbac } from '../../middleware/rbac.js';
import { validate } from '../../middleware/validate.js';
import { userIdSchema, suspendSchema, revokeSchema, revokeAdminSchema } from './users.schema.js';

const router = Router();

// All routes require authentication and ADMIN role
router.use(auth, rbac(['ADMIN']));

router.get('/', UsersController.listUsers);
router.patch('/:id/approve', validate(userIdSchema), UsersController.approve);
router.patch('/:id/reject', validate(userIdSchema), UsersController.reject);

router.patch('/:id/suspend', validate(suspendSchema), UsersController.suspend);
router.patch('/:id/reactivate', validate(userIdSchema), UsersController.reactivate);
router.patch('/:id/revoke', validate(revokeSchema), UsersController.revoke);
router.patch('/:id/revoke-admin', validate(revokeAdminSchema), UsersController.revokeAdmin);

export default router;
