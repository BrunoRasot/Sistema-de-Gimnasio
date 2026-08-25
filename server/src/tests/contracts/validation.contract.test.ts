import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import request from 'supertest';
import app from '../../app.js';
import { crearAdminDePrueba } from '../helpers/testAdmin.js';

describe('Contratos de validación HTTP', () => {
  let token: string;
  let limpiarAdmin: () => Promise<void>;

  beforeAll(async () => {
    const testAdmin = await crearAdminDePrueba('contracts');
    token = testAdmin.token;
    limpiarAdmin = testAdmin.limpiar;
  });

  afterAll(async () => {
    if (limpiarAdmin) await limpiarAdmin();
  });

  it.each([
    ['plan con duración negativa', '/api/planes', { nombre: 'Inválido', precio: 10, duracionDias: -1 }],
    ['cliente con DNI corto', '/api/miembros/cliente', { nombres: 'A', apellidos: 'B', dni: '123' }],
    ['producto con stock negativo', '/api/productos', { nombre: 'P', sku: 'INVALID', precioCompra: 1, precioVenta: 2, stock: -1, stockMinimo: 0, categoriaId: 1 }],
    ['venta sin productos', '/api/ventas', { metodoId: 1, items: [] }],
    ['pago con monto cero', '/api/pagos', { concepto: 'Inválido', monto: 0, metodoId: 1 }],
    ['permisos sin cargo', '/api/permisos', { cargo: '', permisos: {} }],
  ])('rechaza %s', async (_nombre, ruta, body) => {
    const response = await request(app)
      .post(ruta)
      .set('Authorization', `Bearer ${token}`)
      .send(body);
    expect(response.status).toBe(400);
    expect(response.body.mensaje).toBeTypeOf('string');
  });

  it('rechaza configuración con correo inválido', async () => {
    const response = await request(app)
      .put('/api/configuracion/info')
      .set('Authorization', `Bearer ${token}`)
      .send({ nombre: 'Gym', moneda: 'PEN', email: 'correo-invalido' });
    expect(response.status).toBe(400);
  });

  it('rechaza cuerpos JSON superiores al límite configurado', async () => {
    const response = await request(app)
      .post('/api/auth/login')
      .set('Content-Type', 'application/json')
      .send({ usuario: 'x'.repeat(10 * 1024 * 1024 + 1), password: 'x' });
    expect(response.status).toBe(413);
  });

  it('responde 404 para rutas inexistentes sin ejecutar negocio', async () => {
    const response = await request(app).get('/api/ruta-inexistente');
    expect(response.status).toBe(404);
  });
});
