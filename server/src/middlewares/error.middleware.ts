import type { ErrorRequestHandler, RequestHandler } from 'express';
import { logger } from '../utils/logger.js';

export const notFoundHandler: RequestHandler = (req, res) => {
  res.status(404).json({ mensaje: 'Ruta no encontrada', ruta: req.originalUrl });
};

export const errorHandler: ErrorRequestHandler = (error, req, res, _next) => {
  const requestId = req.headers['x-request-id'];
  const candidateStatus = Number(error?.status ?? error?.statusCode);
  const status = candidateStatus >= 400 && candidateStatus < 500 ? candidateStatus : 500;
  logger.error('Error HTTP no controlado', {
    error: error instanceof Error ? error.message : String(error),
    method: req.method,
    path: req.originalUrl,
    requestId,
  });

  res.status(status).json({
    mensaje: status === 413 ? 'El cuerpo de la solicitud excede el límite permitido' : 'Error interno del servidor',
    ...(requestId ? { requestId } : {}),
  });
};
