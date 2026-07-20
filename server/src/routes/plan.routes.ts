import { Router } from 'express';
import { obtenerPlanes, crearPlan, actualizarPlan, eliminarPlan } from '../controllers/plan.controller.js';
import { auditar } from '../middlewares/auditoria.middleware.js';
import { verificarToken } from '../middlewares/auth.middleware.js';
import { verificarPermiso } from '../middlewares/permisos.middleware.js';

const router = Router();

router.get('/', verificarToken, verificarPermiso('membresias', 'ver'), obtenerPlanes);
router.post('/', verificarToken, verificarPermiso('membresias', 'crear'), auditar('Planes'), crearPlan);
router.put('/:id', verificarToken, verificarPermiso('membresias', 'editar'), auditar('Planes'), actualizarPlan);
router.delete('/:id', verificarToken, verificarPermiso('membresias', 'eliminar'), auditar('Planes'), eliminarPlan);

export default router;