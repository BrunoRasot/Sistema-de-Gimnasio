import 'dotenv/config';
import { describe, it, expect, beforeAll } from 'vitest';
import request from 'supertest';
import jwt from 'jsonwebtoken';
import app from '../../../app.js';
import { prisma } from '../../../database/prisma.js';

describe('Pruebas del módulo de Productos', () => {
  let tokenAdmin: string;
  let productoId: number;
  let categoriaId: number;

  beforeAll(async () => {
    tokenAdmin = jwt.sign(
      { sub: 1, rol: 'ADMIN', nombreUsuario: 'admin', type: 'access' },
      process.env.JWT_SECRET as string,
      { expiresIn: '15m' },
    );
    const cat = await prisma.categoria.create({ data: { nombre: 'Cat Prod Test', estado: true } });
    categoriaId = cat.id;
  });

  it('Debería crear un producto', async () => {
    const response = await request(app)
      .post('/api/productos')
      .set('Authorization', `Bearer ${tokenAdmin}`)
      .send({
        nombre: 'Prod Test',
        sku: 'SKU-001',
        precioCompra: 10,
        precioVenta: 20,
        stock: 50,
        stockMinimo: 5,
        categoriaId,
        estado: 'Activo',
      });

    expect(response.status).toBe(201);
    productoId = response.body.id;
  });

  it('Debería obtener los productos', async () => {
    const response = await request(app)
      .get('/api/productos')
      .set('Authorization', `Bearer ${tokenAdmin}`);
    expect(response.status).toBe(200);
    expect(Array.isArray(response.body)).toBe(true);
  });

  it('Debería actualizar un producto', async () => {
    const response = await request(app)
      .put(`/api/productos/${productoId}`)
      .set('Authorization', `Bearer ${tokenAdmin}`)
      .send({
        nombre: 'Prod Test Edit',
        sku: 'SKU-001',
        precioCompra: 12,
        precioVenta: 25,
        stock: 45,
        stockMinimo: 5,
        categoriaId,
        estado: 'Activo',
      });

    expect(response.status).toBe(200);
    expect(Number(response.body.precioVenta)).toBe(25);
  });

  it('Debería eliminar el producto y su categoría', async () => {
    const resProd = await request(app)
      .delete(`/api/productos/${productoId}`)
      .set('Authorization', `Bearer ${tokenAdmin}`);
    expect(resProd.status).toBe(200);
    await prisma.categoria.delete({ where: { id: categoriaId } });
  });
});
