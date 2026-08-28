import crypto from 'node:crypto';
import { Request, Response } from 'express';
import { prisma } from '../../database/prisma.js';

const codigo = () => `CXC-${Date.now().toString(36).toUpperCase()}${crypto.randomBytes(2).toString('hex').toUpperCase()}`;

export const listarCartera = async (req: Request, res: Response): Promise<any> => {
  const estado = req.query.estado ? String(req.query.estado) : undefined;
  const hoy = new Date();
  await prisma.cuentaCobrar.updateMany({ where: { saldo: { gt: 0 }, fechaVencimiento: { lt: hoy }, estado: { in: ['PENDIENTE', 'PARCIAL'] } }, data: { estado: 'VENCIDA' } });
  const cuentas = await prisma.cuentaCobrar.findMany({
    where: estado ? { estado: estado as any } : undefined,
    include: { miembro: true, membresia: { include: { plan: true } }, abonos: { include: { metodo: true, usuario: { select: { nombres: true, apellidos: true } } }, orderBy: { createdAt: 'desc' } } },
    orderBy: [{ estado: 'asc' }, { fechaVencimiento: 'asc' }],
  });
  const resumen = cuentas.filter((c) => c.estado !== 'ANULADA').reduce((a, c) => ({ total: a.total + Number(c.montoTotal), saldo: a.saldo + Number(c.saldo), vencido: a.vencido + (c.estado === 'VENCIDA' ? Number(c.saldo) : 0) }), { total: 0, saldo: 0, vencido: 0 });
  return res.json({ cuentas, resumen });
};

export const crearCuenta = async (req: Request, res: Response): Promise<any> => {
  const data = req.body;
  const miembro = await prisma.miembro.findFirst({ where: { id: data.miembroId, estado: 'Activo' } });
  if (!miembro) return res.status(404).json({ mensaje: 'El socio no existe o está inactivo.' });
  const saldo = data.saldoInicial ?? data.montoTotal;
  const cuenta = await prisma.cuentaCobrar.create({ data: { codigo: codigo(), miembroId: data.miembroId, membresiaId: data.membresiaId || null, concepto: data.concepto, montoTotal: data.montoTotal, saldo, fechaVencimiento: new Date(data.fechaVencimiento), observaciones: data.observaciones, estado: saldo === 0 ? 'PAGADA' : new Date(data.fechaVencimiento) < new Date() ? 'VENCIDA' : saldo < data.montoTotal ? 'PARCIAL' : 'PENDIENTE' }, include: { miembro: true } });
  return res.status(201).json(cuenta);
};

export const registrarAbono = async (req: Request, res: Response): Promise<any> => {
  const cuentaId = Number(req.params.id);
  const usuarioId = Number((req as any).usuario?.id) || null;
  try {
    const result = await prisma.$transaction(async (tx) => {
      await tx.$executeRaw`SELECT pg_advisory_xact_lock(${cuentaId})`;
      const cuenta = await tx.cuentaCobrar.findUnique({ where: { id: cuentaId } });
      if (!cuenta) throw new Error('NO_EXISTE');
      if (['PAGADA', 'ANULADA'].includes(cuenta.estado)) throw new Error('CERRADA');
      if (Number(req.body.monto) > Number(cuenta.saldo)) throw new Error('EXCESO');
      const metodo = await tx.metodoPago.findFirst({ where: { id: req.body.metodoId, activo: true } });
      if (!metodo) throw new Error('METODO');
      if (!/efectivo/i.test(metodo.nombre) && !req.body.numeroOperacion) throw new Error('OPERACION');
      const nuevoSaldo = Number(cuenta.saldo) - Number(req.body.monto);
      const abono = await tx.abonoCuentaCobrar.create({ data: { cuentaId, metodoId: req.body.metodoId, usuarioId, monto: req.body.monto, numeroOperacion: req.body.numeroOperacion, observaciones: req.body.observaciones } });
      await tx.cuentaCobrar.update({ where: { id: cuentaId }, data: { saldo: nuevoSaldo, estado: nuevoSaldo === 0 ? 'PAGADA' : new Date(cuenta.fechaVencimiento) < new Date() ? 'VENCIDA' : 'PARCIAL' } });
      const caja = usuarioId ? await tx.sesionCaja.findFirst({ where: { usuarioId, estado: 'ABIERTA' } }) : null;
      if (/efectivo/i.test(metodo.nombre) && !caja) throw new Error('CAJA');
      if (caja) await tx.movimientoCaja.create({ data: { sesionId: caja.id, usuarioId, tipo: 'PAGO', monto: req.body.monto, concepto: `Abono ${cuenta.codigo}` } });
      return abono;
    });
    return res.status(201).json(result);
  } catch (error: any) {
    const map: Record<string, [number, string]> = { NO_EXISTE: [404, 'Cuenta no encontrada.'], CERRADA: [409, 'La cuenta está cerrada.'], EXCESO: [400, 'El abono supera el saldo pendiente.'], METODO: [400, 'Método de pago inválido.'], OPERACION: [400, 'El número de operación es obligatorio.'], CAJA: [409, 'Debe abrir una caja antes de cobrar en efectivo.'] };
    const known = map[error?.message];
    return res.status(known?.[0] || 500).json({ mensaje: known?.[1] || 'No se pudo registrar el abono.' });
  }
};

export const anularCuenta = async (req: Request, res: Response): Promise<any> => {
  const cuenta = await prisma.cuentaCobrar.findUnique({ where: { id: Number(req.params.id) }, include: { abonos: true } });
  if (!cuenta) return res.status(404).json({ mensaje: 'Cuenta no encontrada.' });
  if (cuenta.abonos.length) return res.status(409).json({ mensaje: 'No puede anular una cuenta con abonos; realice una reversión controlada.' });
  return res.json(await prisma.cuentaCobrar.update({ where: { id: cuenta.id }, data: { estado: 'ANULADA' } }));
};
