import { Router } from 'express';
import { verificarToken } from '../../middlewares/auth.middleware.js';
import { verificarPermiso } from '../../middlewares/permisos.middleware.js';
import { listarAuditoria, obtenerAlertas, exportar } from './control.controller.js';
const router = Router();
router.get('/auditoria', verificarToken, verificarPermiso('auditoria', 'ver'), listarAuditoria);
router.get('/alertas', verificarToken, obtenerAlertas);
router.get('/exportar/:tipo', verificarToken, verificarPermiso('reportes', 'ver'), exportar);
export default router;
