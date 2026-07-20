import { Router } from 'express';
import { login, verificarOtp } from '../controllers/auth.controller.js';

const router = Router();
router.post('/login', login);
router.post('/verificar-otp', verificarOtp);
export default router;