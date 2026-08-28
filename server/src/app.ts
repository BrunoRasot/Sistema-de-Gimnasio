import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import cookieParser from 'cookie-parser';

import { env } from './config/env.js';
import { apiRouter } from './modules/index.js';
import { errorHandler, notFoundHandler } from './middlewares/error.middleware.js';
import { requestContext } from './middlewares/request-context.middleware.js';
import { allowedOrigins, blockCrossSiteMutations, noStoreApiResponses, requireJsonForBody } from './middlewares/security.middleware.js';

const app = express();
app.disable('x-powered-by');

if (env.NODE_ENV === 'production') app.set('trust proxy', 1);

app.use(helmet({ crossOriginResourcePolicy: { policy: 'same-site' }, referrerPolicy: { policy: 'no-referrer' } }));
app.use(requestContext);
app.use(blockCrossSiteMutations);

app.use(
  cors({
    origin: function (origin, callback) {
      if (!origin || allowedOrigins.has(origin.replace(/\/$/, ''))) {
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
app.use(express.json({ limit: '3mb', strict: true }));
app.use(express.urlencoded({ limit: '64kb', extended: false }));

app.use('/api', noStoreApiResponses, requireJsonForBody, apiRouter);
app.use(notFoundHandler);
app.use(errorHandler);

export default app;
