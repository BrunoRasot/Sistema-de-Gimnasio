import { Router } from 'express';
import { obtenerPermisos, guardarPermisos, obtenerMisPermisos, obtenerCargos } from './permisos.controller.js';
import { verificarToken, verificarAdmin } from '../../middlewares/auth.middleware.js';
import { auditar } from '../../middlewares/auditoria.middleware.js';
import { validarSchema } from '../../middlewares/validacion.middleware.js';
import { permisoSchema } from '../../schemas/index.js';

const router = Router();

router.get('/mios', verificarToken, obtenerMisPermisos);
router.get('/cargos', verificarToken, verificarAdmin, obtenerCargos);
router.get('/', verificarToken, verificarAdmin, obtenerPermisos);

router.post(
  '/',
  verificarToken,
  verificarAdmin,
  auditar('Permisos'),
  validarSchema(permisoSchema),
  guardarPermisos,
);

export default router;

