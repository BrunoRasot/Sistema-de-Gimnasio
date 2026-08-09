import { Request, Response, NextFunction } from 'express';
import { prisma } from '../database/prisma.js';
import { logger } from '../utils/logger.js';

export const verificarPermiso = (
  modulo: string,
  accion: 'ver' | 'crear' | 'editar' | 'eliminar',
) => {
  return async (req: Request, res: Response, next: NextFunction): Promise<any> => {
    try {
      const usuarioId = (req as any).usuario?.id;
      if (!usuarioId) return res.status(401).json({ mensaje: 'No autenticado.' });

      const usuarioDB = await prisma.usuario.findUnique({
        where: { id: usuarioId },
        select: { rol: true, cargo: true },
      });

      if (!usuarioDB) return res.status(404).json({ mensaje: 'Usuario no encontrado.' });
      if (usuarioDB.rol === 'ADMIN') {
        return next();
      }

      const permiso = await prisma.permiso.findFirst({
        where: {
          cargo: usuarioDB.cargo,
          modulo: modulo,
        },
      });

      if (!permiso) {
        return res.status(403).json({
          mensaje: `Acceso denegado: Tu cargo (${usuarioDB.cargo}) no tiene configurado el acceso a ${modulo}.`,
        });
      }

      const tieneAcceso = permiso[accion];
      if (!tieneAcceso) {
        return res.status(403).json({
          mensaje: `Acceso denegado: No tienes permisos para ${accion.toUpperCase()} en el módulo de ${modulo}.`,
        });
      }

      next();
    } catch (error) {
      logger.error('Error en middleware de permisos: ' + error);
      return res.status(500).json({ mensaje: 'Error interno al verificar permisos' });
    }
  };
};
