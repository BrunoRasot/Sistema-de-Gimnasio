import { Router } from 'express';
import {
  obtenerMiembros,
  buscarClientePorDni,
  crearSoloCliente,
  asignarMembresia,
  inactivarCliente,
  renovarMembresia
} from '../controllers/miembro.controller.js';
import { verificarToken } from '../middlewares/auth.middleware.js';
import { auditar } from '../middlewares/auditoria.middleware.js';

const router = Router();

router.get('/', verificarToken, obtenerMiembros);
router.get('/buscar/:dni', verificarToken, buscarClientePorDni);
router.post('/cliente', verificarToken, auditar('Membresías'), crearSoloCliente);
router.post('/asignar-membresia', verificarToken, auditar('Membresías'), asignarMembresia);
router.patch('/:id/inactivar', verificarToken, auditar('Membresías'), inactivarCliente);
router.post('/:id/renovar', verificarToken, auditar('Membresías'), renovarMembresia);

export default router;