import jwt from 'jsonwebtoken';
import { describe, expect, it } from 'vitest';
import request from 'supertest';
import app from '../../app.js';
import { env } from '../../config/env.js';

describe('Seguridad HTTP del backend', () => {
  it('publica cabeceras defensivas de Helmet', async () => {
    const response = await request(app).get('/api/configuracion');
    expect(response.headers['x-content-type-options']).toBe('nosniff');
    expect(response.headers['x-frame-options']).toBe('SAMEORIGIN');
    expect(response.headers['content-security-policy']).toBeDefined();
    expect(response.headers['x-powered-by']).toBeUndefined();
    expect(response.headers['cache-control']).toBe('no-store');
  });

  it('rechaza tokens manipulados', async () => {
    const response = await request(app)
      .get('/api/configuracion')
      .set('Authorization', 'Bearer token.manipulado.invalido');
    expect(response.status).toBe(401);
  });

  it('rechaza un refresh token usado como access token', async () => {
    const token = jwt.sign({ sub: 1, type: 'refresh' }, env.JWT_SECRET, { expiresIn: '5m' });
    const response = await request(app)
      .get('/api/configuracion')
      .set('Authorization', `Bearer ${token}`);
    expect(response.status).toBe(401);
  });

  it('rechaza un access token usado para renovar sesión', async () => {
    const token = jwt.sign({ sub: 1, type: 'access' }, env.JWT_SECRET, { expiresIn: '5m' });
    const response = await request(app)
      .post('/api/auth/refresh-token')
      .set('Cookie', `refreshToken=${token}`);
    expect(response.status).toBe(403);
  });

  it('rechaza sesiones de usuarios que ya no existen', async () => {
    const token = jwt.sign(
      { sub: 999999, rol: 'USER', nombreUsuario: 'intruso', type: 'access' },
      env.JWT_SECRET,
      { expiresIn: '5m' },
    );
    const response = await request(app)
      .get('/api/usuarios')
      .set('Authorization', `Bearer ${token}`);
    expect(response.status).toBe(401);
  });

  it('no autoriza un origen CORS desconocido', async () => {
    const response = await request(app)
      .options('/api/auth/login')
      .set('Origin', 'https://sitio-malicioso.example')
      .set('Access-Control-Request-Method', 'POST');
    expect(response.headers['access-control-allow-origin']).toBeUndefined();
    expect(response.status).toBeGreaterThanOrEqual(400);
  });

  it('bloquea mutaciones declaradas como cross-site', async () => {
    const response = await request(app).post('/api/auth/logout').set('Sec-Fetch-Site', 'cross-site');
    expect(response.status).toBe(403);
  });

  it('rechaza cuerpos con un tipo de contenido no permitido', async () => {
    const response = await request(app).post('/api/auth/login').set('Content-Type', 'text/plain').send('usuario=x');
    expect(response.status).toBe(415);
  });

  it('limita intentos excesivos de login', async () => {
    const responses = await Promise.all(
      Array.from({ length: 11 }, () =>
        request(app).post('/api/auth/login').send({ usuario: 'inexistente', password: 'incorrecta' }),
      ),
    );
    expect(responses.some((response) => response.status === 429)).toBe(true);
  });
});
