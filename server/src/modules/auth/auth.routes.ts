import { Router } from 'express';
import { AuthController } from './auth.controller.js';
import { validate } from '../../middleware/validate.js';
import { auth } from '../../middleware/auth.js';
import { loginSchema } from './auth.schema.js';

const router = Router();

router.post('/login', validate(loginSchema), AuthController.login);
router.get('/me', auth, AuthController.me);

export default router;
