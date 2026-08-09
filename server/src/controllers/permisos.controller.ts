import { Request, Response } from 'express';
import { prisma } from '../database/prisma.js';

export const obtenerPermisos = async (req: Request, res: Response): Promise<any> => {
  try {
    const permisos = await prisma.permiso.findMany();
    return res.json(permisos);
  } catch (error) {
    return res.status(500).json({ mensaje: 'Error al obtener permisos.' });
  }
};

export const guardarPermisos = async (req: Request, res: Response): Promise<any> => {
  try {
    const { cargo, permisos } = req.body;
    const operaciones = Object.entries(permisos).map(([modulo, acciones]: any) => {
      return prisma.permiso.upsert({
        where: { cargo_modulo: { cargo, modulo } },
        update: {
          ver: acciones.Ver,
          crear: acciones.Crear,
          editar: acciones.Editar,
          eliminar: acciones.Eliminar,
        },
        create: {
          cargo,
          modulo,
          ver: acciones.Ver,
          crear: acciones.Crear,
          editar: acciones.Editar,
          eliminar: acciones.Eliminar,
        },
      });
    });
    await prisma.$transaction(operaciones);
    return res.json({ mensaje: 'Permisos guardados correctamente.' });
  } catch (error) {
    return res.status(500).json({ mensaje: 'Error al guardar permisos.' });
  }
};
