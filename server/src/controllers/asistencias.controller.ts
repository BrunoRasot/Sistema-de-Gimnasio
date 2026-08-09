import { Request, Response } from 'express';
import { prisma } from '../database/prisma.js';
import { logger } from '../utils/logger.js';

export const registrarAsistencia = async (req: Request, res: Response): Promise<any> => {
  try {
    const { miembroId } = req.body;
    if (!miembroId) return res.status(400).json({ message: 'El ID del miembro es requerido' });
    const miembro = await prisma.miembro.findUnique({ where: { id: Number(miembroId) } });
    if (!miembro) return res.status(404).json({ message: 'Miembro no encontrado' });
    const nuevaAsistencia = await prisma.asistencia.create({
      data: { miembroId: Number(miembroId) },
      include: {
        miembro: { select: { nombres: true, apellidos: true, dni: true } },
      },
    });
    return res.status(201).json(nuevaAsistencia);
  } catch (error) {
    logger.error(`Error al registrar asistencia: ${error}`);
    return res.status(500).json({ message: 'Error interno del servidor' });
  }
};

export const buscarMiembroPorDni = async (req: Request, res: Response): Promise<any> => {
  try {
    const { dni } = req.params;
    const miembro = await prisma.miembro.findUnique({
      where: { dni: dni as string },
      include: {
        membresias: {
          where: { estado: 'Activa' },
          orderBy: { fechaFin: 'desc' },
          take: 1,
          include: { plan: true },
        },
      },
    });

    if (!miembro) return res.status(404).json({ message: 'Miembro no encontrado' });
    return res.status(200).json(miembro);
  } catch (error) {
    logger.error(`Error al buscar miembro por DNI: ${error}`);
    return res.status(500).json({ message: 'Error interno del servidor' });
  }
};

export const obtenerAsistenciasHoy = async (req: Request, res: Response): Promise<any> => {
  try {
    const inicioDia = new Date();
    inicioDia.setHours(0, 0, 0, 0);
    const finDia = new Date();
    finDia.setHours(23, 59, 59, 999);
    const asistencias = await prisma.asistencia.findMany({
      where: { fechaHora: { gte: inicioDia, lte: finDia } },
      include: {
        miembro: { select: { nombres: true, apellidos: true, dni: true } },
      },
      orderBy: { fechaHora: 'desc' },
    });
    return res.status(200).json(asistencias);
  } catch (error) {
    logger.error(`Error al obtener asistencias de hoy: ${error}`);
    return res.status(500).json({ message: 'Error interno del servidor' });
  }
};
