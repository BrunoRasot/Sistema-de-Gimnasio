import { Response } from 'express';
import { prisma } from '../../database/prisma.js';
import { AuthRequest } from '../../middlewares/auth.middleware.js';

export const obtenerOrdenes = async (_req: AuthRequest, res: Response) => res.json(await prisma.ordenCompra.findMany({ include: { proveedor: true, detalles: { include: { producto: true } } }, orderBy: { createdAt: 'desc' } }));

export const crearOrden = async (req: AuthRequest, res: Response) => {
  const { proveedorId, fechaEsperada, observaciones, items } = req.body;
  const subtotal = items.reduce((sum: number, item: any) => sum + item.cantidad * item.costoUnitario, 0);
  const orden = await prisma.ordenCompra.create({ data: {
    codigo: `OC-${Date.now()}`, proveedorId, usuarioId: req.usuario?.id, subtotal, total: subtotal,
    fechaEsperada: fechaEsperada ? new Date(fechaEsperada) : null, observaciones,
    detalles: { create: items.map((item: any) => ({ ...item, subtotal: item.cantidad * item.costoUnitario })) },
  }, include: { detalles: true } });
  res.status(201).json(orden);
};

export const recibirOrden = async (req: AuthRequest, res: Response) => {
  const ordenId = Number(req.params.id);
  const resultado = await prisma.$transaction(async (tx) => {
    const orden = await tx.ordenCompra.findUnique({ where: { id: ordenId }, include: { detalles: true } });
    if (!orden || orden.estado === 'CANCELADA' || orden.estado === 'RECIBIDA') throw Object.assign(new Error('Orden no disponible'), { status: 409 });
    for (const recibido of req.body.items) {
      const detalle = orden.detalles.find((item) => item.id === recibido.detalleId);
      if (!detalle || detalle.cantidadRecibida + recibido.cantidad > detalle.cantidad) throw Object.assign(new Error('Cantidad de recepción inválida'), { status: 400 });
      const producto = await tx.producto.findUniqueOrThrow({ where: { id: detalle.productoId } });
      const nuevoStock = producto.stock + recibido.cantidad;
      const nuevoCosto = producto.stock + recibido.cantidad > 0 ? ((Number(producto.precioCompra) * producto.stock) + (Number(detalle.costoUnitario) * recibido.cantidad)) / (producto.stock + recibido.cantidad) : Number(detalle.costoUnitario);
      await tx.producto.update({ where: { id: producto.id }, data: { stock: nuevoStock, precioCompra: nuevoCosto } });
      await tx.detalleOrdenCompra.update({ where: { id: detalle.id }, data: { cantidadRecibida: { increment: recibido.cantidad } } });
      await tx.movimientoInventario.create({ data: { productoId: producto.id, usuarioId: req.usuario?.id, tipo: 'COMPRA', cantidad: recibido.cantidad, stockAnterior: producto.stock, stockPosterior: nuevoStock, costoUnitario: detalle.costoUnitario, referenciaTipo: 'ORDEN_COMPRA', referenciaId: ordenId } });
    }
    const detalles = await tx.detalleOrdenCompra.findMany({ where: { ordenId } });
    const completa = detalles.every((item) => item.cantidadRecibida >= item.cantidad);
    return tx.ordenCompra.update({ where: { id: ordenId }, data: { estado: completa ? 'RECIBIDA' : 'PARCIAL' }, include: { detalles: true } });
  });
  res.json(resultado);
};
