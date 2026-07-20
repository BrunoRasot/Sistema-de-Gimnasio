import { Request, Response } from 'express';
import { prisma } from '../database/prisma.js';

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
    const { nombre, descripcion, precio, duracionDias, estado } = req.body;
    const nuevoPlan = await prisma.plan.create({
      data: { nombre, descripcion, precio: Number(precio), duracionDias: Number(duracionDias), estado }
    });
    return res.status(201).json(nuevoPlan);
  } catch (error) {
    return res.status(500).json({ mensaje: 'Error al crear el plan. Puede que el nombre ya exista.' });
  }
};

export const actualizarPlan = async (req: Request, res: Response): Promise<any> => {
  try {
    const { id } = req.params;
    const { nombre, descripcion, precio, duracionDias, estado } = req.body;
    const planActualizado = await prisma.plan.update({
      where: { id: Number(id) },
      data: { nombre, descripcion, precio: Number(precio), duracionDias: Number(duracionDias), estado }
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