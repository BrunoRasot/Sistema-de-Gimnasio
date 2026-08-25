import { Router } from 'express';
import {
  obtenerProductos,
  crearProducto,
  actualizarProducto,
  eliminarProducto,
} from './producto.controller.js';
import { verificarToken } from '../../middlewares/auth.middleware.js';
import { verificarPermiso } from '../../middlewares/permisos.middleware.js';
import { auditar } from '../../middlewares/auditoria.middleware.js';
import { validarSchema } from '../../middlewares/validacion.middleware.js';
import { productoSchema } from '../../schemas/index.js';

const router = Router();

router.get('/', verificarToken, verificarPermiso('inventario', 'ver'), obtenerProductos);

router.post(
  '/',
  verificarToken,
  verificarPermiso('inventario', 'crear'),
  auditar('Inventario'),
  validarSchema(productoSchema),
  crearProducto,
);

router.put(
  '/:id',
  verificarToken,
  verificarPermiso('inventario', 'editar'),
  auditar('Inventario'),
  validarSchema(productoSchema),
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

