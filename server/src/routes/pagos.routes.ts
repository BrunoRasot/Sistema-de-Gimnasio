import { Router } from 'express';
import { 
  obtenerMetodos, crearMetodo, actualizarMetodo, 
  obtenerPagos, registrarPago, anularPago 
} from '../controllers/pagos.controller.js';
import { verificarToken } from '../middlewares/auth.middleware.js';
import { auditar } from '../middlewares/auditoria.middleware.js';

const router = Router();

router.get('/metodos', verificarToken, obtenerMetodos);
router.post('/metodos', verificarToken, auditar('Pagos'), crearMetodo);
router.put('/metodos/:id', verificarToken, auditar('Pagos'), actualizarMetodo);

router.get('/', verificarToken, obtenerPagos);
router.post('/', verificarToken, auditar('Pagos'), registrarPago);
router.patch('/:id/anular', verificarToken, auditar('Pagos'), anularPago);

export default router;