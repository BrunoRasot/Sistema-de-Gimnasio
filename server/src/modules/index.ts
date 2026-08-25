import { Router } from 'express';
import asistenciasRoutes from './asistencias/asistencias.routes.js';
import authRoutes from './auth/auth.routes.js';
import categoriaRoutes from './categorias/categoria.routes.js';
import configuracionRoutes from './configuracion/configuracion.routes.js';
import miembroRoutes from './membresias/miembro.routes.js';
import pagosRoutes from './pagos/pagos.routes.js';
import permisosRoutes from './permisos/permisos.routes.js';
import planRoutes from './planes/plan.routes.js';
import productoRoutes from './productos/producto.routes.js';
import proveedorRoutes from './proveedores/proveedor.routes.js';
import reportesRoutes from './reportes/reportes.routes.js';
import usuarioRoutes from './usuarios/usuario.routes.js';
import ventasRoutes from './ventas/ventas.routes.js';
import healthRoutes from './health/health.routes.js';

const apiRouter = Router();

apiRouter.use('/health', healthRoutes);
apiRouter.use('/usuarios', usuarioRoutes);
apiRouter.use('/auth', authRoutes);
apiRouter.use('/permisos', permisosRoutes);
apiRouter.use('/planes', planRoutes);
apiRouter.use('/miembros', miembroRoutes);
apiRouter.use('/categorias', categoriaRoutes);
apiRouter.use('/productos', productoRoutes);
apiRouter.use('/proveedores', proveedorRoutes);
apiRouter.use('/ventas', ventasRoutes);
apiRouter.use('/pagos', pagosRoutes);
apiRouter.use('/asistencias', asistenciasRoutes);
apiRouter.use('/reportes', reportesRoutes);
apiRouter.use('/configuracion', configuracionRoutes);

export { apiRouter };
