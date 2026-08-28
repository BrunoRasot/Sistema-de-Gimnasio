import 'dotenv/config';
import { prisma } from '../database/prisma.js';

async function main() {
  const antes = {
    usuarios: await prisma.usuario.count(),
    metodosPago: await prisma.metodoPago.count(),
    ventas: await prisma.venta.count(),
    miembros: await prisma.miembro.count(),
    productos: await prisma.producto.count(),
    cajas: await prisma.sesionCaja.count(),
  };

  await prisma.$transaction(async (tx) => {
    await tx.detalleDevolucion.deleteMany();
    await tx.devolucion.deleteMany();
    await tx.movimientoCaja.deleteMany();
    await tx.conteoCaja.deleteMany();
    await tx.conciliacionPagoCaja.deleteMany();
    await tx.sesionCaja.deleteMany();
    await tx.ventaPago.deleteMany();
    await tx.detalleVenta.deleteMany();
    await tx.venta.deleteMany();
    await tx.pago.deleteMany();
    await tx.detalleOrdenCompra.deleteMany();
    await tx.ordenCompra.deleteMany();
    await tx.movimientoInventario.deleteMany();
    await tx.asistencia.deleteMany();
    await tx.membresia.deleteMany();
    await tx.miembro.deleteMany();
    await tx.producto.deleteMany();
    await tx.categoria.deleteMany();
    await tx.proveedor.deleteMany();
    await tx.plan.deleteMany();
    await tx.auditoria.deleteMany();
    await tx.refreshToken.deleteMany();
    await tx.passwordResetToken.deleteMany();
    await tx.permiso.deleteMany();
    await tx.configuracion.deleteMany();
  }, { timeout: 30_000 });

  const despues = {
    usuarios: await prisma.usuario.count(),
    metodosPago: await prisma.metodoPago.count(),
    ventas: await prisma.venta.count(),
    pagos: await prisma.pago.count(),
    miembros: await prisma.miembro.count(),
    membresias: await prisma.membresia.count(),
    asistencias: await prisma.asistencia.count(),
    productos: await prisma.producto.count(),
    categorias: await prisma.categoria.count(),
    proveedores: await prisma.proveedor.count(),
    compras: await prisma.ordenCompra.count(),
    cajas: await prisma.sesionCaja.count(),
    kardex: await prisma.movimientoInventario.count(),
    auditorias: await prisma.auditoria.count(),
  };
  console.log(JSON.stringify({ antes, despues }, null, 2));
}

main().finally(() => prisma.$disconnect());
