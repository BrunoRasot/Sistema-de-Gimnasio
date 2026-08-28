import { Request, Response } from 'express';
import { prisma } from '../../database/prisma.js';

export const listarPendientesFiscales = async (req: Request, res: Response): Promise<any> => {
  const search = String(req.query.search || '').trim();
  const ventas = await prisma.venta.findMany({
    where: search ? { OR: [{ codigo: { contains: search, mode: 'insensitive' } }, { cliente: { contains: search, mode: 'insensitive' } }] } : undefined,
    include: { comprobanteFiscal: true, miembro: true, metodoPago: true }, orderBy: { createdAt: 'desc' }, take: 250,
  });
  return res.json(ventas);
};

export const actualizarComprobanteFiscal = async (req: Request, res: Response): Promise<any> => {
  const ventaId = Number(req.params.ventaId);
  const venta = await prisma.venta.findUnique({ where: { id: ventaId } });
  if (!venta) return res.status(404).json({ mensaje: 'Venta no encontrada.' });
  const data = { ...req.body, fechaEmision: req.body.fechaEmision ? new Date(req.body.fechaEmision) : null };
  try {
    const comprobante = await prisma.comprobanteFiscal.upsert({ where: { ventaId }, create: { ventaId, ...data }, update: data });
    return res.json(comprobante);
  } catch (error: any) {
    if (error?.code === 'P2002') return res.status(409).json({ mensaje: 'La serie y correlativo ya están registrados.' });
    return res.status(500).json({ mensaje: 'No se pudo actualizar el control fiscal.' });
  }
};
