import { Request, Response } from 'express';
import { z } from 'zod';
import { prisma } from '../../database/prisma.js';
import { proveedorSchema } from '../../schemas/index.js';

export const obtenerProveedores = async (req: Request, res: Response): Promise<any> => {
  try {
    const proveedores = await prisma.proveedor.findMany({
      include: { _count: { select: { productos: true } } },
      orderBy: { createdAt: 'desc' },
    });
    return res.json(proveedores);
  } catch (error) {
    return res.status(500).json({ mensaje: 'Error al obtener los proveedores.' });
  }
};

export const crearProveedor = async (req: Request, res: Response): Promise<any> => {
  try {
    const datos = req.body as z.infer<typeof proveedorSchema>;

    const nuevoProveedor = await prisma.proveedor.create({
      data: {
        nombre: datos.nombre,
        contacto: datos.contacto,
        telefono: datos.telefono,
        email: datos.email,
        direccion: datos.direccion,
        estado: datos.estado,
      },
    });
    return res.status(201).json(nuevoProveedor);
  } catch (error) {
    return res.status(500).json({ mensaje: 'Error al crear el proveedor.' });
  }
};

export const actualizarProveedor = async (req: Request, res: Response): Promise<any> => {
  try {
    const { id } = req.params;
    const datos = req.body as z.infer<typeof proveedorSchema>;

    const proveedorActualizado = await prisma.proveedor.update({
      where: { id: Number(id) },
      data: {
        nombre: datos.nombre,
        contacto: datos.contacto,
        telefono: datos.telefono,
        email: datos.email,
        direccion: datos.direccion,
        estado: datos.estado,
      },
    });
    return res.json(proveedorActualizado);
  } catch (error) {
    return res.status(500).json({ mensaje: 'Error al actualizar el proveedor.' });
  }
};

export const eliminarProveedor = async (req: Request, res: Response): Promise<any> => {
  try {
    const { id } = req.params;

    const proveedor = await prisma.proveedor.findUnique({
      where: { id: Number(id) },
      include: { _count: { select: { productos: true } } },
    });

    if (proveedor?._count.productos && proveedor._count.productos > 0) {
      return res
        .status(400)
        .json({
          mensaje:
            'No puedes eliminar este proveedor porque tiene productos asociados. Desactívalo en su lugar.',
        });
    }

    await prisma.proveedor.delete({ where: { id: Number(id) } });
    return res.json({ mensaje: 'Proveedor eliminado correctamente.' });
  } catch (error) {
    return res.status(500).json({ mensaje: 'Error al eliminar el proveedor.' });
  }
};

