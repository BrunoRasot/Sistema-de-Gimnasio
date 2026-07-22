import { Router } from 'express';
import { obtenerProductos, crearProducto, actualizarProducto, eliminarProducto } from '../controllers/producto.controller.js';
import { verificarToken } from '../middlewares/auth.middleware.js';
import { auditar } from '../middlewares/auditoria.middleware.js';

const router = Router();

router.get('/', verificarToken, obtenerProductos);
router.post('/', verificarToken, auditar('Inventario'), crearProducto);
router.put('/:id', verificarToken, auditar('Inventario'), actualizarProducto);
router.delete('/:id', verificarToken, auditar('Inventario'), eliminarProducto);

export default router;