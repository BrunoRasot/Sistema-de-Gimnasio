import { Request, Response } from 'express';
import { prisma } from '../../database/prisma.js';

export const obtenerPermisos = async (req: Request, res: Response): Promise<any> => {
  try {
    const permisos = await prisma.permiso.findMany();
    return res.json(permisos);
  } catch (error) {
    return res.status(500).json({ mensaje: 'Error al obtener permisos.' });
  }
};

export const obtenerMisPermisos = async (req: Request, res: Response): Promise<any> => {
  const usuarioId = Number((req as any).usuario?.id);
  const usuario = await prisma.usuario.findUnique({ where: { id: usuarioId }, select: { rol: true, cargo: true } });
  if (!usuario) return res.status(404).json({ mensaje: 'Usuario no encontrado.' });
  if (usuario.rol === 'ADMIN') return res.json({ rol: usuario.rol, cargo: usuario.cargo, permisos: {} });
  const filas = await prisma.permiso.findMany({ where: { cargo: usuario.cargo } });
  const permisos = Object.fromEntries(filas.map((p) => [p.modulo, { ver: p.ver, crear: p.crear, editar: p.editar, eliminar: p.eliminar }]));
  return res.json({ rol: usuario.rol, cargo: usuario.cargo, permisos });
};

export const obtenerCargos = async (_req: Request, res: Response): Promise<any> => {
  const [usuarios, permisos] = await Promise.all([
    prisma.usuario.findMany({ distinct: ['cargo'], select: { cargo: true }, orderBy: { cargo: 'asc' } }),
    prisma.permiso.findMany({ distinct: ['cargo'], select: { cargo: true }, orderBy: { cargo: 'asc' } }),
  ]);
  return res.json([...new Set(['Administrador', ...usuarios.map((u) => u.cargo), ...permisos.map((p) => p.cargo)])]);
};

export const guardarPermisos = async (req: Request, res: Response): Promise<any> => {
  try {
    const { cargo, permisos } = req.body;
    if (cargo === 'Administrador') return res.status(400).json({ mensaje: 'Los permisos del administrador no pueden modificarse.' });
    permisos.dashboard = { Ver: true, Crear: false, Editar: false, Eliminar: false };
    Object.values(permisos).forEach((acciones: any) => {
      if (acciones.Crear || acciones.Editar || acciones.Eliminar) acciones.Ver = true;
      if (!acciones.Ver) Object.assign(acciones, { Crear: false, Editar: false, Eliminar: false });
    });
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

