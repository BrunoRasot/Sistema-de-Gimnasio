import 'dotenv/config';
import { describe, it, expect, beforeAll } from 'vitest';
import request from 'supertest';
import jwt from 'jsonwebtoken';
import app from '../app.js';
import { prisma } from '../database/prisma.js';

describe('Pruebas del módulo de Asistencias', () => {
  let tokenAdmin: string;
  let miembroId: number;
  let asistenciaId: number;

  beforeAll(async () => {
    tokenAdmin = jwt.sign(
      { sub: 1, rol: 'ADMIN', nombreUsuario: 'admin', type: 'access' },
      process.env.JWT_SECRET as string,
      { expiresIn: '15m' },
    );
    const miembro = await prisma.miembro.create({
      data: { nombres: 'Asistencia', apellidos: 'Test', dni: '77665544', estado: 'Activo' },
    });
    miembroId = miembro.id;
  });

  it('Debería registrar una asistencia', async () => {
    const response = await request(app)
      .post('/api/asistencias/registrar')
      .set('Authorization', `Bearer ${tokenAdmin}`)
      .send({ miembroId });

    expect(response.status).toBe(201);
    asistenciaId = response.body.id;
  });

  it('Debería obtener las asistencias de hoy', async () => {
    const response = await request(app)
      .get('/api/asistencias/hoy')
      .set('Authorization', `Bearer ${tokenAdmin}`);
    expect(response.status).toBe(200);
    expect(Array.isArray(response.body)).toBe(true);
  });

  it('Limpieza de datos', async () => {
    await prisma.asistencia.delete({ where: { id: asistenciaId } });
    await prisma.miembro.delete({ where: { id: miembroId } });
  });
});
