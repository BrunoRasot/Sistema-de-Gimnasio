import { Router } from 'express';
import { crearUsuario } from '../controllers/usuario.controller.js';
import { verificarToken, verificarAdmin } from '../middlewares/auth.middleware.js';

const router = Router();
router.post('/registrar-usuario', verificarToken, verificarAdmin, crearUsuario);

export default router;
