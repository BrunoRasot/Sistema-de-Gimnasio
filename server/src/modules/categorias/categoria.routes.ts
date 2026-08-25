import { Router } from 'express';
import {
  obtenerCategorias,
  crearCategoria,
  actualizarCategoria,
  eliminarCategoria,
} from './categoria.controller.js';
import { verificarToken } from '../../middlewares/auth.middleware.js';
import { verificarPermiso } from '../../middlewares/permisos.middleware.js';
import { auditar } from '../../middlewares/auditoria.middleware.js';
import { validarSchema } from '../../middlewares/validacion.middleware.js';
import { categoriaSchema } from '../../schemas/index.js';

const router = Router();

router.get('/', verificarToken, verificarPermiso('inventario', 'ver'), obtenerCategorias);

router.post(
  '/',
  verificarToken,
  verificarPermiso('inventario', 'crear'),
  auditar('Inventario'),
  validarSchema(categoriaSchema),
  crearCategoria,
);

router.put(
  '/:id',
  verificarToken,
  verificarPermiso('inventario', 'editar'),
  auditar('Inventario'),
  validarSchema(categoriaSchema),
  actualizarCategoria,
);

router.delete(
  '/:id',
  verificarToken,
  verificarPermiso('inventario', 'eliminar'),
  auditar('Inventario'),
  eliminarCategoria,
);

export default router;

