import { Request, Response } from 'express';
import { z } from 'zod';
import { prisma } from '../../database/prisma.js';
import { planSchema } from '../../schemas/index.js';

export const obtenerPlanes = async (req: Request, res: Response): Promise<any> => {
  try {
    const planes = await prisma.plan.findMany({ orderBy: { precio: 'asc' } });
    return res.json(planes);
  } catch (error) {
    return res.status(500).json({ mensaje: 'Error al obtener los planes.' });
  }
};

export const crearPlan = async (req: Request, res: Response): Promise<any> => {
  try {
    const datos = req.body as z.infer<typeof planSchema>;

    const nuevoPlan = await prisma.plan.create({
      data: {
        nombre: datos.nombre,
        descripcion: datos.descripcion,
        precio: datos.precio, // Ya es numérico gracias a Zod
        duracionDias: datos.duracionDias, // Ya es numérico gracias a Zod
        estado: datos.estado as any,
      },
    });
    return res.status(201).json(nuevoPlan);
  } catch (error) {
    return res
      .status(500)
      .json({ mensaje: 'Error al crear el plan. Puede que el nombre ya exista.' });
  }
};

export const actualizarPlan = async (req: Request, res: Response): Promise<any> => {
  try {
    const { id } = req.params;
    const datos = req.body as z.infer<typeof planSchema>;

    const planActualizado = await prisma.plan.update({
      where: { id: Number(id) },
      data: {
        nombre: datos.nombre,
        descripcion: datos.descripcion,
        precio: datos.precio,
        duracionDias: datos.duracionDias,
        estado: datos.estado as any,
      },
    });
    return res.json(planActualizado);
  } catch (error) {
    return res.status(500).json({ mensaje: 'Error al actualizar el plan.' });
  }
};

export const eliminarPlan = async (req: Request, res: Response): Promise<any> => {
  try {
    const { id } = req.params;
    await prisma.plan.delete({ where: { id: Number(id) } });
    return res.json({ mensaje: 'Plan eliminado.' });
  } catch (error) {
    return res.status(500).json({ mensaje: 'Error al eliminar el plan.' });
  }
};

