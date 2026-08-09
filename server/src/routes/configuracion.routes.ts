import { Router } from 'express';
import {
  obtenerConfiguracion,
  actualizarInfo,
  actualizarNotificaciones,
  cambiarPassword,
  obtenerAlertasTiempoReal,
} from '../controllers/configuracion.controller.js';
import { verificarToken } from '../middlewares/auth.middleware.js';
import { verificarPermiso } from '../middlewares/permisos.middleware.js';
import { auditar } from '../middlewares/auditoria.middleware.js';
import { validarSchema } from '../middlewares/validacion.middleware.js';
import { configuracionInfoSchema } from '../schemas/index.js';

const router = Router();

router.get('/', verificarToken, obtenerConfiguracion);
router.get('/alertas', verificarToken, obtenerAlertasTiempoReal);

router.put(
  '/info',
  verificarToken,
  verificarPermiso('configuracion', 'editar'),
  auditar('Configuración'),
  validarSchema(configuracionInfoSchema),
  actualizarInfo,
);

router.put(
  '/notificaciones',
  verificarToken,
  verificarPermiso('configuracion', 'editar'),
  auditar('Configuración'),
  actualizarNotificaciones,
);

router.post('/cambiar-password', verificarToken, cambiarPassword);

export default router;
