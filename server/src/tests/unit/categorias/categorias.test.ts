import 'dotenv/config';
import { describe, it, expect, beforeAll } from 'vitest';
import request from 'supertest';
import app from '../../../app.js';
import { prisma } from '../../../database/prisma.js';
import { obtenerTokenAdminActivo } from '../../helpers/testAdmin.js';

describe('Pruebas del módulo de Categorías', () => {
  let tokenAdmin: string;
  let categoriaId: number;

  beforeAll(async () => {
    tokenAdmin = await obtenerTokenAdminActivo();
  });

  it('Debería obtener la lista de categorías', async () => {
    const response = await request(app)
      .get('/api/categorias')
      .set('Authorization', `Bearer ${tokenAdmin}`);
    expect(response.status).toBe(200);
    expect(Array.isArray(response.body)).toBe(true);
  });

  it('Debería crear una nueva categoría', async () => {
    const response = await request(app)
      .post('/api/categorias')
      .set('Authorization', `Bearer ${tokenAdmin}`)
      .send({ nombre: 'Cat Test', descripcion: 'Test', estado: true });

    expect(response.status).toBe(201);
    categoriaId = response.body.id;
  });

  it('Debería rechazar creación duplicada', async () => {
    const response = await request(app)
      .post('/api/categorias')
      .set('Authorization', `Bearer ${tokenAdmin}`)
      .send({ nombre: 'Cat Test', descripcion: 'Duplicado', estado: true });

    expect(response.status).toBe(400);
  });

  it('Debería actualizar la categoría', async () => {
    const response = await request(app)
      .put(`/api/categorias/${categoriaId}`)
      .set('Authorization', `Bearer ${tokenAdmin}`)
      .send({ nombre: 'Cat Test Edit', descripcion: 'Editada', estado: false });

    expect(response.status).toBe(200);
    expect(response.body.nombre).toBe('Cat Test Edit');
  });

  it('Debería eliminar la categoría', async () => {
    const response = await request(app)
      .delete(`/api/categorias/${categoriaId}`)
      .set('Authorization', `Bearer ${tokenAdmin}`);
    expect(response.status).toBe(200);

    const verificacion = await prisma.categoria.findUnique({ where: { id: categoriaId } });
    expect(verificacion).toBeNull();
  });
});
