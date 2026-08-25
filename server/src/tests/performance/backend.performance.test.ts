import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import request from 'supertest';
import app from '../../app.js';
import { crearAdminDePrueba } from '../helpers/testAdmin.js';

describe('Rendimiento: smoke test HTTP', () => {
  let token: string;
  let limpiarAdmin: () => Promise<void>;

  beforeAll(async () => {
    const testAdmin = await crearAdminDePrueba('performance');
    token = testAdmin.token;
    limpiarAdmin = testAdmin.limpiar;
  });

  afterAll(async () => {
    if (limpiarAdmin) await limpiarAdmin();
  });

  it('atiende 50 consultas concurrentes sin errores ni agotamiento del pool', async () => {
    const inicio = performance.now();
    const responses = await Promise.all(
      Array.from({ length: 50 }, () =>
        request(app).get('/api/planes').set('Authorization', `Bearer ${token}`),
      ),
    );
    const duracion = performance.now() - inicio;

    expect(responses.every((response) => response.status === 200)).toBe(true);
    expect(duracion).toBeLessThan(10_000);
  }, 15_000);
});
