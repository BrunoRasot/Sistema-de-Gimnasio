import { Router } from 'express';
import {
  obtenerPlanes,
  crearPlan,
  actualizarPlan,
  eliminarPlan,
} from './plan.controller.js';
import { auditar } from '../../middlewares/auditoria.middleware.js';
import { verificarToken } from '../../middlewares/auth.middleware.js';
import { verificarPermiso } from '../../middlewares/permisos.middleware.js';
import { validarSchema } from '../../middlewares/validacion.middleware.js';
import { planSchema } from '../../schemas/index.js';

const router = Router();

router.get('/', verificarToken, verificarPermiso('membresias', 'ver'), obtenerPlanes);

router.post(
  '/',
  verificarToken,
  verificarPermiso('membresias', 'crear'),
  auditar('Planes'),
  validarSchema(planSchema),
  crearPlan,
);

router.put(
  '/:id',
  verificarToken,
  verificarPermiso('membresias', 'editar'),
  auditar('Planes'),
  validarSchema(planSchema),
  actualizarPlan,
);

router.delete(
  '/:id',
  verificarToken,
  verificarPermiso('membresias', 'eliminar'),
  auditar('Planes'),
  eliminarPlan,
);

export default router;

