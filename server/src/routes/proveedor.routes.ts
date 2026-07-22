import { Router } from 'express';
import { obtenerProveedores, crearProveedor, actualizarProveedor, eliminarProveedor } from '../controllers/proveedor.controller.js';
import { verificarToken } from '../middlewares/auth.middleware.js';
import { auditar } from '../middlewares/auditoria.middleware.js';

const router = Router();

router.get('/', verificarToken, obtenerProveedores);
router.post('/', verificarToken, auditar('Inventario'), crearProveedor);
router.put('/:id', verificarToken, auditar('Inventario'), actualizarProveedor);
router.delete('/:id', verificarToken, auditar('Inventario'), eliminarProveedor);

export default router;