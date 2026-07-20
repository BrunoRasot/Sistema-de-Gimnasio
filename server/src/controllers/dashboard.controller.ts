import { Request, Response } from 'express';
import { prisma } from '../database/prisma.js';

export const getDashboardStats = async (req: Request, res: Response) => {
  try {
    const totalUsuarios = await prisma.usuario.count();
    res.json({ totalUsuarios });
  } catch (error) {
    res.status(500).json({ error: 'Error al obtener estadísticas' });
  }
};