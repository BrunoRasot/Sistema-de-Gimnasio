import { Router } from 'express';
import {
  obtenerUsuarios,
  obtenerUsuarioPorId,
  crearUsuario,
  actualizarUsuario,
  eliminarUsuario,
  cambiarEstadoCuenta,
  restablecerPassword,
} from './usuario.controller.js';
import { verificarToken } from '../../middlewares/auth.middleware.js';
import { verificarPermiso } from '../../middlewares/permisos.middleware.js';
import { auditar } from '../../middlewares/auditoria.middleware.js';

const router = Router();

router.get('/', verificarToken, verificarPermiso('usuarios', 'ver'), obtenerUsuarios);
router.get('/:id', verificarToken, verificarPermiso('usuarios', 'ver'), obtenerUsuarioPorId);
router.post('/', verificarToken, verificarPermiso('usuarios', 'crear'), auditar('Usuarios'), crearUsuario);
router.put('/:id', verificarToken, verificarPermiso('usuarios', 'editar'), auditar('Usuarios'), actualizarUsuario);
router.delete('/:id', verificarToken, verificarPermiso('usuarios', 'eliminar'), auditar('Usuarios'), eliminarUsuario);
router.patch(
  '/:id/estado',
  verificarToken,
  verificarPermiso('usuarios', 'editar'),
  auditar('Usuarios'),
  cambiarEstadoCuenta,
);
router.patch(
  '/:id/restablecer-password',
  verificarToken,
  verificarPermiso('usuarios', 'editar'),
  auditar('Usuarios'),
  restablecerPassword,
);

export default router;

