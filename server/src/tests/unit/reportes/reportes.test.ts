import 'dotenv/config';
import { describe, it, expect, beforeAll } from 'vitest';
import request from 'supertest';
import jwt from 'jsonwebtoken';
import app from '../app.js';

describe('Pruebas del módulo de Reportes', () => {
  let tokenAdmin: string;

  beforeAll(() => {
    tokenAdmin = jwt.sign(
      { sub: 1, rol: 'ADMIN', nombreUsuario: 'admin', type: 'access' },
      process.env.JWT_SECRET as string,
      { expiresIn: '15m' },
    );
  });

  it('Debería obtener el reporte de ventas', async () => {
    const response = await request(app)
      .get('/api/reportes/ventas')
      .set('Authorization', `Bearer ${tokenAdmin}`);
    expect(response.status).toBe(200);
    expect(response.body.ingresosTotales).toBeDefined();
  });

  it('Debería obtener el reporte de membresías', async () => {
    const response = await request(app)
      .get('/api/reportes/membresias')
      .set('Authorization', `Bearer ${tokenAdmin}`);
    expect(response.status).toBe(200);
    expect(response.body.total).toBeDefined();
  });

  it('Debería obtener el reporte de asistencias', async () => {
    const response = await request(app)
      .get('/api/reportes/asistencias')
      .set('Authorization', `Bearer ${tokenAdmin}`);
    expect(response.status).toBe(200);
    expect(response.body.total).toBeDefined();
  });

  it('Debería obtener el reporte de inventario', async () => {
    const response = await request(app)
      .get('/api/reportes/inventario')
      .set('Authorization', `Bearer ${tokenAdmin}`);
    expect(response.status).toBe(200);
    expect(response.body.valorTotal).toBeDefined();
  });
});
