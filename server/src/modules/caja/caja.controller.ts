import { Response } from 'express';
import { prisma } from '../../database/prisma.js';
import { AuthRequest } from '../../middlewares/auth.middleware.js';

const sesionAbierta = (usuarioId?: number) => prisma.sesionCaja.findFirst({ where: { usuarioId, estado: 'ABIERTA' }, include: { movimientos: { orderBy: { createdAt: 'desc' } } } });

async function resumenTurno(sesion: NonNullable<Awaited<ReturnType<typeof sesionAbierta>>>) {
  const [pagosVenta, otrosPagos, metodosActivos] = await Promise.all([
    prisma.ventaPago.findMany({ where: { venta: { usuarioId: sesion.usuarioId, createdAt: { gte: sesion.abiertaAt }, estado: { not: 'Anulado' } } }, include: { metodo: true } }),
    prisma.pago.findMany({ where: { usuarioId: sesion.usuarioId, fecha: { gte: sesion.abiertaAt }, estado: 'Completado' }, include: { metodo: true } }),
    prisma.metodoPago.findMany({ where: { activo: true }, orderBy: { nombre: 'asc' } }),
  ]);
  const acumulado = new Map<number, { metodoId: number; metodoNombre: string; esperado: number }>();
  for (const metodo of metodosActivos) acumulado.set(metodo.id, { metodoId: metodo.id, metodoNombre: metodo.nombre, esperado: 0 });
  for (const pago of [...pagosVenta.map(p => ({ metodoId: p.metodoId, metodo: p.metodo, monto: p.monto })), ...otrosPagos.map(p => ({ metodoId: p.metodoId, metodo: p.metodo, monto: p.monto }))]) {
    const actual = acumulado.get(pago.metodoId) ?? { metodoId: pago.metodoId, metodoNombre: pago.metodo.nombre, esperado: 0 };
    actual.esperado += Number(pago.monto); acumulado.set(pago.metodoId, actual);
  }
  const resumenMetodos = [...acumulado.values()].sort((a, b) => a.metodoNombre.localeCompare(b.metodoNombre));
  const efectivoVentas = resumenMetodos.filter(m => /efectivo/i.test(m.metodoNombre)).reduce((s, m) => s + m.esperado, 0);
  const ajusteEfectivo = sesion.movimientos.filter(m => !['VENTA', 'PAGO'].includes(m.tipo)).reduce((s, m) => s + (m.tipo === 'INGRESO' ? Number(m.monto) : -Number(m.monto)), 0);
  const efectivoEsperado = Number(sesion.montoInicial) + efectivoVentas + ajusteEfectivo;
  return { resumenMetodos, efectivoEsperado, totalEsperado: resumenMetodos.reduce((s, m) => s + m.esperado, 0) + Number(sesion.montoInicial) + ajusteEfectivo };
}

export const obtenerCajaActual = async (req: AuthRequest, res: Response) => { const sesion = await sesionAbierta(req.usuario?.id); res.json(sesion ? { ...sesion, ...(await resumenTurno(sesion)) } : null); };
export const obtenerHistorialCajas = async (_req: AuthRequest, res: Response) => res.json(await prisma.sesionCaja.findMany({ include: { usuario: { select: { nombres: true, apellidos: true } }, movimientos: true, conteos: true, conciliaciones: true }, orderBy: { abiertaAt: 'desc' }, take: 100 }));
export const abrirCaja = async (req: AuthRequest, res: Response) => { if (await sesionAbierta(req.usuario?.id)) return res.status(409).json({ mensaje: 'Ya tienes una caja abierta.' }); res.status(201).json(await prisma.sesionCaja.create({ data: { usuarioId: req.usuario!.id, montoInicial: req.body.montoInicial } })); };
export const registrarMovimiento = async (req: AuthRequest, res: Response) => { const sesion = await sesionAbierta(req.usuario?.id); if (!sesion) return res.status(409).json({ mensaje: 'Debes abrir una caja.' }); res.status(201).json(await prisma.movimientoCaja.create({ data: { sesionId: sesion.id, usuarioId: req.usuario?.id, ...req.body } })); };
export const cerrarCaja = async (req: AuthRequest, res: Response) => {
  const sesion = await sesionAbierta(req.usuario?.id); if (!sesion) return res.status(409).json({ mensaje: 'No tienes una caja abierta.' });
  const resumen = await resumenTurno(sesion); const esperadoPorMetodo = new Map(resumen.resumenMetodos.map(m => [m.metodoId, m.esperado]));
  const conteos = req.body.conteo.map((c: any) => ({ ...c, subtotal: Number(c.denominacion) * Number(c.cantidad) })); const efectivoContado = conteos.reduce((s: number, c: any) => s + c.subtotal, 0);
  const conciliaciones = req.body.conciliaciones.map((c: any) => { const esperado = /efectivo/i.test(c.metodoNombre) ? resumen.efectivoEsperado : (esperadoPorMetodo.get(c.metodoId) ?? 0); const contado = /efectivo/i.test(c.metodoNombre) ? efectivoContado : Number(c.contado); return { metodoId: c.metodoId ?? null, metodoNombre: c.metodoNombre, esperado, contado, diferencia: contado - esperado }; });
  const totalContado = conciliaciones.reduce((s: number, c: any) => s + c.contado, 0); const totalEsperado = conciliaciones.reduce((s: number, c: any) => s + c.esperado, 0);
  const cerrada = await prisma.$transaction(async tx => { await tx.conteoCaja.createMany({ data: conteos.map((c: any) => ({ ...c, sesionId: sesion.id })) }); await tx.conciliacionPagoCaja.createMany({ data: conciliaciones.map((c: any) => ({ ...c, sesionId: sesion.id })) }); return tx.sesionCaja.update({ where: { id: sesion.id }, data: { estado: 'CERRADA', montoEsperado: totalEsperado, montoContado: totalContado, diferencia: totalContado - totalEsperado, observaciones: req.body.observaciones, cerradaAt: new Date() }, include: { conteos: true, conciliaciones: true } }); });
  res.json(cerrada);
};
