import { Router } from 'express';
import {
  obtenerVentas,
  crearVenta,
  registrarDevolucion,
  obtenerDevoluciones,
  obtenerComprobantePorId,
} from './ventas.controller.js';
import { verificarToken } from '../../middlewares/auth.middleware.js';
import { verificarPermiso } from '../../middlewares/permisos.middleware.js';
import { auditar } from '../../middlewares/auditoria.middleware.js';
import { validarSchema } from '../../middlewares/validacion.middleware.js';
import { devolucionSchema, ventaSchema } from '../../schemas/index.js';

const router = Router();

router.get('/', verificarToken, verificarPermiso('ventas', 'ver'), obtenerVentas);

router.post(
  '/',
  verificarToken,
  verificarPermiso('ventas', 'crear'),
  auditar('Ventas'),
  validarSchema(ventaSchema),
  crearVenta,
);

router.get(
  '/comprobantes/:id',
  verificarToken,
  verificarPermiso('ventas', 'ver'),
  obtenerComprobantePorId,
);

router.get('/devoluciones', verificarToken, verificarPermiso('ventas', 'ver'), obtenerDevoluciones);

router.post(
  '/devoluciones',
  verificarToken,
  verificarPermiso('ventas', 'eliminar'),
  auditar('Ventas'),
  validarSchema(devolucionSchema),
  registrarDevolucion,
);

export default router;

