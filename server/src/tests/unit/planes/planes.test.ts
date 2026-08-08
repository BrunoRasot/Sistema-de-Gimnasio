import 'dotenv/config';
import { describe, it, expect, beforeAll } from 'vitest';
import request from 'supertest';
import jwt from 'jsonwebtoken';
import app from '../app.js';
import { prisma } from '../database/prisma.js';

describe('Pruebas del módulo de Planes', () => {
  let tokenAdmin: string;
  let planId: number;

  beforeAll(() => {
    tokenAdmin = jwt.sign(
      { sub: 1, rol: 'ADMIN', nombreUsuario: 'admin', type: 'access' },
      process.env.JWT_SECRET as string,
      { expiresIn: '15m' },
    );
  });

  it('Debería obtener los planes', async () => {
    const response = await request(app)
      .get('/api/planes')
      .set('Authorization', `Bearer ${tokenAdmin}`);
    expect(response.status).toBe(200);
    expect(Array.isArray(response.body)).toBe(true);
  });

  it('Debería crear un nuevo plan', async () => {
    const response = await request(app)
      .post('/api/planes')
      .set('Authorization', `Bearer ${tokenAdmin}`)
      .send({
        nombre: 'Plan Test',
        descripcion: 'Test',
        precio: 100,
        duracionDias: 30,
        estado: 'Activo',
      });

    expect(response.status).toBe(201);
    planId = response.body.id;
  });

  it('Debería actualizar un plan', async () => {
    const response = await request(app)
      .put(`/api/planes/${planId}`)
      .set('Authorization', `Bearer ${tokenAdmin}`)
      .send({
        nombre: 'Plan Test Edit',
        descripcion: 'Test Edit',
        precio: 120,
        duracionDias: 30,
        estado: 'Activo',
      });

    expect(response.status).toBe(200);
    expect(Number(response.body.precio)).toBe(120);
  });

  it('Debería eliminar un plan', async () => {
    const response = await request(app)
      .delete(`/api/planes/${planId}`)
      .set('Authorization', `Bearer ${tokenAdmin}`);
    expect(response.status).toBe(200);

    const verificacion = await prisma.plan.findUnique({ where: { id: planId } });
    expect(verificacion).toBeNull();
  });
});
