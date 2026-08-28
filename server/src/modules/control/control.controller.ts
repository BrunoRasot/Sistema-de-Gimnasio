import { Request, Response } from 'express';
import { prisma } from '../../database/prisma.js';
import type { AuthRequest } from '../../middlewares/auth.middleware.js';

export const listarAuditoria = async (req: Request, res: Response): Promise<any> => {
  const page = Math.max(1, Number(req.query.page) || 1); const pageSize = Math.min(100, Math.max(10, Number(req.query.pageSize) || 30));
  const search = String(req.query.search || '').trim(); const modulo = req.query.modulo ? String(req.query.modulo) : undefined;
  const where: any = { ...(modulo ? { modulo } : {}), ...(search ? { OR: [{ accion: { contains: search, mode: 'insensitive' } }, { detalles: { contains: search, mode: 'insensitive' } }, { ip: { contains: search, mode: 'insensitive' } }] } : {}) };
  const [data, total] = await Promise.all([prisma.auditoria.findMany({ where, include: { usuario: { select: { nombres: true, apellidos: true, nombreUsuario: true } } }, orderBy: { createdAt: 'desc' }, skip: (page - 1) * pageSize, take: pageSize }), prisma.auditoria.count({ where })]);
  return res.json({ data, pagination: { page, pageSize, total, pageCount: Math.ceil(total / pageSize) } });
};

export const obtenerAlertas = async (req: AuthRequest, res: Response): Promise<any> => {
  const ahora = new Date(); const enSieteDias = new Date(ahora.getTime() + 7 * 86400000);
  const usuario = await prisma.usuario.findUnique({ where: { id: req.usuario!.id }, select: { rol: true, cargo: true } });
  if (!usuario) return res.status(401).json({ mensaje: 'Usuario no encontrado.' });
  const permisos = usuario.rol === 'ADMIN' ? [] : await prisma.permiso.findMany({ where: { cargo: usuario.cargo, ver: true }, select: { modulo: true } });
  const puede = (modulo: string) => usuario.rol === 'ADMIN' || permisos.some((p) => p.modulo === modulo);
  await prisma.cuentaCobrar.updateMany({ where: { saldo: { gt: 0 }, fechaVencimiento: { lt: ahora }, estado: { in: ['PENDIENTE', 'PARCIAL'] } }, data: { estado: 'VENCIDA' } });
  const [productos, membresias, cartera, cajas] = await Promise.all([
    puede('productos') || puede('inventario') ? prisma.producto.findMany({ where: { estado: 'Activo' }, select: { id: true, nombre: true, stock: true, stockMinimo: true } }) : Promise.resolve([]),
    puede('membresias') ? prisma.membresia.findMany({ where: { estado: 'Activa', fechaFin: { gte: ahora, lte: enSieteDias } }, include: { miembro: true, plan: true }, orderBy: { fechaFin: 'asc' } }) : Promise.resolve([]),
    puede('cartera') ? prisma.cuentaCobrar.findMany({ where: { estado: 'VENCIDA' }, include: { miembro: true }, orderBy: { fechaVencimiento: 'asc' } }) : Promise.resolve([]),
    puede('caja') ? prisma.sesionCaja.findMany({ where: { estado: 'CERRADA', diferencia: { not: 0 }, cerradaAt: { gte: new Date(ahora.getTime() - 7 * 86400000) } }, include: { usuario: { select: { nombres: true, apellidos: true } } }, orderBy: { cerradaAt: 'desc' } }) : Promise.resolve([]),
  ]);
  const stock = productos.filter((p) => p.stock <= p.stockMinimo);
  return res.json({ stock, membresias, cartera, cajas, total: stock.length + membresias.length + cartera.length + cajas.length });
};

const csv = (rows: Array<Record<string, unknown>>) => {
  if (!rows.length) return '\uFEFF'; const headers = Object.keys(rows[0]);
  const escape = (v: unknown) => `"${String(v ?? '').replace(/"/g, '""')}"`;
  return '\uFEFF' + [headers.map(escape).join(','), ...rows.map(r => headers.map(h => escape(r[h])).join(','))].join('\r\n');
};
export const exportar = async (req: Request, res: Response): Promise<any> => {
  const tipo = String(req.params.tipo); let rows: Array<Record<string, unknown>> = [];
  if (tipo === 'ventas') rows = (await prisma.venta.findMany({ include: { metodoPago: true }, orderBy: { createdAt: 'desc' } })).map(v => ({ codigo: v.codigo, fecha: v.createdAt.toISOString(), cliente: v.cliente, subtotal: v.subtotal, descuento: v.descuento, total: v.total, estado: v.estado, metodo: v.metodoPago.nombre }));
  else if (tipo === 'cartera') rows = (await prisma.cuentaCobrar.findMany({ include: { miembro: true }, orderBy: { fechaVencimiento: 'asc' } })).map(c => ({ codigo: c.codigo, socio: `${c.miembro.nombres} ${c.miembro.apellidos}`, concepto: c.concepto, total: c.montoTotal, saldo: c.saldo, vencimiento: c.fechaVencimiento.toISOString(), estado: c.estado }));
  else if (tipo === 'miembros') rows = (await prisma.miembro.findMany({ orderBy: { createdAt: 'desc' } })).map(m => ({ dni: m.dni, nombres: m.nombres, apellidos: m.apellidos, telefono: m.telefono, email: m.email, estado: m.estado, registro: m.createdAt.toISOString() }));
  else if (tipo === 'asistencias') rows = (await prisma.asistencia.findMany({ include: { miembro: true }, orderBy: { fechaHora: 'desc' } })).map(a => ({ fecha: a.fechaHora.toISOString(), dni: a.miembro.dni, socio: `${a.miembro.nombres} ${a.miembro.apellidos}` }));
  else return res.status(404).json({ mensaje: 'Exportación no disponible.' });
  res.setHeader('Content-Type', 'text/csv; charset=utf-8'); res.setHeader('Content-Disposition', `attachment; filename="${tipo}-${new Date().toISOString().slice(0, 10)}.csv"`); return res.send(csv(rows));
};
