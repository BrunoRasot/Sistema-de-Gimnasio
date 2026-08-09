import { Router } from 'express';
import {
  obtenerMetodos,
  crearMetodo,
  actualizarMetodo,
  obtenerPagos,
  registrarPago,
  anularPago,
} from '../controllers/pagos.controller.js';
import { verificarToken } from '../middlewares/auth.middleware.js';
import { verificarPermiso } from '../middlewares/permisos.middleware.js';
import { auditar } from '../middlewares/auditoria.middleware.js';
import { validarSchema } from '../middlewares/validacion.middleware.js';
import { pagoSchema } from '../schemas/index.js';

const router = Router();

router.get('/metodos', verificarToken, verificarPermiso('pagos', 'ver'), obtenerMetodos);
router.post(
  '/metodos',
  verificarToken,
  verificarPermiso('pagos', 'crear'),
  auditar('Pagos'),
  crearMetodo,
);
router.put(
  '/metodos/:id',
  verificarToken,
  verificarPermiso('pagos', 'editar'),
  auditar('Pagos'),
  actualizarMetodo,
);

router.get('/', verificarToken, verificarPermiso('pagos', 'ver'), obtenerPagos);
router.post(
  '/',
  verificarToken,
  verificarPermiso('pagos', 'crear'),
  auditar('Pagos'),
  validarSchema(pagoSchema),
  registrarPago,
);
router.patch(
  '/:id/anular',
  verificarToken,
  verificarPermiso('pagos', 'eliminar'),
  auditar('Pagos'),
  anularPago,
);

export default router;
