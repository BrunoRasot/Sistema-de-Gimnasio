import { randomUUID } from 'node:crypto';
import type { RequestHandler } from 'express';
import { logger } from '../utils/logger.js';

const validRequestId = /^[A-Za-z0-9._:-]{1,128}$/;

export const requestContext: RequestHandler = (req, res, next) => {
  const candidate = req.header('x-request-id');
  const requestId = candidate && validRequestId.test(candidate) ? candidate : randomUUID();
  const startedAt = process.hrtime.bigint();

  req.headers['x-request-id'] = requestId;
  res.setHeader('x-request-id', requestId);

  res.once('finish', () => {
    const durationMs = Number(process.hrtime.bigint() - startedAt) / 1_000_000;
    logger.http('Solicitud HTTP completada', {
      requestId,
      method: req.method,
      path: req.originalUrl,
      status: res.statusCode,
      durationMs: Number(durationMs.toFixed(2)),
      ip: req.ip,
    });
  });

  next();
};
