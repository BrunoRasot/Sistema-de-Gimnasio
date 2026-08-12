import { Router } from 'express';
import { obtenerPermisos, guardarPermisos } from '../controllers/permisos.controller.js';
import { verificarToken, verificarAdmin } from '../middlewares/auth.middleware.js';
import { auditar } from '../middlewares/auditoria.middleware.js';
import { validarSchema } from '../middlewares/validacion.middleware.js';
import { permisoSchema } from '../schemas/index.js';

const router = Router();

router.get('/', verificarToken, obtenerPermisos);

router.post(
  '/',
  verificarToken,
  verificarAdmin,
  auditar('Permisos'),
  validarSchema(permisoSchema),
  guardarPermisos,
);

export default router;
