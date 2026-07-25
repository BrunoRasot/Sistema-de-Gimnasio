import { Request, Response } from 'express';
import { prisma } from '../database/prisma.js';

export const obtenerProductos = async (req: Request, res: Response): Promise<any> => {
  try {
    const productos = await prisma.producto.findMany({
      include: {
        categoria: { select: { nombre: true } },
        proveedor: { select: { nombre: true } }
      },
      orderBy: { createdAt: 'desc' }
    });
    return res.json(productos);
  } catch (error) {
    return res.status(500).json({ mensaje: 'Error al obtener los productos.' });
  }
};

export const crearProducto = async (req: Request, res: Response): Promise<any> => {
  try {
    const { nombre, sku, descripcion, precioCompra, precioVenta, stock, stockMinimo, categoriaId, proveedorId, estado } = req.body;

    const existeSku = await prisma.producto.findUnique({ where: { sku } });
    if (existeSku) return res.status(400).json({ mensaje: 'El SKU ya está en uso.' });

    const nuevoProducto = await prisma.producto.create({
      data: {
        nombre,
        sku,
        descripcion,
        precioCompra: Number(precioCompra),
        precioVenta: Number(precioVenta),
        stock: Number(stock),
        stockMinimo: Number(stockMinimo),
        categoriaId: Number(categoriaId),
        proveedorId: proveedorId ? Number(proveedorId) : null,
        estado
      }
    });
    return res.status(201).json(nuevoProducto);
  } catch (error) {
    return res.status(500).json({ mensaje: 'Error al crear el producto.' });
  }
};

export const actualizarProducto = async (req: Request, res: Response): Promise<any> => {
  try {
    const { id } = req.params;
    const { nombre, sku, descripcion, precioCompra, precioVenta, stock, stockMinimo, categoriaId, proveedorId, estado } = req.body;

    const existeSku = await prisma.producto.findFirst({
      where: { sku, NOT: { id: Number(id) } }
    });
    if (existeSku) return res.status(400).json({ mensaje: 'El SKU ya está en uso por otro producto.' });

    const productoActualizado = await prisma.producto.update({
      where: { id: Number(id) },
      data: {
        nombre,
        sku,
        descripcion,
        precioCompra: Number(precioCompra),
        precioVenta: Number(precioVenta),
        stock: Number(stock),
        stockMinimo: Number(stockMinimo),
        categoriaId: Number(categoriaId),
        proveedorId: proveedorId ? Number(proveedorId) : null,
        estado
      }
    });
    return res.json(productoActualizado);
  } catch (error) {
    return res.status(500).json({ mensaje: 'Error al actualizar el producto.' });
  }
};

export const eliminarProducto = async (req: Request, res: Response): Promise<any> => {
  try {
    const { id } = req.params;
    await prisma.producto.delete({ where: { id: Number(id) } });
    return res.json({ mensaje: 'Producto eliminado correctamente.' });
  } catch (error) {
    return res.status(500).json({ mensaje: 'Error al eliminar el producto.' });
  }
};