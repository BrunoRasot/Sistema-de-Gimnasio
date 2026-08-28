import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import request from 'supertest';
import app from '../../app.js';
import { prisma } from '../../database/prisma.js';
import { crearAdminDePrueba } from '../helpers/testAdmin.js';

describe('Concurrencia e idempotencia del backend', () => {
  let token: string;
  let limpiarAdmin: () => Promise<void>;
  let categoriaId: number;
  let productoId: number;
  let metodoId: number;
  let planId: number;
  let miembroId: number;
  let ventaId: number;
  const suffix = `${Date.now()}-${Math.random().toString(16).slice(2)}`;

  beforeAll(async () => {
    const testAdmin = await crearAdminDePrueba('concurrency');
    token = testAdmin.token;
    limpiarAdmin = testAdmin.limpiar;
    const categoria = await prisma.categoria.create({ data: { nombre: `Concurrente ${suffix}` } });
    categoriaId = categoria.id;
    const producto = await prisma.producto.create({
      data: {
        nombre: `Producto concurrente ${suffix}`,
        sku: `CON-${suffix}`,
        precioCompra: 5,
        precioVenta: 10,
        stock: 1,
        stockMinimo: 0,
        categoriaId,
      },
    });
    productoId = producto.id;
    const metodo = await prisma.metodoPago.create({
      data: { nombre: `Método concurrente ${suffix}` },
    });
    metodoId = metodo.id;
    const plan = await prisma.plan.create({
      data: { nombre: `Plan concurrente ${suffix}`, precio: 50, duracionDias: 30 },
    });
    planId = plan.id;
    const miembro = await prisma.miembro.create({
      data: { nombres: 'Miembro', apellidos: 'Concurrente', dni: `${Date.now()}`.slice(-8) },
    });
    miembroId = miembro.id;
  });

  afterAll(async () => {
    if (miembroId) {
      await prisma.asistencia.deleteMany({ where: { miembroId } });
      await prisma.membresia.deleteMany({ where: { miembroId } });
      await prisma.miembro.deleteMany({ where: { id: miembroId } });
    }
    if (ventaId) {
      await prisma.devolucion.deleteMany({ where: { ventaId } });
      await prisma.venta.deleteMany({ where: { id: ventaId } });
    }
    if (productoId) {
      await prisma.movimientoInventario.deleteMany({ where: { productoId } });
      await prisma.producto.deleteMany({ where: { id: productoId } });
    }
    if (categoriaId) await prisma.categoria.deleteMany({ where: { id: categoriaId } });
    if (metodoId) await prisma.metodoPago.deleteMany({ where: { id: metodoId } });
    if (planId) await prisma.plan.deleteMany({ where: { id: planId } });
    if (limpiarAdmin) await limpiarAdmin();
  });

  it('permite solo una venta cuando dos solicitudes compiten por la última unidad', async () => {
    const vender = () =>
      request(app)
        .post('/api/ventas')
        .set('Authorization', `Bearer ${token}`)
        .send({ metodoId, items: [{ productoId, cantidad: 1 }] });

    const responses = await Promise.all([vender(), vender()]);
    expect(responses.map((response) => response.status).sort()).toEqual([201, 409]);
    ventaId = responses.find((response) => response.status === 201)!.body.venta.id;
    expect((await prisma.producto.findUniqueOrThrow({ where: { id: productoId } })).stock).toBe(0);
  });

  it('permite solo una membresía activa ante asignaciones simultáneas', async () => {
    const asignar = () =>
      request(app)
        .post('/api/miembros/asignar-membresia')
        .set('Authorization', `Bearer ${token}`)
        .send({ miembroId, planId });

    const responses = await Promise.all([asignar(), asignar()]);
    expect(responses.map((response) => response.status).sort()).toEqual([201, 400]);
    expect(
      await prisma.membresia.count({ where: { miembroId, estado: 'Activa' } }),
    ).toBe(1);
  });

  it('permite solo una asistencia diaria ante solicitudes simultáneas', async () => {
    const registrar = () =>
      request(app)
        .post('/api/asistencias/registrar')
        .set('Authorization', `Bearer ${token}`)
        .send({ miembroId });

    const responses = await Promise.all([registrar(), registrar()]);
    expect(responses.map((response) => response.status).sort()).toEqual([201, 409]);
    expect(await prisma.asistencia.count({ where: { miembroId } })).toBe(1);
  });

  it('procesa una devolución solo una vez ante solicitudes simultáneas', async () => {
    const venta = await prisma.venta.findUniqueOrThrow({ where: { id: ventaId } });
    const devolver = () =>
      request(app)
        .post('/api/ventas/devoluciones')
        .set('Authorization', `Bearer ${token}`)
        .send({ identificador: venta.codigo, motivo: 'Concurrencia' });

    const responses = await Promise.all([devolver(), devolver()]);
    expect(responses.map((response) => response.status).sort()).toEqual([201, 409]);
    expect(await prisma.devolucion.count({ where: { ventaId } })).toBe(1);
    expect((await prisma.producto.findUniqueOrThrow({ where: { id: productoId } })).stock).toBe(1);
  });
});
