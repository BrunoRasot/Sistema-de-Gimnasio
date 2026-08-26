import 'dotenv/config';
import { describe, it, expect, beforeAll } from 'vitest';
import request from 'supertest';
import app from '../../../app.js';
import { prisma } from '../../../database/prisma.js';
import { obtenerTokenAdminActivo } from '../../helpers/testAdmin.js';

describe('Pruebas del módulo de Miembros', () => {
  let tokenAdmin: string;
  let miembroId: number;

  beforeAll(async () => {
    tokenAdmin = await obtenerTokenAdminActivo();
  });

  it('Debería obtener la lista de miembros', async () => {
    const response = await request(app)
      .get('/api/miembros')
      .set('Authorization', `Bearer ${tokenAdmin}`);
    expect(response.status).toBe(200);
    expect(Array.isArray(response.body)).toBe(true);
  });

  it('Debería crear un nuevo cliente', async () => {
    const response = await request(app)
      .post('/api/miembros/cliente')
      .set('Authorization', `Bearer ${tokenAdmin}`)
      .send({
        nombres: 'Cliente',
        apellidos: 'Test',
        dni: '88776655',
        email: 'cliente@test.com',
        telefono: '999888777',
      });

    expect(response.status).toBe(201);
    miembroId = response.body.id;
  });

  it('Debería buscar un cliente por DNI', async () => {
    const response = await request(app)
      .get('/api/miembros/buscar/88776655')
      .set('Authorization', `Bearer ${tokenAdmin}`);
    expect(response.status).toBe(200);
    expect(response.body.dni).toBe('88776655');
  });

  it('Debería inactivar un cliente', async () => {
    const response = await request(app)
      .patch(`/api/miembros/${miembroId}/inactivar`)
      .set('Authorization', `Bearer ${tokenAdmin}`);
    expect(response.status).toBe(200);
  });

  it('Limpieza: Eliminar miembro de prueba', async () => {
    await prisma.miembro.delete({ where: { id: miembroId } });
    const verificacion = await prisma.miembro.findUnique({ where: { id: miembroId } });
    expect(verificacion).toBeNull();
  });
});
