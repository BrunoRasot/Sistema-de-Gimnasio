import { Request, Response } from 'express';
import { z } from 'zod';
import crypto from 'node:crypto';
import { prisma } from '../database/prisma.js';
import { pagoSchema } from '../schemas/index.js';

const generarCodigoUnico = (prefijo: string) => {
  const timestamp = Date.now().toString(36).toUpperCase();
  const random = crypto.randomBytes(2).toString('hex').toUpperCase();
  return `${prefijo}-${timestamp}${random}`;
};

export const obtenerMetodos = async (req: Request, res: Response): Promise<any> => {
  try {
    const metodos = await prisma.metodoPago.findMany({ orderBy: { createdAt: 'desc' } });
    return res.json(metodos);
  } catch (error) {
    return res.status(500).json({ mensaje: 'Error al obtener métodos de pago.' });
  }
};

export const crearMetodo = async (req: Request, res: Response): Promise<any> => {
  try {
    const { nombre, descripcion, activo } = req.body;
    const existe = await prisma.metodoPago.findUnique({ where: { nombre } });
    if (existe) return res.status(400).json({ mensaje: 'El método de pago ya existe.' });

    const nuevoMetodo = await prisma.metodoPago.create({
      data: { nombre, descripcion, activo },
    });
    return res.status(201).json(nuevoMetodo);
  } catch (error) {
    return res.status(500).json({ mensaje: 'Error al crear el método de pago.' });
  }
};

export const actualizarMetodo = async (req: Request, res: Response): Promise<any> => {
  try {
    const { id } = req.params;
    const { nombre, descripcion, activo } = req.body;

    const actualizado = await prisma.metodoPago.update({
      where: { id: Number(id) },
      data: { nombre, descripcion, activo },
    });
    return res.json(actualizado);
  } catch (error) {
    return res.status(500).json({ mensaje: 'Error al actualizar el método de pago.' });
  }
};

export const obtenerPagos = async (req: Request, res: Response): Promise<any> => {
  try {
    const pagos = await prisma.pago.findMany({
      include: { metodo: true },
      orderBy: { fecha: 'desc' },
    });
    return res.json(pagos);
  } catch (error) {
    return res.status(500).json({ mensaje: 'Error al obtener el registro de pagos.' });
  }
};

export const registrarPago = async (req: Request, res: Response): Promise<any> => {
  try {
    const datos = req.body as z.infer<typeof pagoSchema>;
    const usuarioId = (req as any).usuario?.id;
    const pagoFinal = await prisma.pago.create({
      data: {
        codigo: generarCodigoUnico('PAG'),
        usuarioId: usuarioId ? Number(usuarioId) : null,
        cliente: datos.cliente || 'Público General',
        concepto: datos.concepto,
        monto: datos.monto,
        metodoId: datos.metodoId,
      },
      include: { metodo: true },
    });

    return res.status(201).json(pagoFinal);
  } catch (error) {
    return res.status(500).json({ mensaje: 'Error al registrar el pago.' });
  }
};

export const anularPago = async (req: Request, res: Response): Promise<any> => {
  try {
    const { id } = req.params;
    const pago = await prisma.pago.update({
      where: { id: Number(id) },
      data: { estado: 'Anulado' },
    });
    return res.json({ mensaje: 'Pago anulado correctamente.', pago });
  } catch (error) {
    return res.status(500).json({ mensaje: 'Error al anular el pago.' });
  }
};
