import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import request from 'supertest';
import app from '../../app.js';
import { prisma } from '../../database/prisma.js';
import { crearAdminDePrueba } from '../helpers/testAdmin.js';

describe('Integración: configuración, permisos, alertas y reportes', () => {
  let token: string;
  let limpiarAdmin: () => Promise<void>;
  let configuracionOriginal: Awaited<ReturnType<typeof prisma.configuracion.findUnique>>;
  const cargo = `Cargo-${Date.now()}-${Math.random().toString(16).slice(2)}`;

  beforeAll(async () => {
    const testAdmin = await crearAdminDePrueba('integration-config');
    token = testAdmin.token;
    limpiarAdmin = testAdmin.limpiar;
    configuracionOriginal = await prisma.configuracion.findUnique({ where: { id: 1 } });
  });

  afterAll(async () => {
    await prisma.permiso.deleteMany({ where: { cargo } });
    if (configuracionOriginal) {
      const { id, updatedAt: _updatedAt, ...data } = configuracionOriginal;
      await prisma.configuracion.upsert({ where: { id }, update: data, create: configuracionOriginal });
    }
    if (limpiarAdmin) await limpiarAdmin();
  });

  it('persiste y recupera la matriz de permisos de un cargo', async () => {
    const guardar = await request(app)
      .post('/api/permisos')
      .set('Authorization', `Bearer ${token}`)
      .send({
        cargo,
        permisos: {
          ventas: { Ver: true, Crear: true, Editar: false, Eliminar: false },
          reportes: { Ver: true, Crear: false, Editar: false, Eliminar: false },
        },
      });
    expect(guardar.status).toBe(200);

    const listado = await request(app)
      .get('/api/permisos')
      .set('Authorization', `Bearer ${token}`);
    expect(listado.status).toBe(200);
    expect(listado.body).toEqual(
      expect.arrayContaining([expect.objectContaining({ cargo, modulo: 'ventas', ver: true })]),
    );
  });

  it('actualiza configuración y obtiene alertas del sistema', async () => {
    const actualizar = await request(app)
      .put('/api/configuracion/notificaciones')
      .set('Authorization', `Bearer ${token}`)
      .send({
        emailNotificaciones: '',
        nuevasVentas: true,
        membresiasVencidas: true,
        stockBajo: true,
        alertasSistema: true,
        reportesSemanales: true,
      });
    expect(actualizar.status).toBe(200);

    const alertas = await request(app)
      .get('/api/configuracion/alertas-tiempo-real')
      .set('Authorization', `Bearer ${token}`);
    expect(alertas.status).toBe(200);
    expect(alertas.body).toEqual(
      expect.arrayContaining([expect.objectContaining({ tipo: 'sistema' })]),
    );
  });

  it.each(['ventas', 'membresias', 'asistencias', 'inventario'])(
    'genera el reporte de %s',
    async (reporte) => {
      const response = await request(app)
        .get(`/api/reportes/${reporte}`)
        .set('Authorization', `Bearer ${token}`);
      expect(response.status).toBe(200);
      expect(response.body).toBeTypeOf('object');
    },
  );
});
