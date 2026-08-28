import { Request, Response } from 'express';
import { z } from 'zod';
import { prisma } from '../../database/prisma.js';
import { logger } from '../../utils/logger.js';
import { productoSchema } from '../../schemas/index.js';

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

    const usuarioId = Number((req as any).usuario?.id) || null;
    const nuevoProducto = await prisma.$transaction(async (tx) => {
      const producto = await tx.producto.create({ data: {
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
      }});
      if (datos.stock > 0) await tx.movimientoInventario.create({ data: { productoId: producto.id, usuarioId, tipo: 'STOCK_INICIAL', cantidad: datos.stock, stockAnterior: 0, stockPosterior: datos.stock, costoUnitario: datos.precioCompra, motivo: 'Alta de producto' } });
      return producto;
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

    const usuarioId = Number((req as any).usuario?.id) || null;
    const productoActualizado = await prisma.$transaction(async (tx) => {
      const anterior = await tx.producto.findUniqueOrThrow({ where: { id: Number(id) } });
      const producto = await tx.producto.update({ where: { id: Number(id) }, data: {
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
      }});
      const diferencia = datos.stock - anterior.stock;
      if (diferencia !== 0) await tx.movimientoInventario.create({ data: { productoId: producto.id, usuarioId, tipo: diferencia > 0 ? 'AJUSTE_ENTRADA' : 'AJUSTE_SALIDA', cantidad: diferencia, stockAnterior: anterior.stock, stockPosterior: datos.stock, costoUnitario: datos.precioCompra, motivo: 'Edición manual del producto' } });
      return producto;
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
    const tieneKardex = await prisma.movimientoInventario.count({ where: { productoId: Number(id) } });
    if (tieneKardex) {
      const archivado = await prisma.producto.update({ where: { id: Number(id) }, data: { estado: 'Inactivo' } });
      return res.json({ mensaje: 'Producto archivado para conservar su kardex.', producto: archivado });
    }
    await prisma.producto.delete({ where: { id: Number(id) } });
    return res.json({ mensaje: 'Producto eliminado correctamente.' });
  } catch (error) {
    logger.error(`Error al eliminar el producto: ${error}`);
    return res.status(500).json({ mensaje: 'Error al eliminar el producto.' });
  }
};

