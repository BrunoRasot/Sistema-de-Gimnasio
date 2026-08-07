import { Router } from 'express';
import {
  obtenerCategorias,
  crearCategoria,
  actualizarCategoria,
  eliminarCategoria,
} from '../controllers/categoria.controller.js';
import { verificarToken } from '../middlewares/auth.middleware.js';
import { verificarPermiso } from '../middlewares/permisos.middleware.js';
import { auditar } from '../middlewares/auditoria.middleware.js';

const router = Router();

router.get('/', verificarToken, verificarPermiso('inventario', 'ver'), obtenerCategorias);
router.post(
  '/',
  verificarToken,
  verificarPermiso('inventario', 'crear'),
  auditar('Inventario'),
  crearCategoria,
);
router.put(
  '/:id',
  verificarToken,
  verificarPermiso('inventario', 'editar'),
  auditar('Inventario'),
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
