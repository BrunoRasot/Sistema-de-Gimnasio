import { Router } from 'express';
import { crearUsuario } from '../controllers/usuario.controller.js';
import { verificarToken } from '../middlewares/auth.middleware.js';

const router = Router();

router.post('/registrar-usuario', verificarToken, crearUsuario);

export default router;