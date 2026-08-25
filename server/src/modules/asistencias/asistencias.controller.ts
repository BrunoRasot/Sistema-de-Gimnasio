import { Request, Response } from 'express';
import { prisma } from '../../database/prisma.js';
import { logger } from '../../utils/logger.js';

export const registrarAsistencia = async (req: Request, res: Response): Promise<any> => {
  try {
    const { miembroId } = req.body;
    if (!miembroId) return res.status(400).json({ mensaje: 'El ID del miembro es requerido' });

    const ahora = new Date();
    const miembro = await prisma.miembro.findFirst({
      where: {
        id: Number(miembroId),
        estado: 'Activo',
        membresias: {
          some: { estado: 'Activa', fechaInicio: { lte: ahora }, fechaFin: { gte: ahora } },
        },
      },
    });
    if (!miembro) return res.status(404).json({ mensaje: 'Miembro no encontrado' });

    const inicioDia = new Date(ahora);
    inicioDia.setHours(0, 0, 0, 0);
    const nuevaAsistencia = await prisma.$transaction(async (tx) => {
      await tx.$executeRaw`SELECT pg_advisory_xact_lock(${miembro.id})`;
      const asistenciaExistente = await tx.asistencia.findFirst({
        where: { miembroId: miembro.id, fechaHora: { gte: inicioDia } },
      });
      if (asistenciaExistente) throw new Error('ASISTENCIA_DUPLICADA');

      return tx.asistencia.create({
        data: { miembroId: miembro.id },
        include: {
          miembro: { select: { nombres: true, apellidos: true, dni: true } },
        },
      });
    });

    return res.status(201).json(nuevaAsistencia);
  } catch (error) {
    if (error instanceof Error && error.message === 'ASISTENCIA_DUPLICADA') {
      return res.status(409).json({ mensaje: 'El miembro ya registró asistencia hoy.' });
    }
    logger.error(`Error al registrar asistencia: ${error}`);
    return res.status(500).json({ mensaje: 'Error interno del servidor' });
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

    if (!miembro) return res.status(404).json({ mensaje: 'Miembro no encontrado' });
    return res.status(200).json(miembro);
  } catch (error) {
    logger.error(`Error al buscar miembro por DNI: ${error}`);
    return res.status(500).json({ mensaje: 'Error interno del servidor' });
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
    return res.status(500).json({ mensaje: 'Error interno del servidor' });
  }
};

