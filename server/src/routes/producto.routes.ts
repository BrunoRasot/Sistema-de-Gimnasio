import { Router } from 'express';
import {
  obtenerProductos,
  crearProducto,
  actualizarProducto,
  eliminarProducto,
} from '../controllers/producto.controller.js';
import { verificarToken } from '../middlewares/auth.middleware.js';
import { verificarPermiso } from '../middlewares/permisos.middleware.js';
import { auditar } from '../middlewares/auditoria.middleware.js';

const router = Router();

router.get('/', verificarToken, verificarPermiso('inventario', 'ver'), obtenerProductos);
router.post(
  '/',
  verificarToken,
  verificarPermiso('inventario', 'crear'),
  auditar('Inventario'),
  crearProducto,
);
router.put(
  '/:id',
  verificarToken,
  verificarPermiso('inventario', 'editar'),
  auditar('Inventario'),
  actualizarProducto,
);
router.delete(
  '/:id',
  verificarToken,
  verificarPermiso('inventario', 'eliminar'),
  auditar('Inventario'),
  eliminarProducto,
);

export default router;
