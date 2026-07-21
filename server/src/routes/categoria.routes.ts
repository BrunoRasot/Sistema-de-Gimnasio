import { Router } from 'express';
import { obtenerCategorias, crearCategoria, actualizarCategoria, eliminarCategoria } from '../controllers/categoria.controller.js';
import { verificarToken } from '../middlewares/auth.middleware.js';
import { auditar } from '../middlewares/auditoria.middleware.js';

const router = Router();

router.get('/', verificarToken, obtenerCategorias);
router.post('/', verificarToken, auditar('Inventario'), crearCategoria);
router.put('/:id', verificarToken, auditar('Inventario'), actualizarCategoria);
router.delete('/:id', verificarToken, auditar('Inventario'), eliminarCategoria);

export default router;