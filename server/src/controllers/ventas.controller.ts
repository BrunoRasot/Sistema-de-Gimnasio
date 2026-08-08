import { Request, Response } from 'express';
import { prisma } from '../database/prisma.js';

export const obtenerVentas = async (req: Request, res: Response): Promise<any> => {
  try {
    const ventas = await prisma.venta.findMany({
      include: {
        detalles: {
          include: { producto: true },
        },
      },
      orderBy: { createdAt: 'desc' },
    });
    return res.json(ventas);
  } catch (error: any) {
    return res.status(500).json({ message: 'Error interno al obtener el historial de ventas.' });
  }
};

export const crearVenta = async (req: Request, res: Response): Promise<any> => {
  const { cliente, metodoId, numeroOperacion, montoRecibido, vuelto, items } = req.body;

  if (!items || items.length === 0) {
    return res.status(400).json({ message: 'La venta debe contener al menos un producto' });
  }

  if (!metodoId) {
    return res.status(400).json({ message: 'Se debe especificar un método de pago válido' });
  }

  try {
    const nuevaVenta = await prisma.$transaction(async (tx) => {
      const ultimaVenta = await tx.venta.findFirst({ orderBy: { id: 'desc' } });
      const numero = ultimaVenta ? ultimaVenta.id + 1 : 1;
      const codigo = `VNT-${String(numero).padStart(4, '0')}`;

      let totalVenta = 0;
      const detallesData = [];

      for (const item of items) {
        const prod = await tx.producto.findUnique({ where: { id: Number(item.productoId) } });
        if (!prod) {
          throw new Error(`El producto ID: ${item.productoId} no existe en el sistema`);
        }
        if (prod.stock < Number(item.cantidad)) {
          throw new Error(`Stock insuficiente para el producto ID: ${item.productoId}`);
        }

        const precioReal = Number(prod.precioVenta);
        const cantidadNumerica = Number(item.cantidad);
        const subtotal = cantidadNumerica * precioReal;

        totalVenta += subtotal;

        detallesData.push({
          productoId: prod.id,
          cantidad: cantidadNumerica,
          precioUnit: precioReal,
          subtotal: subtotal,
        });

        await tx.producto.update({
          where: { id: prod.id },
          data: { stock: { decrement: cantidadNumerica } },
        });
      }

      const venta = await tx.venta.create({
        data: {
          codigo,
          cliente: cliente || 'Público General',
          total: totalVenta,
          metodoId: Number(metodoId),
          numeroOperacion: numeroOperacion || null,
          montoRecibido: montoRecibido ? Number(montoRecibido) : null,
          vuelto: vuelto !== undefined ? Number(vuelto) : null,
          detalles: {
            create: detallesData,
          },
        },
        include: { detalles: true },
      });

      return venta;
    });

    return res.status(201).json({ message: 'Venta registrada con éxito', venta: nuevaVenta });
  } catch (error: any) {
    const esErrorControlado =
      error instanceof Error &&
      (error.message.includes('producto') || error.message.includes('Stock'));
    const mensaje = esErrorControlado ? error.message : 'Error interno al procesar la venta.';
    return res.status(500).json({ message: mensaje });
  }
};

export const obtenerComprobantePorId = async (req: Request, res: Response): Promise<any> => {
  const { id } = req.params;
  try {
    const comprobante = await prisma.venta.findUnique({
      where: { id: Number(id) },
      include: {
        detalles: {
          include: { producto: true },
        },
      },
    });
    if (!comprobante) {
      return res.status(404).json({ message: 'Comprobante no encontrado' });
    }
    return res.json(comprobante);
  } catch (error: any) {
    return res.status(500).json({ message: 'Error interno al obtener el comprobante.' });
  }
};

export const obtenerDevoluciones = async (req: Request, res: Response): Promise<any> => {
  try {
    const devoluciones = await prisma.devolucion.findMany({
      include: {
        venta: {
          include: { detalles: { include: { producto: true } } },
        },
      },
      orderBy: { createdAt: 'desc' },
    });
    return res.json(devoluciones);
  } catch (error: any) {
    return res
      .status(500)
      .json({ message: 'Error interno al obtener el historial de devoluciones.' });
  }
};

export const registrarDevolucion = async (req: Request, res: Response): Promise<any> => {
  const { identificador, motivo } = req.body;
  const usuarioId = (req as any).usuario?.id;

  if (!usuarioId) {
    return res.status(401).json({ message: 'Usuario no autenticado para realizar esta acción.' });
  }

  try {
    const resultado = await prisma.$transaction(async (tx) => {
      const venta = await tx.venta.findFirst({
        where: {
          OR: [{ numeroOperacion: identificador }, { codigo: identificador }],
        },
        include: { detalles: true },
      });

      if (!venta) {
        throw new Error('No se encontró ninguna venta con ese número de operación o código.');
      }
      if (venta.estado === 'Anulado') {
        throw new Error('Esta venta ya fue anulada anteriormente.');
      }

      const devolucion = await tx.devolucion.create({
        data: {
          ventaId: venta.id,
          usuarioId: Number(usuarioId),
          monto: venta.total,
          motivo: motivo || 'Devolución de productos',
        },
      });

      for (const detalle of venta.detalles) {
        await tx.producto.update({
          where: { id: detalle.productoId },
          data: {
            stock: { increment: detalle.cantidad },
          },
        });
      }

      await tx.venta.update({
        where: { id: venta.id },
        data: { estado: 'Anulado' },
      });

      return devolucion;
    });

    return res.status(201).json({ message: 'Devolución procesada y stock restaurado', resultado });
  } catch (error: any) {
    const esErrorControlado = error instanceof Error && error.message.includes('venta');
    const mensaje = esErrorControlado ? error.message : 'Error interno al procesar la devolución.';
    return res.status(500).json({ message: mensaje });
  }
};
