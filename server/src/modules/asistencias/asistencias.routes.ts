import { Router } from 'express';
import {
  registrarAsistencia,
  obtenerAsistenciasHoy,
  buscarMiembroPorDni,
} from './asistencias.controller.js';
import { verificarToken } from '../../middlewares/auth.middleware.js';
import { verificarPermiso } from '../../middlewares/permisos.middleware.js';

const router = Router();

router.post(
  '/registrar',
  verificarToken,
  verificarPermiso('asistencias', 'crear'),
  registrarAsistencia,
);
router.get('/hoy', verificarToken, verificarPermiso('asistencias', 'ver'), obtenerAsistenciasHoy);
router.get(
  '/buscar/:dni',
  verificarToken,
  verificarPermiso('asistencias', 'ver'),
  buscarMiembroPorDni,
);

export default router;

