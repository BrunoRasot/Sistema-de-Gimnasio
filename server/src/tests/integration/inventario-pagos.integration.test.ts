import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import request from 'supertest';
import app from '../../app.js';
import { prisma } from '../../database/prisma.js';
import { crearAdminDePrueba } from '../helpers/testAdmin.js';

describe('Integración: categorías, proveedores, productos y pagos', () => {
  let token: string;
  let adminId: number;
  let limpiarAdmin: () => Promise<void>;
  let categoriaId: number;
  let proveedorId: number;
  let productoId: number;
  let metodoId: number;
  let pagoId: number;
  const suffix = `${Date.now()}-${Math.random().toString(16).slice(2)}`;

  beforeAll(async () => {
    const testAdmin = await crearAdminDePrueba('integration-inventory');
    token = testAdmin.token;
    adminId = testAdmin.admin.id;
    limpiarAdmin = testAdmin.limpiar;
  });

  afterAll(async () => {
    if (pagoId) await prisma.pago.deleteMany({ where: { id: pagoId } });
    if (productoId) await prisma.producto.deleteMany({ where: { id: productoId } });
    if (proveedorId) await prisma.proveedor.deleteMany({ where: { id: proveedorId } });
    if (categoriaId) await prisma.categoria.deleteMany({ where: { id: categoriaId } });
    if (metodoId) await prisma.metodoPago.deleteMany({ where: { id: metodoId } });
    if (limpiarAdmin) await limpiarAdmin();
  });

  it('crea y relaciona el catálogo de inventario mediante HTTP', async () => {
    const categoria = await request(app)
      .post('/api/categorias')
      .set('Authorization', `Bearer ${token}`)
      .send({ nombre: `Categoría ${suffix}`, descripcion: 'Integración', estado: true });
    expect(categoria.status).toBe(201);
    categoriaId = categoria.body.id;

    const proveedor = await request(app)
      .post('/api/proveedores')
      .set('Authorization', `Bearer ${token}`)
      .send({ nombre: `Proveedor ${suffix}`, email: `proveedor-${suffix}@test.local`, estado: true });
    expect(proveedor.status).toBe(201);
    proveedorId = proveedor.body.id;

    const producto = await request(app)
      .post('/api/productos')
      .set('Authorization', `Bearer ${token}`)
      .send({
        nombre: `Producto ${suffix}`,
        sku: `SKU-${suffix}`,
        precioCompra: 5,
        precioVenta: 12,
        stock: 20,
        stockMinimo: 3,
        categoriaId,
        proveedorId,
        estado: 'Activo',
      });
    expect(producto.status).toBe(201);
    productoId = producto.body.id;

    const listado = await request(app)
      .get('/api/productos')
      .set('Authorization', `Bearer ${token}`);
    expect(listado.status).toBe(200);
    expect(listado.body).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ id: productoId, categoria: { nombre: `Categoría ${suffix}` } }),
      ]),
    );
  });

  it('crea un método, registra un pago y lo anula', async () => {
    const metodo = await request(app)
      .post('/api/pagos/metodos')
      .set('Authorization', `Bearer ${token}`)
      .send({ nombre: `Método ${suffix}`, descripcion: 'Integración', activo: true });
    expect(metodo.status).toBe(201);
    metodoId = metodo.body.id;

    const pago = await request(app)
      .post('/api/pagos')
      .set('Authorization', `Bearer ${token}`)
      .send({ cliente: 'Cliente integración', concepto: 'Cuota', monto: 50, metodoId });
    expect(pago.status).toBe(201);
    pagoId = pago.body.id;

    const anulacion = await request(app)
      .patch(`/api/pagos/${pagoId}/anular`)
      .set('Authorization', `Bearer ${token}`);
    expect(anulacion.status).toBe(200);
    expect(anulacion.body.pago.estado).toBe('Anulado');
  });

  it('registra auditoría para las operaciones de escritura', async () => {
    await new Promise((resolve) => setTimeout(resolve, 100));
    const auditorias = await prisma.auditoria.count({ where: { usuarioId: adminId } });
    expect(auditorias).toBeGreaterThanOrEqual(6);
  });
});
