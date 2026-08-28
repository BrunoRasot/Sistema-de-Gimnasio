import { Response } from 'express';
import { prisma } from '../../database/prisma.js';
import { AuthRequest } from '../../middlewares/auth.middleware.js';

export const obtenerKardex = async (req: AuthRequest, res: Response) => {
  const productoId = Number(req.query.productoId || 0);
  const movimientos = await prisma.movimientoInventario.findMany({
    where: productoId ? { productoId } : undefined,
    include: { producto: { select: { nombre: true, sku: true } }, usuario: { select: { nombreUsuario: true } } },
    orderBy: { createdAt: 'desc' }, take: 500,
  });
  res.json(movimientos);
};

export const ajustarStock = async (req: AuthRequest, res: Response) => {
  const { productoId, cantidad, motivo } = req.body;
  const resultado = await prisma.$transaction(async (tx) => {
    const producto = await tx.producto.findUnique({ where: { id: productoId } });
    if (!producto) throw Object.assign(new Error('Producto no encontrado'), { status: 404 });
    const posterior = producto.stock + cantidad;
    if (posterior < 0) throw Object.assign(new Error('El ajuste dejaría stock negativo'), { status: 409 });
    await tx.producto.update({ where: { id: productoId }, data: { stock: posterior } });
    return tx.movimientoInventario.create({ data: {
      productoId, usuarioId: req.usuario?.id, cantidad, stockAnterior: producto.stock,
      stockPosterior: posterior, tipo: cantidad > 0 ? 'AJUSTE_ENTRADA' : 'AJUSTE_SALIDA', motivo,
    }});
  });
  res.status(201).json(resultado);
};
