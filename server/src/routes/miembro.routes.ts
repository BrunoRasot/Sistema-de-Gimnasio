import { Router } from 'express';
import {
  obtenerMiembros,
  buscarClientePorDni,
  crearSoloCliente,
  asignarMembresia,
  inactivarCliente,
  renovarMembresia,
} from '../controllers/miembro.controller.js';
import { verificarToken } from '../middlewares/auth.middleware.js';
import { verificarPermiso } from '../middlewares/permisos.middleware.js';
import { auditar } from '../middlewares/auditoria.middleware.js';
import { validarSchema } from '../middlewares/validacion.middleware.js';
import { miembroSchema, asignarMembresiaSchema, renovarMembresiaSchema } from '../schemas/index.js';

const router = Router();

router.get('/', verificarToken, verificarPermiso('membresias', 'ver'), obtenerMiembros);

router.get(
  '/buscar/:dni',
  verificarToken,
  verificarPermiso('membresias', 'ver'),
  buscarClientePorDni,
);

router.post(
  '/cliente',
  verificarToken,
  verificarPermiso('membresias', 'crear'),
  auditar('Membresias'),
  validarSchema(miembroSchema),
  crearSoloCliente,
);

router.post(
  '/asignar-membresia',
  verificarToken,
  verificarPermiso('membresias', 'crear'),
  auditar('Membresias'),
  validarSchema(asignarMembresiaSchema),
  asignarMembresia,
);

router.patch(
  '/:id/inactivar',
  verificarToken,
  verificarPermiso('membresias', 'eliminar'),
  auditar('Membresias'),
  inactivarCliente,
);

router.post(
  '/:id/renovar',
  verificarToken,
  verificarPermiso('membresias', 'editar'),
  auditar('Membresias'),
  validarSchema(renovarMembresiaSchema),
  renovarMembresia,
);

export default router;
