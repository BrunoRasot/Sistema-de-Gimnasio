import 'dotenv/config';
import { describe, it, expect } from 'vitest';
import request from 'supertest';
import jwt from 'jsonwebtoken';
import app from '../app.js';

describe('Pruebas de Autenticación y Seguridad', () => {
  it('Debería rechazar un login con datos vacíos y devolver estado 400', async () => {
    const response = await request(app).post('/api/auth/login').send({});
    expect(response.status).toBe(400);
    expect(response.body.mensaje).toBeDefined();
  });

  it('Debería denegar el acceso a rutas protegidas si no hay token (401)', async () => {
    const response = await request(app).get('/api/configuracion');
    expect(response.status).toBe(401);
  });

  it('Debería bloquear a un usuario con rol USER en rutas de administrador (403)', async () => {
    const tokenIntruso = jwt.sign(
      { sub: 999, rol: 'USER', nombreUsuario: 'intruso', type: 'access' },
      process.env.JWT_SECRET as string,
      { expiresIn: '15m' },
    );

    const response = await request(app)
      .put('/api/configuracion/info')
      .set('Authorization', `Bearer ${tokenIntruso}`)
      .send({ nombre: 'Gym Hackeado' });

    expect(response.status).toBe(403);
  });
});
