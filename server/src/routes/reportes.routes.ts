import { Router } from 'express';
import { getReporteVentas, getReporteMembresias, getReporteAsistencias, getReporteInventario } from '../controllers/reportes.controller.js';
import { verificarToken } from '../middlewares/auth.middleware.js';

const router = Router();

router.get('/ventas', verificarToken, getReporteVentas);
router.get('/membresias', verificarToken, getReporteMembresias);
router.get('/asistencias', verificarToken, getReporteAsistencias);
router.get('/inventario', verificarToken, getReporteInventario);

export default router;