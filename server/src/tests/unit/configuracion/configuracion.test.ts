import 'dotenv/config';
import { describe, it, expect, beforeAll } from 'vitest';
import request from 'supertest';
import app from '../../../app.js';
import { obtenerTokenAdminActivo } from '../../helpers/testAdmin.js';

describe('Pruebas del módulo de Configuración', () => {
  let tokenAdmin: string;

  beforeAll(async () => {
    tokenAdmin = await obtenerTokenAdminActivo();
  });

  it('Debería obtener la configuración general', async () => {
    const response = await request(app)
      .get('/api/configuracion')
      .set('Authorization', `Bearer ${tokenAdmin}`);
    expect(response.status).toBe(200);
    expect(response.body.id).toBe(1);
  });

  it('Debería actualizar la información del sistema', async () => {
    const response = await request(app)
      .put('/api/configuracion/info')
      .set('Authorization', `Bearer ${tokenAdmin}`)
      .send({
        nombre: 'Gym Test',
        ruc: '12345678901',
        telefono: '999888777',
        email: 'test@gym.com',
        direccion: 'Avenida 1',
        moneda: 'PEN',
      });

    expect(response.status).toBe(200);
    expect(response.body.config.nombre).toBe('Gym Test');
  });

  it('Debería actualizar las notificaciones', async () => {
    const response = await request(app)
      .put('/api/configuracion/notificaciones')
      .set('Authorization', `Bearer ${tokenAdmin}`)
      .send({
        nuevasVentas: false,
        membresiasVencidas: true,
        stockBajo: true,
        alertasSistema: true,
        reportesSemanales: false,
      });

    expect(response.status).toBe(200);
    expect(response.body.config.nuevasVentas).toBe(false);
  });
});
