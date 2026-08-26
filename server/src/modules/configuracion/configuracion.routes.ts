import { Router } from 'express';
import {
  obtenerConfiguracion,
  actualizarInfo,
  actualizarNotificaciones,
  cambiarPassword,
  obtenerAlertasTiempoReal,
} from './configuracion.controller.js';
import { verificarToken } from '../../middlewares/auth.middleware.js';
import { verificarPermiso } from '../../middlewares/permisos.middleware.js';
import { auditar } from '../../middlewares/auditoria.middleware.js';
import { validarSchema } from '../../middlewares/validacion.middleware.js';
import {
  cambiarPasswordSchema,
  configuracionInfoSchema,
  notificacionesSchema,
} from '../../schemas/index.js';

const router = Router();

router.get('/', verificarToken, verificarPermiso('configuracion', 'ver'), obtenerConfiguracion);
router.get('/alertas-tiempo-real', verificarToken, obtenerAlertasTiempoReal);

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
  validarSchema(notificacionesSchema),
  actualizarNotificaciones,
);

router.post(
  '/cambiar-password',
  verificarToken,
  validarSchema(cambiarPasswordSchema),
  cambiarPassword,
);

export default router;

