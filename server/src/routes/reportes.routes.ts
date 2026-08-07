import { Router } from 'express';
import {
  getReporteVentas,
  getReporteMembresias,
  getReporteAsistencias,
  getReporteInventario,
} from '../controllers/reportes.controller.js';
import { verificarToken } from '../middlewares/auth.middleware.js';
import { verificarPermiso } from '../middlewares/permisos.middleware.js';

const router = Router();

router.get('/ventas', verificarToken, verificarPermiso('reportes', 'ver'), getReporteVentas);
router.get(
  '/membresias',
  verificarToken,
  verificarPermiso('reportes', 'ver'),
  getReporteMembresias,
);
router.get(
  '/asistencias',
  verificarToken,
  verificarPermiso('reportes', 'ver'),
  getReporteAsistencias,
);
router.get(
  '/inventario',
  verificarToken,
  verificarPermiso('reportes', 'ver'),
  getReporteInventario,
);

export default router;
