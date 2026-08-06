import { Router } from 'express';
import {
  obtenerVentas,
  crearVenta,
  registrarDevolucion,
  obtenerDevoluciones,
  obtenerComprobantePorId,
} from '../controllers/ventas.controller.js';
import { verificarToken } from '../middlewares/auth.middleware.js';
import { auditar } from '../middlewares/auditoria.middleware.js';

const router = Router();

router.get('/', verificarToken, obtenerVentas);
router.post('/', verificarToken, auditar('Ventas'), crearVenta);
router.get('/comprobantes/:id', verificarToken, obtenerComprobantePorId);
router.get('/devoluciones', verificarToken, obtenerDevoluciones);
router.post('/devoluciones', verificarToken, auditar('Ventas'), registrarDevolucion);

export default router;
