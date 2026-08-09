import { Router } from 'express';
import {
  obtenerUsuarios,
  obtenerUsuarioPorId,
  crearUsuario,
  actualizarUsuario,
  eliminarUsuario,
  cambiarEstadoCuenta,
  restablecerPassword,
} from '../controllers/usuario.controller.js';
import { verificarToken, verificarAdmin } from '../middlewares/auth.middleware.js';
import { auditar } from '../middlewares/auditoria.middleware.js';

const router = Router();

router.get('/', verificarToken, verificarAdmin, obtenerUsuarios);
router.get('/:id', verificarToken, verificarAdmin, obtenerUsuarioPorId);
router.post('/', verificarToken, verificarAdmin, auditar('Usuarios'), crearUsuario);
router.put('/:id', verificarToken, verificarAdmin, auditar('Usuarios'), actualizarUsuario);
router.delete('/:id', verificarToken, verificarAdmin, auditar('Usuarios'), eliminarUsuario);
router.patch(
  '/:id/estado',
  verificarToken,
  verificarAdmin,
  auditar('Usuarios'),
  cambiarEstadoCuenta,
);
router.patch(
  '/:id/restablecer-password',
  verificarToken,
  verificarAdmin,
  auditar('Usuarios'),
  restablecerPassword,
);

export default router;
