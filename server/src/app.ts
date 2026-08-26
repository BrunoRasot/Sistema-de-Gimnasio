import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import cookieParser from 'cookie-parser';

import { env } from './config/env.js';
import { apiRouter } from './modules/index.js';
import { errorHandler, notFoundHandler } from './middlewares/error.middleware.js';
import { requestContext } from './middlewares/request-context.middleware.js';

const app = express();

if (env.NODE_ENV === 'production') app.set('trust proxy', 1);

app.use(helmet());
app.use(requestContext);

const dominiosPermitidos = [
  'http://localhost:5173',
  'http://127.0.0.1:5173',
  env.FRONTEND_URL,
].filter((origin): origin is string => Boolean(origin));

app.use(
  cors({
    origin: function (origin, callback) {
      if (!origin || dominiosPermitidos.includes(origin)) {
        callback(null, true);
      } else {
        callback(new Error(`Acceso denegado por políticas de CORS. Origen: ${origin}`));
      }
    },
    credentials: true,
  }),
);

const generalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 3000,
  message: { mensaje: 'Tráfico inusual detectado en la red. Por favor, espera unos minutos.' },
  standardHeaders: true,
  legacyHeaders: false,
});

app.use(generalLimiter);
app.use(cookieParser());
app.use(express.json({ limit: '2mb' }));
app.use(express.urlencoded({ limit: '2mb', extended: true }));

app.use('/api', apiRouter);
app.use(notFoundHandler);
app.use(errorHandler);

export default app;
