import { Request, Response, NextFunction } from 'express';
import { prisma } from '../database/prisma.js';

export const auditar = (modulo: string) => {
    return async (req: Request, res: Response, next: NextFunction) => {
        const originalSend = res.send;
        
        res.send = function (cuerpoRespuesta) {
            if (res.statusCode >= 200 && res.statusCode < 300 && ['POST', 'PUT', 'DELETE'].includes(req.method)) {
                
                const mapaAcciones: Record<string, string> = {
                    POST: 'CREAR',
                    PUT: 'EDITAR',
                    DELETE: 'ELIMINAR'
                };
                
                const accion = mapaAcciones[req.method] || req.method;
                const usuarioId = (req as any).usuario?.id || null;
                
                const detalles = JSON.stringify({
                    body: req.body,
                    params: req.params
                });
                
                const ip = req.ip || req.headers['x-forwarded-for']?.toString() || 'Desconocida';
                
                prisma.auditoria.create({
                    data: {
                        usuarioId,
                        accion,
                        modulo,
                        detalles,
                        ip
                    }
                }).catch(err => console.error('Error al registrar auditoría:', err));
            }
            return originalSend.call(this, cuerpoRespuesta);
        };
        next();
    };
};