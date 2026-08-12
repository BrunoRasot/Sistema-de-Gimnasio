import { Request, Response } from 'express';
import { z } from 'zod';
import { prisma } from '../database/prisma.js';
import { categoriaSchema } from '../schemas/index.js';

export const obtenerCategorias = async (req: Request, res: Response): Promise<any> => {
  try {
    const categorias = await prisma.categoria.findMany({
      include: { _count: { select: { productos: true } } },
      orderBy: { createdAt: 'desc' },
    });
    return res.json(categorias);
  } catch (error) {
    return res.status(500).json({ mensaje: 'Error al obtener las categorías.' });
  }
};

export const crearCategoria = async (req: Request, res: Response): Promise<any> => {
  try {
    const datos = req.body as z.infer<typeof categoriaSchema>;

    const existe = await prisma.categoria.findUnique({ where: { nombre: datos.nombre } });
    if (existe)
      return res.status(400).json({ mensaje: 'Ya existe una categoría con este nombre.' });

    const nuevaCategoria = await prisma.categoria.create({
      data: { nombre: datos.nombre, descripcion: datos.descripcion, estado: datos.estado },
    });
    return res.status(201).json(nuevaCategoria);
  } catch (error) {
    return res.status(500).json({ mensaje: 'Error al crear la categoría.' });
  }
};

export const actualizarCategoria = async (req: Request, res: Response): Promise<any> => {
  try {
    const { id } = req.params;
    const datos = req.body as z.infer<typeof categoriaSchema>;

    const categoriaActualizada = await prisma.categoria.update({
      where: { id: Number(id) },
      data: { nombre: datos.nombre, descripcion: datos.descripcion, estado: datos.estado },
    });
    return res.json(categoriaActualizada);
  } catch (error) {
    return res.status(500).json({ mensaje: 'Error al actualizar la categoría.' });
  }
};

export const eliminarCategoria = async (req: Request, res: Response): Promise<any> => {
  try {
    const { id } = req.params;

    const categoria = await prisma.categoria.findUnique({
      where: { id: Number(id) },
      include: { _count: { select: { productos: true } } },
    });

    if (categoria?._count.productos && categoria._count.productos > 0) {
      return res
        .status(400)
        .json({
          mensaje:
            'No puedes eliminar esta categoría porque tiene productos asociados. Desactívala en su lugar.',
        });
    }

    await prisma.categoria.delete({ where: { id: Number(id) } });
    return res.json({ mensaje: 'Categoría eliminada correctamente.' });
  } catch (error) {
    return res.status(500).json({ mensaje: 'Error al eliminar la categoría.' });
  }
};
