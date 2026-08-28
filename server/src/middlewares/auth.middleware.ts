import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { logger } from '../utils/logger.js';
import { env } from '../config/env.js';
import { prisma } from '../database/prisma.js';

export interface AuthRequest extends Request {
  usuario?: { id: number; rol: string; nombreUsuario: string };
}

export const verificarToken = async (req: AuthRequest, res: Response, next: NextFunction): Promise<any> => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ mensaje: 'Acceso denegado. Token no proporcionado.' });
  }

  const token = authHeader.split(' ')[1];
  try {
    const payload = jwt.verify(token, env.JWT_ACCESS_SECRET, { algorithms: ['HS256'] }) as any;
    if (payload.type !== 'access') {
      return res
        .status(401)
        .json({ mensaje: 'Tipo de token inválido. Se requiere un access token.' });
    }

    const usuarioId = Number(payload.sub);
    if (!Number.isInteger(usuarioId) || usuarioId <= 0) return res.status(401).json({ mensaje: 'Token inválido.' });
    const usuario = await prisma.usuario.findUnique({ where: { id: usuarioId }, select: { id: true, rol: true, nombreUsuario: true, activo: true, estadoCuenta: true, estadoLaboral: true } });
    if (!usuario || !usuario.activo || usuario.estadoCuenta !== 'Activa' || usuario.estadoLaboral !== 'Activo') {
      return res.status(401).json({ mensaje: 'La sesión ya no pertenece a una cuenta activa.' });
    }
    req.usuario = { id: usuario.id, rol: usuario.rol, nombreUsuario: usuario.nombreUsuario };
    next();
  } catch (error) {
    return res.status(401).json({ mensaje: 'Token inválido o expirado.' });
  }
};

export const verificarAdmin = (req: AuthRequest, res: Response, next: NextFunction): any => {
  if (req.usuario?.rol !== 'ADMIN') {
    return res.status(403).json({ mensaje: 'Acceso denegado. Se requiere rol de Administrador.' });
  }
  next();
};
