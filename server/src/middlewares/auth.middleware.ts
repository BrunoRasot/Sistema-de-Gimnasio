import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { logger } from '../utils/logger.js';

const getJwtSecret = (): string => {
  const secret = process.env.JWT_SECRET;
  if (!secret) {
    logger.error('FATAL ERROR: La variable de entorno JWT_SECRET no está configurada en los middlewares.');
    throw new Error('FATAL ERROR: La variable de entorno JWT_SECRET no está definida en el servidor.');
  }
  return secret;
};

const JWT_SECRET = getJwtSecret();

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
    const payload = jwt.verify(token, JWT_SECRET) as any;
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