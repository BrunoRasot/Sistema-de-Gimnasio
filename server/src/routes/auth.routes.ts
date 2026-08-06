import { Router } from 'express';
import { login, verificarOtp, renovarToken, logout } from '../controllers/auth.controller.js';

const router = Router();

router.post('/login', login);
router.post('/verificar-otp', verificarOtp);
router.post('/refresh-token', renovarToken);
router.post('/logout', logout);

export default router;
