import { Request, Response } from 'express';
import { z } from 'zod';
import { prisma } from '../database/prisma.js';
import { logger } from '../utils/logger.js';
import { productoSchema } from '../schemas/index.js';

export const obtenerProductos = async (req: Request, res: Response): Promise<any> => {
  try {
    const productos = await prisma.producto.findMany({
      include: {
        categoria: { select: { nombre: true } },
        proveedor: { select: { nombre: true } },
      },
      orderBy: { createdAt: 'desc' },
    });
    return res.json(productos);
  } catch (error) {
    logger.error(`Error al obtener los productos: ${error}`);
    return res.status(500).json({ mensaje: 'Error al obtener los productos.' });
  }
};

export const crearProducto = async (req: Request, res: Response): Promise<any> => {
  try {
    const datos = req.body as z.infer<typeof productoSchema>;

    const existeSku = await prisma.producto.findUnique({ where: { sku: datos.sku } });
    if (existeSku) return res.status(400).json({ mensaje: 'El SKU ya está en uso.' });

    const nuevoProducto = await prisma.producto.create({
      data: {
        nombre: datos.nombre,
        sku: datos.sku,
        descripcion: datos.descripcion,
        precioCompra: datos.precioCompra,
        precioVenta: datos.precioVenta,
        stock: datos.stock,
        stockMinimo: datos.stockMinimo,
        categoriaId: datos.categoriaId,
        proveedorId: datos.proveedorId ? datos.proveedorId : null,
        estado: datos.estado as any,
      },
    });
    return res.status(201).json(nuevoProducto);
  } catch (error) {
    logger.error(`Error al crear el producto: ${error}`);
    return res.status(500).json({ mensaje: 'Error al crear el producto.' });
  }
};

export const actualizarProducto = async (req: Request, res: Response): Promise<any> => {
  try {
    const { id } = req.params;
    const datos = req.body as z.infer<typeof productoSchema>;

    const existeSku = await prisma.producto.findFirst({
      where: { sku: datos.sku, NOT: { id: Number(id) } },
    });
    if (existeSku)
      return res.status(400).json({ mensaje: 'El SKU ya está en uso por otro producto.' });

    const productoActualizado = await prisma.producto.update({
      where: { id: Number(id) },
      data: {
        nombre: datos.nombre,
        sku: datos.sku,
        descripcion: datos.descripcion,
        precioCompra: datos.precioCompra,
        precioVenta: datos.precioVenta,
        stock: datos.stock,
        stockMinimo: datos.stockMinimo,
        categoriaId: datos.categoriaId,
        proveedorId: datos.proveedorId ? datos.proveedorId : null,
        estado: datos.estado as any,
      },
    });
    return res.json(productoActualizado);
  } catch (error) {
    logger.error(`Error al actualizar el producto: ${error}`);
    return res.status(500).json({ mensaje: 'Error al actualizar el producto.' });
  }
};

export const eliminarProducto = async (req: Request, res: Response): Promise<any> => {
  try {
    const { id } = req.params;
    const producto = await prisma.producto.findUnique({
      where: { id: Number(id) },
      include: { _count: { select: { detalles: true } } },
    });
    if (producto?._count.detalles && producto._count.detalles > 0) {
      return res.status(400).json({
        mensaje:
          'No se puede eliminar este producto porque tiene ventas asociadas. Desactívalo en su lugar.',
      });
    }
    await prisma.producto.delete({ where: { id: Number(id) } });
    return res.json({ mensaje: 'Producto eliminado correctamente.' });
  } catch (error) {
    logger.error(`Error al eliminar el producto: ${error}`);
    return res.status(500).json({ mensaje: 'Error al eliminar el producto.' });
  }
};
