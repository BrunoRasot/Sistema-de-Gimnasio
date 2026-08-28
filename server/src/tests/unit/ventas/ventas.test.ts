import 'dotenv/config';
import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import request from 'supertest';
import jwt from 'jsonwebtoken';
import app from '../../../app.js';
import { prisma } from '../../../database/prisma.js';

describe('Pruebas del módulo de Ventas y Devoluciones', () => {
  let tokenAdmin: string;
  let productoId: number;
  let categoriaId: number;
  let ventaCodigo: string;
  let metodoId: number;
  let usuarioTestId: number;
  let sesionCajaId: number;

  beforeAll(async () => {
    const residuos = await prisma.producto.findMany({ where: { sku: 'SKU-VNT' }, select: { id: true } });
    await prisma.movimientoInventario.deleteMany({ where: { productoId: { in: residuos.map((item) => item.id) } } });
    await prisma.producto.deleteMany({ where: { sku: 'SKU-VNT' } });
    await prisma.categoria.deleteMany({ where: { nombre: 'Cat Venta Test' } });
    await prisma.usuario.deleteMany({ where: { email: 'admin_ventas_test@gym.com' } });
    const usuarioTest = await prisma.usuario.create({
      data: {
        nombres: 'Admin',
        apellidos: 'Test',
        dni: '12345678',
        email: 'admin_ventas_test@gym.com',
        nombreUsuario: 'admin_ventas_test',
        password: 'password123',
        rol: 'ADMIN',
      },
    });
    usuarioTestId = usuarioTest.id;

    tokenAdmin = jwt.sign(
      { sub: usuarioTestId, rol: 'ADMIN', nombreUsuario: 'admin_ventas_test', type: 'access' },
      process.env.JWT_SECRET as string,
      { expiresIn: '15m' },
    );

    const cat = await prisma.categoria.create({ data: { nombre: 'Cat Venta Test', estado: true } });
    categoriaId = cat.id;

    const prod = await prisma.producto.create({
      data: {
        nombre: 'Prod Venta',
        sku: 'SKU-VNT',
        precioCompra: 10,
        precioVenta: 20,
        stock: 10,
        categoriaId,
      },
    });
    productoId = prod.id;

    const metodo = await prisma.metodoPago.upsert({
      where: { nombre: 'Efectivo' },
      update: {},
      create: { nombre: 'Efectivo', activo: true },
    });
    metodoId = metodo.id;
    const caja = await prisma.sesionCaja.create({ data: { usuarioId: usuarioTestId, montoInicial: 100 } });
    sesionCajaId = caja.id;
  });

  it('Debería registrar una venta y descontar stock', async () => {
    const response = await request(app)
      .post('/api/ventas')
      .set('Authorization', `Bearer ${tokenAdmin}`)
      .send({
        cliente: 'Cliente Test',
        metodoId: metodoId,
        items: [{ productoId, cantidad: 2 }],
      });

    expect(response.status).toBe(201);
    ventaCodigo = response.body.venta.codigo;

    const productoActualizado = await prisma.producto.findUnique({ where: { id: productoId } });
    expect(productoActualizado?.stock).toBe(8);
  });

  it('Debería registrar una devolución y restaurar stock', async () => {
    const response = await request(app)
      .post('/api/ventas/devoluciones')
      .set('Authorization', `Bearer ${tokenAdmin}`)
      .send({ identificador: ventaCodigo, motivo: 'Prueba de devolución' });

    expect(response.status).toBe(201);

    const productoRestaurado = await prisma.producto.findUnique({ where: { id: productoId } });
    expect(productoRestaurado?.stock).toBe(10);
  });

  afterAll(async () => {
    if (sesionCajaId) await prisma.movimientoCaja.deleteMany({ where: { sesionId: sesionCajaId } });
    if (ventaCodigo) {
      const devolucion = await prisma.devolucion.findFirst({
        where: { venta: { codigo: ventaCodigo } },
      });
      if (devolucion) await prisma.devolucion.delete({ where: { id: devolucion.id } });
      await prisma.venta.deleteMany({ where: { codigo: ventaCodigo } });
    }

    if (productoId) {
      await prisma.movimientoInventario.deleteMany({ where: { productoId } });
      await prisma.producto.deleteMany({ where: { id: productoId } });
    }
    if (categoriaId) await prisma.categoria.deleteMany({ where: { id: categoriaId } });
    if (sesionCajaId) {
      await prisma.sesionCaja.deleteMany({ where: { id: sesionCajaId } });
    }
    if (usuarioTestId) await prisma.usuario.deleteMany({ where: { id: usuarioTestId } });
  });
});
