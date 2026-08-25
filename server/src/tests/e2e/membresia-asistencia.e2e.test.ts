import 'dotenv/config';
import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import request from 'supertest';
import app from '../../app.js';
import { prisma } from '../../database/prisma.js';
import { crearAdminDePrueba } from '../helpers/testAdmin.js';

describe('E2E: alta de cliente, membresía y control de acceso', () => {
  let token: string;
  let limpiarAdmin: () => Promise<void>;
  let planId: number;
  let miembroId: number;
  const suffix = `${Date.now()}${Math.floor(Math.random() * 1000)}`;
  const dni = suffix.slice(-8).padStart(8, '7');

  beforeAll(async () => {
    const testAdmin = await crearAdminDePrueba('e2e-membership');
    token = testAdmin.token;
    limpiarAdmin = testAdmin.limpiar;
  });

  afterAll(async () => {
    if (miembroId) {
      await prisma.asistencia.deleteMany({ where: { miembroId } });
      await prisma.membresia.deleteMany({ where: { miembroId } });
      await prisma.miembro.deleteMany({ where: { id: miembroId } });
    }
    if (planId) await prisma.plan.deleteMany({ where: { id: planId } });
    if (limpiarAdmin) await limpiarAdmin();
  });

  it('completa el recorrido desde crear el plan hasta registrar asistencia', async () => {
    const planResponse = await request(app)
      .post('/api/planes')
      .set('Authorization', `Bearer ${token}`)
      .send({
        nombre: `Plan E2E ${suffix}`,
        descripcion: 'Plan generado por prueba E2E',
        precio: 90,
        duracionDias: 30,
        estado: 'Activo',
      });
    expect(planResponse.status).toBe(201);
    planId = planResponse.body.id;

    const clienteResponse = await request(app)
      .post('/api/miembros/cliente')
      .set('Authorization', `Bearer ${token}`)
      .send({
        nombres: 'Cliente',
        apellidos: 'E2E',
        dni,
        email: `cliente-${suffix}@test.local`,
        telefono: '999999999',
      });
    expect(clienteResponse.status).toBe(201);
    miembroId = clienteResponse.body.id;

    const membresiaResponse = await request(app)
      .post('/api/miembros/asignar-membresia')
      .set('Authorization', `Bearer ${token}`)
      .send({ miembroId, planId });
    expect(membresiaResponse.status).toBe(201);
    expect(membresiaResponse.body.estado).toBe('Activa');

    const busquedaResponse = await request(app)
      .get(`/api/asistencias/buscar/${dni}`)
      .set('Authorization', `Bearer ${token}`);
    expect(busquedaResponse.status).toBe(200);
    expect(busquedaResponse.body.membresias).toHaveLength(1);

    const asistenciaResponse = await request(app)
      .post('/api/asistencias/registrar')
      .set('Authorization', `Bearer ${token}`)
      .send({ miembroId });
    expect(asistenciaResponse.status).toBe(201);
    expect(asistenciaResponse.body.miembro.dni).toBe(dni);

    const resumenResponse = await request(app)
      .get('/api/asistencias/hoy')
      .set('Authorization', `Bearer ${token}`);
    expect(resumenResponse.status).toBe(200);
    expect(resumenResponse.body).toEqual(
      expect.arrayContaining([expect.objectContaining({ miembroId })]),
    );
  });

  it('impide registrar dos accesos del mismo miembro durante el día', async () => {
    const response = await request(app)
      .post('/api/asistencias/registrar')
      .set('Authorization', `Bearer ${token}`)
      .send({ miembroId });

    expect(response.status).toBe(409);
  });
});
