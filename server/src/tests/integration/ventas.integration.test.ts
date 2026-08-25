import 'dotenv/config';
import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import request from 'supertest';
import app from '../../app.js';
import { prisma } from '../../database/prisma.js';
import { crearAdminDePrueba } from '../helpers/testAdmin.js';

describe('Integración: ventas, inventario y devoluciones', () => {
  let token: string;
  let limpiarAdmin: () => Promise<void>;
  let categoriaId: number;
  let productoId: number;
  let metodoId: number;
  let ventaId: number;
  let ventaParcialId: number;
  const suffix = `${Date.now()}-${Math.random().toString(16).slice(2)}`;

  beforeAll(async () => {
    const testAdmin = await crearAdminDePrueba('integration-sales');
    token = testAdmin.token;
    limpiarAdmin = testAdmin.limpiar;

    const categoria = await prisma.categoria.create({
      data: { nombre: `Categoría integración ${suffix}` },
    });
    categoriaId = categoria.id;

    const producto = await prisma.producto.create({
      data: {
        nombre: `Producto integración ${suffix}`,
        sku: `INT-${suffix}`,
        precioCompra: 10,
        precioVenta: 25,
        stock: 10,
        stockMinimo: 2,
        categoriaId,
      },
    });
    productoId = producto.id;

    const metodo = await prisma.metodoPago.create({
      data: { nombre: `Método integración ${suffix}`, activo: true },
    });
    metodoId = metodo.id;
  });

  afterAll(async () => {
    if (ventaId) {
      await prisma.devolucion.deleteMany({ where: { ventaId } });
      await prisma.venta.deleteMany({ where: { id: ventaId } });
    }
    if (ventaParcialId) {
      await prisma.devolucion.deleteMany({ where: { ventaId: ventaParcialId } });
      await prisma.venta.deleteMany({ where: { id: ventaParcialId } });
    }
    if (productoId) await prisma.producto.deleteMany({ where: { id: productoId } });
    if (categoriaId) await prisma.categoria.deleteMany({ where: { id: categoriaId } });
    if (metodoId) await prisma.metodoPago.deleteMany({ where: { id: metodoId } });
    if (limpiarAdmin) await limpiarAdmin();
  });

  it('crea una venta y descuenta el stock real', async () => {
    const response = await request(app)
      .post('/api/ventas')
      .set('Authorization', `Bearer ${token}`)
      .send({
        cliente: 'Cliente integración',
        metodoId,
        items: [{ productoId, cantidad: 3 }],
      });

    expect(response.status).toBe(201);
    expect(Number(response.body.venta.total)).toBe(75);
    ventaId = response.body.venta.id;

    const producto = await prisma.producto.findUniqueOrThrow({ where: { id: productoId } });
    expect(producto.stock).toBe(7);
  });

  it('devuelve la venta y restaura el stock dentro de una transacción', async () => {
    const venta = await prisma.venta.findUniqueOrThrow({ where: { id: ventaId } });
    const response = await request(app)
      .post('/api/ventas/devoluciones')
      .set('Authorization', `Bearer ${token}`)
      .send({ identificador: venta.codigo, motivo: 'Prueba de integración' });

    expect(response.status).toBe(201);

    const [producto, ventaAnulada] = await Promise.all([
      prisma.producto.findUniqueOrThrow({ where: { id: productoId } }),
      prisma.venta.findUniqueOrThrow({ where: { id: ventaId } }),
    ]);
    expect(producto.stock).toBe(10);
    expect(ventaAnulada.estado).toBe('Devuelto');
  });

  it('rechaza una segunda devolución de la misma venta', async () => {
    const venta = await prisma.venta.findUniqueOrThrow({ where: { id: ventaId } });
    const response = await request(app)
      .post('/api/ventas/devoluciones')
      .set('Authorization', `Bearer ${token}`)
      .send({ identificador: venta.codigo, motivo: 'Duplicada' });

    expect(response.status).toBe(409);
  });

  it('procesa una devolución parcial y conserva la venta parcialmente devuelta', async () => {
    const ventaResponse = await request(app).post('/api/ventas').set('Authorization', `Bearer ${token}`).send({
      cliente: 'Cliente devolución parcial', metodoId, items: [{ productoId, cantidad: 4 }],
    });
    expect(ventaResponse.status).toBe(201);
    ventaParcialId = ventaResponse.body.venta.id;
    const response = await request(app).post('/api/ventas/devoluciones').set('Authorization', `Bearer ${token}`).send({
      identificador: ventaResponse.body.venta.codigo,
      motivo: 'Devolución parcial de prueba',
      items: [{ productoId, cantidad: 1 }],
    });
    expect(response.status).toBe(201);
    const venta = await prisma.venta.findUniqueOrThrow({ where: { id: ventaParcialId } });
    expect(venta.estado).toBe('ParcialmenteDevuelto');
  });

  it('rechaza una devolución sin motivo válido', async () => {
    const response = await request(app).post('/api/ventas/devoluciones').set('Authorization', `Bearer ${token}`).send({ identificador: 'VNT-X', motivo: '' });
    expect(response.status).toBe(400);
  });
});
