import { Router } from 'express';
import {
  obtenerProveedores,
  crearProveedor,
  actualizarProveedor,
  eliminarProveedor,
} from './proveedor.controller.js';
import { verificarToken } from '../../middlewares/auth.middleware.js';
import { verificarPermiso } from '../../middlewares/permisos.middleware.js';
import { auditar } from '../../middlewares/auditoria.middleware.js';
import { validarSchema } from '../../middlewares/validacion.middleware.js';
import { proveedorSchema } from '../../schemas/index.js';

const router = Router();

router.get('/', verificarToken, verificarPermiso('productos', 'ver'), obtenerProveedores);

router.post(
  '/',
  verificarToken,
  verificarPermiso('productos', 'crear'),
  auditar('Inventario'),
  validarSchema(proveedorSchema),
  crearProveedor,
);

router.put(
  '/:id',
  verificarToken,
  verificarPermiso('productos', 'editar'),
  auditar('Inventario'),
  validarSchema(proveedorSchema),
  actualizarProveedor,
);

router.delete(
  '/:id',
  verificarToken,
  verificarPermiso('productos', 'eliminar'),
  auditar('Inventario'),
  eliminarProveedor,
);

export default router;

