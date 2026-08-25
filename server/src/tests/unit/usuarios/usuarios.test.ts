import 'dotenv/config';
import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import request from 'supertest';
import jwt from 'jsonwebtoken';
import app from '../../../app.js';
import { prisma } from '../../../database/prisma.js';

describe('Pruebas del módulo de Usuarios', () => {
  let tokenAdmin: string;
  let usuarioId: number;

  beforeAll(async () => {
    await prisma.usuario.deleteMany({ where: { dni: '99887766' } });
    tokenAdmin = jwt.sign(
      { sub: 1, rol: 'ADMIN', nombreUsuario: 'admin', type: 'access' },
      process.env.JWT_SECRET as string,
      { expiresIn: '15m' },
    );
  });

  afterAll(async () => {
    await prisma.usuario.deleteMany({ where: { dni: '99887766' } });
  });

  it('Debería crear un usuario nuevo', async () => {
    const response = await request(app)
      .post('/api/usuarios')
      .set('Authorization', `Bearer ${tokenAdmin}`)
      .send({
        nombres: 'Test',
        apellidos: 'User',
        dni: '99887766',
        email: 'test@gym.com',
        password: 'Password-123!',
        nombreUsuario: 'testuser',
        rol: 'USER',
      });

    expect(response.status).toBe(201);
    usuarioId = response.body.id;
  });

  it('Debería obtener usuarios paginados', async () => {
    const response = await request(app)
      .get('/api/usuarios')
      .set('Authorization', `Bearer ${tokenAdmin}`);
    expect(response.status).toBe(200);
    expect(response.body.data).toBeDefined();
    expect(Array.isArray(response.body.data)).toBe(true);
  });

  it('Debería rechazar un DNI duplicado', async () => {
    const response = await request(app)
      .post('/api/usuarios')
      .set('Authorization', `Bearer ${tokenAdmin}`)
      .send({
        nombres: 'Test 2',
        apellidos: 'User 2',
        dni: '99887766',
        email: 'test2@gym.com',
        password: 'Password-123!',
        nombreUsuario: 'testuser2',
        rol: 'USER',
      });

    expect(response.status).toBe(400);
  });

  it('Debería desactivar un usuario sin borrar su historial', async () => {
    const response = await request(app)
      .delete(`/api/usuarios/${usuarioId}`)
      .set('Authorization', `Bearer ${tokenAdmin}`);
    expect(response.status).toBe(200);

    const verificacion = await prisma.usuario.findUnique({ where: { id: usuarioId } });
    expect(verificacion).toMatchObject({ activo: false, estadoLaboral: 'Inactivo' });
  });
});
