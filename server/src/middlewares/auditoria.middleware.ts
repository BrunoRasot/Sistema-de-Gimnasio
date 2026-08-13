import { Request, Response, NextFunction } from 'express';
import { prisma } from '../database/prisma.js';
import { logger } from '../utils/logger.js';

export const auditar = (modulo: string) => {
  return async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    const usuarioId = (req as any).usuario?.id;
    const ip = req.ip || req.socket.remoteAddress;
    const metodo = req.method;
    const ruta = req.originalUrl;

    res.on('finish', async () => {
      if (res.statusCode >= 200 && res.statusCode < 400 && metodo !== 'GET') {
        try {
          const sanitizedBody = { ...req.body };
          if (sanitizedBody.password) sanitizedBody.password = '***OCULTO***';
          if (sanitizedBody.nuevaPassword) sanitizedBody.nuevaPassword = '***OCULTO***';
          if (sanitizedBody.confirmPassword) sanitizedBody.confirmPassword = '***OCULTO***';
          if (sanitizedBody.actual) sanitizedBody.actual = '***OCULTO***';
          if (sanitizedBody.nueva) sanitizedBody.nueva = '***OCULTO***';

          await prisma.auditoria.create({
            data: {
              usuarioId: usuarioId ? Number(usuarioId) : null,
              accion: `${metodo} ${ruta}`,
              modulo,
              detalles: JSON.stringify({
                body: sanitizedBody,
                params: req.params,
                query: req.query,
              }),
              ip: String(ip),
            },
          });
        } catch (err) {
          logger.error('Error al registrar auditoría: ' + err);
        }
      }
    });

    next();
  };
};
