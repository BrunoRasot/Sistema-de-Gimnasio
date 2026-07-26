import { Router } from 'express';
import { 
  obtenerConfiguracion, 
  actualizarInfo, 
  actualizarNotificaciones, 
  cambiarPassword,
  obtenerAlertasTiempoReal
} from '../controllers/configuracion.controller.js';
import { verificarToken } from '../middlewares/auth.middleware.js';

const router = Router();

router.get('/', verificarToken, obtenerConfiguracion);
router.put('/info', verificarToken, actualizarInfo);
router.put('/notificaciones', verificarToken, actualizarNotificaciones);
router.put('/seguridad/password', verificarToken, cambiarPassword);
router.get('/alertas-tiempo-real', verificarToken, obtenerAlertasTiempoReal);

export default router;