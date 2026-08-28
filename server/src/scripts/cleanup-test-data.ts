import 'dotenv/config';
import { prisma } from '../database/prisma.js';

const marcas = ['integración', 'integracion', 'concurrente', 'test '];
const parecePrueba = (value?: string | null) => {
  const text = (value ?? '').toLowerCase();
  return text.endsWith('@test.local') || marcas.some((marca) => text.includes(marca)) || /(?:^|[- ])\d{13,}-[a-f0-9]{8,}$/i.test(text);
};

async function main() {
  const [usuarios, productos, categorias, proveedores, metodos, miembros] = await Promise.all([
    prisma.usuario.findMany({ select: { id: true, email: true, nombreUsuario: true } }),
    prisma.producto.findMany({ select: { id: true, nombre: true, sku: true } }),
    prisma.categoria.findMany({ select: { id: true, nombre: true } }),
    prisma.proveedor.findMany({ select: { id: true, nombre: true, email: true } }),
    prisma.metodoPago.findMany({ select: { id: true, nombre: true } }),
    prisma.miembro.findMany({ select: { id: true, email: true, nombres: true, apellidos: true } }),
  ]);
  const usuarioIds = usuarios.filter(x => parecePrueba(x.email) || parecePrueba(x.nombreUsuario)).map(x => x.id);
  const productoIds = productos.filter(x => parecePrueba(x.nombre) || parecePrueba(x.sku)).map(x => x.id);
  const categoriaIds = categorias.filter(x => parecePrueba(x.nombre)).map(x => x.id);
  const proveedorIds = proveedores.filter(x => parecePrueba(x.nombre) || parecePrueba(x.email)).map(x => x.id);
  const metodoIds = metodos.filter(x => parecePrueba(x.nombre)).map(x => x.id);
  const miembroIds = miembros.filter(x => parecePrueba(x.email) || parecePrueba(`${x.nombres} ${x.apellidos}`)).map(x => x.id);

  const ventas = await prisma.venta.findMany({ where: { OR: [{ usuarioId: { in: usuarioIds } }, { miembroId: { in: miembroIds } }, { metodoId: { in: metodoIds } }, { detalles: { some: { productoId: { in: productoIds } } } }] }, select: { id: true } });
  const ventaIds = ventas.map(x => x.id);
  const sesiones = await prisma.sesionCaja.findMany({ where: { usuarioId: { in: usuarioIds } }, select: { id: true } });
  const sesionIds = sesiones.map(x => x.id);
  const ordenes = await prisma.ordenCompra.findMany({ where: { OR: [{ usuarioId: { in: usuarioIds } }, { proveedorId: { in: proveedorIds } }, { detalles: { some: { productoId: { in: productoIds } } } }] }, select: { id: true } });
  const ordenIds = ordenes.map(x => x.id);

  const resultado = await prisma.$transaction(async tx => {
    await tx.detalleDevolucion.deleteMany({ where: { devolucion: { ventaId: { in: ventaIds } } } });
    await tx.devolucion.deleteMany({ where: { ventaId: { in: ventaIds } } });
    await tx.movimientoCaja.deleteMany({ where: { OR: [{ sesionId: { in: sesionIds } }, { ventaId: { in: ventaIds } }, { usuarioId: { in: usuarioIds } }] } });
    await tx.sesionCaja.deleteMany({ where: { id: { in: sesionIds } } });
    await tx.venta.deleteMany({ where: { id: { in: ventaIds } } });
    await tx.pago.deleteMany({ where: { OR: [{ usuarioId: { in: usuarioIds } }, { miembroId: { in: miembroIds } }, { metodoId: { in: metodoIds } }] } });
    await tx.ordenCompra.deleteMany({ where: { id: { in: ordenIds } } });
    await tx.movimientoInventario.deleteMany({ where: { OR: [{ productoId: { in: productoIds } }, { usuarioId: { in: usuarioIds } }] } });
    await tx.asistencia.deleteMany({ where: { miembroId: { in: miembroIds } } });
    await tx.membresia.deleteMany({ where: { miembroId: { in: miembroIds } } });
    await tx.auditoria.deleteMany({ where: { usuarioId: { in: usuarioIds } } });
    await tx.refreshToken.deleteMany({ where: { usuarioId: { in: usuarioIds } } });
    await tx.passwordResetToken.deleteMany({ where: { usuarioId: { in: usuarioIds } } });
    await tx.producto.deleteMany({ where: { id: { in: productoIds } } });
    await tx.miembro.deleteMany({ where: { id: { in: miembroIds } } });
    await tx.usuario.deleteMany({ where: { id: { in: usuarioIds } } });
    await tx.proveedor.deleteMany({ where: { id: { in: proveedorIds } } });
    await tx.categoria.deleteMany({ where: { id: { in: categoriaIds }, productos: { none: {} } } });
    await tx.metodoPago.deleteMany({ where: { id: { in: metodoIds }, ventas: { none: {} }, pagos: { none: {} }, pagosVenta: { none: {} } } });
    return { usuarios: usuarioIds.length, miembros: miembroIds.length, productos: productoIds.length, categorias: categoriaIds.length, proveedores: proveedorIds.length, metodos: metodoIds.length, ventas: ventaIds.length, cajas: sesionIds.length, ordenes: ordenIds.length };
  });
  console.log(JSON.stringify(resultado, null, 2));
}

main().finally(() => prisma.$disconnect());
