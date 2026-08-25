import 'dotenv/config';
import { describe, it, expect, beforeAll } from 'vitest';
import request from 'supertest';
import jwt from 'jsonwebtoken';
import app from '../../../app.js';
import { prisma } from '../../../database/prisma.js';

describe('Pruebas del módulo de Proveedores', () => {
  let tokenAdmin: string;
  let proveedorId: number;

  beforeAll(() => {
    tokenAdmin = jwt.sign(
      { sub: 1, rol: 'ADMIN', nombreUsuario: 'admin', type: 'access' },
      process.env.JWT_SECRET as string,
      { expiresIn: '15m' },
    );
  });

  it('Debería crear un proveedor', async () => {
    const response = await request(app)
      .post('/api/proveedores')
      .set('Authorization', `Bearer ${tokenAdmin}`)
      .send({
        nombre: 'Prov Test',
        contacto: 'Juan',
        telefono: '123456789',
        email: 'prov@test.com',
        direccion: 'Calle 1',
        estado: true,
      });

    expect(response.status).toBe(201);
    proveedorId = response.body.id;
  });

  it('Debería obtener los proveedores', async () => {
    const response = await request(app)
      .get('/api/proveedores')
      .set('Authorization', `Bearer ${tokenAdmin}`);
    expect(response.status).toBe(200);
    expect(Array.isArray(response.body)).toBe(true);
  });

  it('Debería actualizar un proveedor', async () => {
    const response = await request(app)
      .put(`/api/proveedores/${proveedorId}`)
      .set('Authorization', `Bearer ${tokenAdmin}`)
      .send({
        nombre: 'Prov Test Edit',
        contacto: 'Pedro',
        telefono: '123456789',
        email: 'prov@test.com',
        direccion: 'Calle 1',
        estado: true,
      });

    expect(response.status).toBe(200);
    expect(response.body.nombre).toBe('Prov Test Edit');
  });

  it('Debería eliminar el proveedor', async () => {
    const response = await request(app)
      .delete(`/api/proveedores/${proveedorId}`)
      .set('Authorization', `Bearer ${tokenAdmin}`);
    expect(response.status).toBe(200);
    const verificacion = await prisma.proveedor.findUnique({ where: { id: proveedorId } });
    expect(verificacion).toBeNull();
  });
});
