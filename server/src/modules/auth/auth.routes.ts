import { Router } from 'express';
import rateLimit from 'express-rate-limit';
import { login, verificarOtp, renovarToken, logout, solicitarRecuperacionPassword, restablecerPassword } from './auth.controller.js';

const router = Router();

const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  message: { mensaje: 'Demasiados intentos de login. Intenta en 15 minutos.' },
});

const otpLimiter = rateLimit({
  windowMs: 10 * 60 * 1000,
  max: 5,
  message: { mensaje: 'Demasiados intentos de verificación OTP. Cuenta temporalmente bloqueada.' },
});

const recoveryLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 5,
  message: { mensaje: 'Demasiadas solicitudes. Intenta nuevamente en 15 minutos.' },
});

router.post('/login', loginLimiter, login);
router.post('/verificar-otp', otpLimiter, verificarOtp);
router.post('/refresh-token', renovarToken);
router.post('/logout', logout);
router.post('/solicitar-recuperacion', recoveryLimiter, solicitarRecuperacionPassword);
router.post('/restablecer-password', recoveryLimiter, restablecerPassword);

export default router;

