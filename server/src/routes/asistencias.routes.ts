import { Router } from 'express';
import { registrarAsistencia, obtenerAsistenciasHoy, buscarMiembroPorDni } from '../controllers/asistencias.controller.js';
import { verificarToken } from '../middlewares/auth.middleware.js';

const router = Router();

router.post('/registrar', verificarToken, registrarAsistencia);
router.get('/hoy', verificarToken, obtenerAsistenciasHoy);
router.get('/buscar/:dni', verificarToken, buscarMiembroPorDni);

export default router;