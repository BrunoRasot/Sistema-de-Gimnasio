import 'dotenv/config';
import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import request from 'supertest';
import jwt from 'jsonwebtoken';
import app from '../../../app.js';
import { prisma } from '../../../database/prisma.js';

describe('Pruebas del módulo de Asistencias', () => {
  let tokenAdmin: string;
  let miembroId: number;
  let asistenciaId: number;
  let planId: number;

  beforeAll(async () => {
    tokenAdmin = jwt.sign(
      { sub: 1, rol: 'ADMIN', nombreUsuario: 'admin', type: 'access' },
      process.env.JWT_SECRET as string,
      { expiresIn: '15m' },
    );
    await prisma.miembro.deleteMany({ where: { dni: '77665544' } });
    const plan = await prisma.plan.create({
      data: { nombre: `Plan asistencia ${Date.now()}`, precio: 10, duracionDias: 30 },
    });
    planId = plan.id;
    const miembro = await prisma.miembro.create({
      data: { nombres: 'Asistencia', apellidos: 'Test', dni: '77665544', estado: 'Activo' },
    });
    miembroId = miembro.id;
    await prisma.membresia.create({
      data: {
        miembroId,
        planId,
        fechaInicio: new Date(Date.now() - 60_000),
        fechaFin: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
        montoPagado: 10,
      },
    });
  });

  afterAll(async () => {
    if (asistenciaId) await prisma.asistencia.deleteMany({ where: { id: asistenciaId } });
    if (miembroId) await prisma.membresia.deleteMany({ where: { miembroId } });
    if (miembroId) await prisma.miembro.deleteMany({ where: { id: miembroId } });
    if (planId) await prisma.plan.deleteMany({ where: { id: planId } });
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

  it('Debería impedir una segunda asistencia el mismo día', async () => {
    const response = await request(app)
      .post('/api/asistencias/registrar')
      .set('Authorization', `Bearer ${tokenAdmin}`)
      .send({ miembroId });
    expect(response.status).toBe(409);
  });
});
