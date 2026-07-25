import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import usuarioRoutes from './routes/usuario.routes.js';
import authRoutes from './routes/auth.routes.js';
import permisosRoutes from './routes/permisos.routes.js';
import planRoutes from './routes/plan.routes.js';
import miembroRoutes from './routes/miembro.routes.js';
import categoriaRoutes from './routes/categoria.routes.js';
import productoRoutes from './routes/producto.routes.js';
import proveedorRoutes from './routes/proveedor.routes.js';
import ventasRoutes from './routes/ventas.routes.js';
import pagosRoutes from './routes/pagos.routes.js';
import asistenciasRoutes from './routes/asistencias.routes.js';
import reportesRoutes from './routes/reportes.routes.js';

const app = express();

app.use(helmet());

const dominiosPermitidos = [
    'http://localhost:5173',
    process.env.FRONTEND_URL
];

app.use(cors({
    origin: function (origin, callback) {
        if (!origin || dominiosPermitidos.indexOf(origin) !== -1) {
            callback(null, true);
        } else {
            callback(new Error('Acceso denegado por políticas de CORS del servidor.'));
        }
    },
    credentials: true
}));

const limiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 150,
    message: { mensaje: 'Demasiadas peticiones desde tu conexión. Por seguridad, intenta de nuevo en 15 minutos.' },
    standardHeaders: true,
    legacyHeaders: false,
});

app.use(limiter);
app.use(express.json());
app.use('/api/usuarios', usuarioRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/permisos', permisosRoutes);
app.use('/api/planes', planRoutes);
app.use('/api/miembros', miembroRoutes);
app.use('/api/categorias', categoriaRoutes);
app.use('/api/productos', productoRoutes);
app.use('/api/proveedores', proveedorRoutes);
app.use('/api/ventas', ventasRoutes);
app.use('/api/pagos', pagosRoutes);
app.use('/api/asistencias', asistenciasRoutes);
app.use('/api/reportes', reportesRoutes);

export default app;