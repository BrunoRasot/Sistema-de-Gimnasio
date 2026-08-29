import type { RequestHandler } from 'express';
import { env } from '../config/env.js';

const localOrigins = new Set(['http://localhost:5173', 'http://127.0.0.1:5173']);
export const allowedOrigins = new Set([
  ...(env.NODE_ENV === 'production' ? [] : localOrigins),
  ...(env.FRONTEND_URL ? [env.FRONTEND_URL.replace(/\/$/, '')] : []),
]);

const isMutation = (method: string) => !['GET', 'HEAD', 'OPTIONS'].includes(method);

export const blockCrossSiteMutations: RequestHandler = (req, res, next) => {
  if (isMutation(req.method) && req.header('sec-fetch-site') === 'cross-site') {
    const origin = req.header('origin')?.replace(/\/$/, '');
    if (origin && allowedOrigins.has(origin)) return next();
    return res.status(403).json({ mensaje: 'Solicitud de origen cruzado rechazada.' });
  }
  next();
};

export const requireTrustedCookieOrigin: RequestHandler = (req, res, next) => {
  if (env.NODE_ENV !== 'production') return next();
  const origin = req.header('origin')?.replace(/\/$/, '');
  if (!origin || !allowedOrigins.has(origin)) return res.status(403).json({ mensaje: 'Origen de sesión no permitido.' });
  next();
};

export const requireJsonForBody: RequestHandler = (req, res, next) => {
  if (isMutation(req.method) && req.headers['content-length'] !== '0' && req.headers['content-length'] && !req.is('application/json')) {
    return res.status(415).json({ mensaje: 'El cuerpo debe enviarse como application/json.' });
  }
  next();
};

export const noStoreApiResponses: RequestHandler = (_req, res, next) => {
  res.setHeader('Cache-Control', 'no-store');
  res.setHeader('Pragma', 'no-cache');
  next();
};
