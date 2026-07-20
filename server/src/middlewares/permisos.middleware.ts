import { Request, Response, NextFunction } from 'express';
import { prisma } from '../database/prisma.js';

export const verificarPermiso = (modulo: string, accion: 'ver' | 'crear' | 'editar' | 'eliminar') => {
    return async (req: Request, res: Response, next: NextFunction) => {
        try {
            const usuarioId = (req as any).usuario?.id;
            if (!usuarioId) return res.status(401).json({ mensaje: 'No autenticado.' });

            const usuarioDB = await prisma.usuario.findUnique({
                where: { id: usuarioId },
                select: { rol: true, cargo: true }
            });

            if (!usuarioDB) return res.status(404).json({ mensaje: 'Usuario no encontrado.' });

            if (usuarioDB.rol === 'ADMIN') {
                return next();
            }

            if (!usuarioDB.cargo) {
                return res.status(403).json({ mensaje: 'Acceso denegado: No tienes un cargo asignado en el sistema.' });
            }

            const permiso = await prisma.permiso.findFirst({
                where: {
                    cargo: usuarioDB.cargo,
                    modulo: modulo
                }
            });

            if (!permiso) {
                return res.status(403).json({ mensaje: `Acceso denegado: Tu cargo (${usuarioDB.cargo}) no tiene configurado el acceso a ${modulo}.` });
            }

            const tieneAcceso = permiso[accion];

            if (!tieneAcceso) {
                return res.status(403).json({
                    mensaje: `Acceso denegado: No tienes permisos para ${accion.toUpperCase()} en el módulo de ${modulo}.`
                });
            }

            next();

        } catch (error) {
            console.error('Error en middleware de permisos:', error);
            res.status(500).json({ mensaje: 'Error interno al verificar permisos de seguridad.' });
        }
    };
};