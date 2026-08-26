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
    const page = Math.max(1, Number(req.query.page) || 1);
    const pageSize = Math.min(100, Math.max(1, Number(req.query.pageSize) || 20));
    const search = String(req.query.search || '').trim();
    const estado = req.query.estado ? String(req.query.estado) : undefined;
    const desde = req.query.desde ? new Date(String(req.query.desde)) : undefined;
    const hasta = req.query.hasta ? new Date(String(req.query.hasta)) : undefined;
    const where: any = {
      ...(estado ? { estado } : {}),
      ...(desde || hasta ? { createdAt: { ...(desde ? { gte: desde } : {}), ...(hasta ? { lte: hasta } : {}) } } : {}),
      ...(search ? { OR: [
        { codigo: { contains: search, mode: 'insensitive' } },
        { cliente: { contains: search, mode: 'insensitive' } },
        { numeroOperacion: { contains: search, mode: 'insensitive' } },
      ] } : {}),
    };
    const ventas = await prisma.venta.findMany({
      where,
      include: {
        metodoPago: true,
        pagos: { include: { metodo: true } },
        miembro: true,
        usuario: { select: { id: true, nombres: true, apellidos: true } },
        detalles: {
          include: { producto: true },
        },
      },
      orderBy: { createdAt: 'desc' },
      ...(req.query.page ? { skip: (page - 1) * pageSize, take: pageSize } : {}),
    });
    if (!req.query.page) return res.json(ventas);
    const total = await prisma.venta.count({ where });
    return res.json({ data: ventas, pagination: { page, pageSize, total, pageCount: Math.ceil(total / pageSize) } });
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

      const metodosIds = datos.pagos?.map((p) => p.metodoId) ?? [Number(datos.metodoId)];
      const metodos = await tx.metodoPago.findMany({ where: { id: { in: metodosIds }, activo: true } });
      if (metodos.length !== metodosIds.length) throw new Error('METODO_PAGO_INVALIDO');
      const metodo = metodos.find((m) => m.id === metodosIds[0])!;

      if (datos.miembroId) {
        const miembro = await tx.miembro.findFirst({ where: { id: datos.miembroId, estado: 'Activo' } });
        if (!miembro) throw new Error('MIEMBRO_INVALIDO');
      }

      const operaciones = (datos.pagos?.map((p) => p.numeroOperacion).filter(Boolean) ?? [datos.numeroOperacion].filter(Boolean)) as string[];
      if (operaciones.length) {
        const repetida = await tx.ventaPago.findFirst({ where: { numeroOperacion: { in: operaciones } } });
        if (repetida) throw new Error('OPERACION_DUPLICADA');
      }

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

      const descuento = Number(datos.descuento || 0);
      if (descuento > totalVenta) throw new Error('DESCUENTO_INVALIDO');
      const totalFinal = totalVenta - descuento;
      const pagosNormalizados = datos.pagos ?? [{ metodoId: metodo.id, monto: totalFinal, numeroOperacion: datos.numeroOperacion }];
      const totalPagado = pagosNormalizados.reduce((sum, pago) => sum + Number(pago.monto), 0);
      if (Math.abs(totalPagado - totalFinal) > 0.009) throw new Error('PAGOS_NO_COINCIDEN');
      for (const pago of pagosNormalizados) {
        const metodoPago = metodos.find((item) => item.id === pago.metodoId)!;
        if (/(yape|plin|tarjeta|transferencia)/i.test(metodoPago.nombre) && !pago.numeroOperacion) throw new Error('OPERACION_REQUERIDA');
      }
      const esEfectivo = metodo.nombre.toLowerCase().includes('efectivo');
      if (esEfectivo && datos.montoRecibido != null && Number(datos.montoRecibido) < totalFinal) throw new Error('MONTO_INSUFICIENTE');
      const vueltoCalculado = esEfectivo && datos.montoRecibido != null ? Number(datos.montoRecibido) - totalFinal : 0;

      return await tx.venta.create({
        data: {
          codigo: generarCodigoUnico('VNT'),
          usuarioId: usuarioId ? Number(usuarioId) : null,
          miembroId: datos.miembroId || null,
          cliente: datos.cliente || 'Público General',
          subtotal: totalVenta,
          descuento,
          total: totalFinal,
          metodoId: metodo.id,
          numeroOperacion: datos.numeroOperacion || null,
          montoRecibido: esEfectivo ? datos.montoRecibido : null,
          vuelto: vueltoCalculado,
          detalles: {
            create: detallesData,
          },
          pagos: {
            create: pagosNormalizados.map((pago) => ({ metodoId: pago.metodoId, monto: pago.monto, numeroOperacion: pago.numeroOperacion || null })),
          },
        },
        include: { detalles: true, pagos: { include: { metodo: true } } },
      });
    });

    return res.status(201).json({ mensaje: 'Venta registrada con éxito', venta: nuevaVenta });
  } catch (error: any) {
    logger.error(`Error al procesar la venta: ${error}`);
    if (error instanceof Error && error.message === 'METODO_PAGO_INVALIDO') {
      return res.status(400).json({ mensaje: 'El método de pago no existe o está inactivo.' });
    }
    if (error instanceof Error && error.message === 'MIEMBRO_INVALIDO') return res.status(400).json({ mensaje: 'El miembro no existe o está inactivo.' });
    if (error instanceof Error && error.message === 'OPERACION_DUPLICADA') return res.status(409).json({ mensaje: 'El número de operación ya fue registrado.' });
    if (error instanceof Error && error.message === 'OPERACION_REQUERIDA') return res.status(400).json({ mensaje: 'El número de operación es obligatorio para pagos no efectivos.' });
    if (error instanceof Error && error.message === 'MONTO_INSUFICIENTE') return res.status(400).json({ mensaje: 'El monto recibido es menor al total.' });
    if (error instanceof Error && error.message === 'DESCUENTO_INVALIDO') return res.status(400).json({ mensaje: 'El descuento no puede superar el subtotal.' });
    if (error instanceof Error && error.message === 'PAGOS_NO_COINCIDEN') return res.status(400).json({ mensaje: 'La suma de los pagos debe coincidir exactamente con el total de la venta.' });
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
        pagos: { include: { metodo: true } },
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
  const { identificador, motivo, items } = req.body;
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
        include: { detalles: true, devoluciones: { include: { detalles: true } } },
      });

      if (venta.estado === 'Anulado' || venta.estado === 'Devuelto') {
        throw new Error('Esta venta ya fue anulada anteriormente.');
      }

      const cantidadYaDevuelta = (productoId: number) => venta.devoluciones.flatMap((d) => d.detalles).filter((d) => d.productoId === productoId).reduce((sum, d) => sum + d.cantidad, 0);
      const solicitados = items?.length ? items : venta.detalles.map((d) => ({ productoId: d.productoId, cantidad: d.cantidad - cantidadYaDevuelta(d.productoId) })).filter((d) => d.cantidad > 0);
      const detallesDevueltos = solicitados.map((item: { productoId: number; cantidad: number }) => {
        const vendido = venta.detalles.find((d) => d.productoId === item.productoId);
        if (!vendido) throw new Error('PRODUCTO_NO_VENDIDO');
        const devuelto = cantidadYaDevuelta(item.productoId);
        if (item.cantidad > vendido.cantidad - devuelto) throw new Error('CANTIDAD_DEVOLUCION_INVALIDA');
        return { productoId: item.productoId, cantidad: item.cantidad, subtotal: Number(vendido.precioUnit) * item.cantidad };
      });
      const monto = detallesDevueltos.reduce((sum: number, item: { subtotal: number }) => sum + item.subtotal, 0);

      const devolucion = await tx.devolucion.create({
        data: {
          ventaId: venta.id,
          usuarioId: Number(usuarioId),
          monto,
          motivo: motivo || 'Devolución de productos',
          detalles: { create: detallesDevueltos },
        },
      });

      for (const detalle of detallesDevueltos) {
        await tx.producto.update({
          where: { id: detalle.productoId },
          data: {
            stock: { increment: detalle.cantidad },
          },
        });
      }

      const cantidadVendida = venta.detalles.reduce((sum, d) => sum + d.cantidad, 0);
      const cantidadPrevia = venta.devoluciones.flatMap((d) => d.detalles).reduce((sum, d) => sum + d.cantidad, 0);
      const cantidadActual = detallesDevueltos.reduce((sum: number, d: { cantidad: number }) => sum + d.cantidad, 0);
      await tx.venta.update({
        where: { id: venta.id },
        data: { estado: cantidadPrevia + cantidadActual >= cantidadVendida ? 'Devuelto' : 'ParcialmenteDevuelto' },
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
    if (error instanceof Error && ['PRODUCTO_NO_VENDIDO', 'CANTIDAD_DEVOLUCION_INVALIDA'].includes(error.message)) {
      return res.status(400).json({ mensaje: 'Los productos o cantidades de la devolución no son válidos.' });
    }
    return res.status(500).json({ mensaje: 'Error interno al procesar la devolución.' });
  }
};

