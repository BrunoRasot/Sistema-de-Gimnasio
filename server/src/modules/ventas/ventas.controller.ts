import { Request, Response } from 'express';
import { z } from 'zod';
import crypto from 'node:crypto';
import { prisma } from '../../database/prisma.js';
import { logger } from '../../utils/logger.js';
import { ventaSchema } from '../../schemas/index.js';

const generarCodigoUnico = (prefijo: string) => {
  const timestamp = Date.now().toString(36).toUpperCase();
  const random = crypto.randomBytes(2).toString('hex').toUpperCase();
  return `${prefijo}-${timestamp}${random}`;
};

export const obtenerVentas = async (req: Request, res: Response): Promise<any> => {
  try {
    const ventas = await prisma.venta.findMany({
      include: {
        metodoPago: true,
        detalles: {
          include: { producto: true },
        },
      },
      orderBy: { createdAt: 'desc' },
    });
    return res.json(ventas);
  } catch (error: any) {
    logger.error(`Error al obtener historial de ventas: ${error}`);
    return res.status(500).json({ mensaje: 'Error interno al obtener el historial de ventas.' });
  }
};

export const crearVenta = async (req: Request, res: Response): Promise<any> => {
  try {
    const datos = req.body as z.infer<typeof ventaSchema>;
    const usuarioId = (req as any).usuario?.id;
    const nuevaVenta = await prisma.$transaction(async (tx) => {
      let totalVenta = 0;
      const detallesData = [];

      const metodo = await tx.metodoPago.findFirst({
        where: { id: datos.metodoId, activo: true },
      });
      if (!metodo) throw new Error('METODO_PAGO_INVALIDO');

      for (const item of datos.items) {
        const prod = await tx.producto.findUnique({ where: { id: item.productoId } });
        if (!prod) {
          throw new Error(`El producto ID: ${item.productoId} no existe en el sistema`);
        }
        const precioReal = Number(prod.precioVenta);
        const subtotal = item.cantidad * precioReal;

        totalVenta += subtotal;

        detallesData.push({
          productoId: prod.id,
          cantidad: item.cantidad,
          precioUnit: precioReal,
          subtotal: subtotal,
        });

        const actualizado = await tx.producto.updateMany({
          where: { id: prod.id, estado: 'Activo', stock: { gte: item.cantidad } },
          data: { stock: { decrement: item.cantidad } },
        });
        if (actualizado.count !== 1) {
          throw new Error(`Stock insuficiente para el producto ID: ${item.productoId}`);
        }
      }

      return await tx.venta.create({
        data: {
          codigo: generarCodigoUnico('VNT'),
          usuarioId: usuarioId ? Number(usuarioId) : null,
          cliente: datos.cliente || 'Público General',
          total: totalVenta,
          metodoId: datos.metodoId,
          numeroOperacion: datos.numeroOperacion || null,
          montoRecibido: datos.montoRecibido ? datos.montoRecibido : null,
          vuelto: datos.vuelto !== undefined ? datos.vuelto : null,
          detalles: {
            create: detallesData,
          },
        },
        include: { detalles: true },
      });
    });

    return res.status(201).json({ mensaje: 'Venta registrada con éxito', venta: nuevaVenta });
  } catch (error: any) {
    logger.error(`Error al procesar la venta: ${error}`);
    if (error instanceof Error && error.message === 'METODO_PAGO_INVALIDO') {
      return res.status(400).json({ mensaje: 'El método de pago no existe o está inactivo.' });
    }
    if (error instanceof Error && error.message.includes('no existe')) {
      return res.status(404).json({ mensaje: error.message });
    }
    if (error instanceof Error && error.message.includes('Stock')) {
      return res.status(409).json({ mensaje: error.message });
    }
    return res.status(500).json({ mensaje: 'Error interno al procesar la venta.' });
  }
};

export const obtenerComprobantePorId = async (req: Request, res: Response): Promise<any> => {
  const { id } = req.params;
  try {
    const comprobante = await prisma.venta.findUnique({
      where: { id: Number(id) },
      include: {
        metodoPago: true,
        detalles: {
          include: { producto: true },
        },
      },
    });

    if (!comprobante) {
      return res.status(404).json({ mensaje: 'Comprobante no encontrado' });
    }

    return res.json(comprobante);
  } catch (error: any) {
    logger.error(`Error al obtener comprobante: ${error}`);
    return res.status(500).json({ mensaje: 'Error interno al obtener el comprobante.' });
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
    logger.error(`Error al obtener devoluciones: ${error}`);
    return res
      .status(500)
      .json({ mensaje: 'Error interno al obtener el historial de devoluciones.' });
  }
};

export const registrarDevolucion = async (req: Request, res: Response): Promise<any> => {
  const { identificador, motivo } = req.body;
  const usuarioId = (req as any).usuario?.id;

  if (!usuarioId) {
    return res.status(401).json({ mensaje: 'Usuario no autenticado para realizar esta acción.' });
  }

  try {
    const resultado = await prisma.$transaction(async (tx) => {
      const ventaEncontrada = await tx.venta.findFirst({
        where: {
          OR: [{ numeroOperacion: identificador }, { codigo: identificador }],
        },
        include: { detalles: true },
      });

      if (!ventaEncontrada) {
        throw new Error('No se encontró ninguna venta con ese número de operación o código.');
      }

      await tx.$executeRaw`SELECT pg_advisory_xact_lock(${ventaEncontrada.id})`;
      const venta = await tx.venta.findUniqueOrThrow({
        where: { id: ventaEncontrada.id },
        include: { detalles: true },
      });

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

    return res.status(201).json({ mensaje: 'Devolución procesada y stock restaurado', resultado });
  } catch (error: any) {
    logger.error(`Error al procesar devolución: ${error}`);
    if (error instanceof Error && error.message.includes('No se encontró')) {
      return res.status(404).json({ mensaje: error.message });
    }
    if (error instanceof Error && error.message.includes('ya fue anulada')) {
      return res.status(409).json({ mensaje: error.message });
    }
    return res.status(500).json({ mensaje: 'Error interno al procesar la devolución.' });
  }
};

