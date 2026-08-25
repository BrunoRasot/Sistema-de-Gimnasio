import request from 'supertest';
import { afterEach, describe, expect, it, vi } from 'vitest';
import app from '../../app.js';
import { prisma } from '../../database/prisma.js';

describe('Salud y errores operacionales', () => {
  afterEach(() => vi.restoreAllMocks());

  it('informa que el proceso está vivo sin consultar dependencias', async () => {
    const query = vi.spyOn(prisma, '$queryRaw');
    const response = await request(app).get('/api/health/live');

    expect(response.status).toBe(200);
    expect(response.body).toEqual({ status: 'ok' });
    expect(query).not.toHaveBeenCalled();
    expect(response.headers['x-request-id']).toMatch(/^[0-9a-f-]{36}$/);
  });

  it('propaga un identificador válido para correlacionar logs y respuestas', async () => {
    const response = await request(app).get('/api/health/live').set('x-request-id', 'tesis-req-123');

    expect(response.headers['x-request-id']).toBe('tesis-req-123');
  });

  it('informa que está preparado cuando PostgreSQL responde', async () => {
    vi.spyOn(prisma, '$queryRaw').mockResolvedValue([{ '?column?': 1 }]);
    const response = await request(app).get('/api/health/ready');

    expect(response.status).toBe(200);
    expect(response.body).toEqual({ status: 'ready', database: 'up' });
  });

  it('devuelve 503 cuando PostgreSQL no está disponible', async () => {
    vi.spyOn(prisma, '$queryRaw').mockRejectedValue(new Error('database unavailable'));
    const response = await request(app).get('/api/health/ready');

    expect(response.status).toBe(503);
    expect(response.body).toEqual({ status: 'not_ready', database: 'down' });
  });

  it('responde con un contrato 404 consistente para rutas inexistentes', async () => {
    const response = await request(app).get('/api/ruta-inexistente');

    expect(response.status).toBe(404);
    expect(response.body).toEqual({
      mensaje: 'Ruta no encontrada',
      ruta: '/api/ruta-inexistente',
    });
  });

  it('oculta los detalles internos de errores no controlados', async () => {
    const response = await request(app)
      .get('/api/health/live')
      .set('Origin', 'https://origen-no-autorizado.example')
      .set('x-request-id', 'req-tesis-1');

    expect(response.status).toBe(500);
    expect(response.body).toEqual({
      mensaje: 'Error interno del servidor',
      requestId: 'req-tesis-1',
    });
    expect(JSON.stringify(response.body)).not.toContain('CORS');
  });
});
