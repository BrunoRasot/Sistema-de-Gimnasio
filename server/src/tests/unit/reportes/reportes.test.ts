import 'dotenv/config';
import { describe, it, expect, beforeAll } from 'vitest';
import request from 'supertest';
import app from '../../../app.js';
import { obtenerTokenAdminActivo } from '../../helpers/testAdmin.js';

describe('Pruebas del módulo de Reportes', () => {
  let tokenAdmin: string;

  beforeAll(async () => {
    tokenAdmin = await obtenerTokenAdminActivo();
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
