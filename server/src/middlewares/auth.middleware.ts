import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { logger } from '../utils/logger.js';
import { env } from '../config/env.js';

export interface AuthRequest extends Request {
  usuario?: { id: number; rol: string; nombreUsuario: string };
}

export const verificarToken = (req: AuthRequest, res: Response, next: NextFunction): any => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ mensaje: 'Acceso denegado. Token no proporcionado.' });
  }

  const token = authHeader.split(' ')[1];
  try {
    const payload = jwt.verify(token, env.JWT_ACCESS_SECRET) as any;
    if (payload.type !== 'access') {
      return res
        .status(401)
        .json({ mensaje: 'Tipo de token inválido. Se requiere un access token.' });
    }

    req.usuario = { id: payload.sub, rol: payload.rol, nombreUsuario: payload.nombreUsuario };
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
