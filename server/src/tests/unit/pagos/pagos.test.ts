import 'dotenv/config';
import { describe, it, expect, beforeAll } from 'vitest';
import request from 'supertest';
import jwt from 'jsonwebtoken';
import app from '../../../app.js';
import { prisma } from '../../../database/prisma.js';

describe('Pruebas del módulo de Pagos', () => {
  let tokenAdmin: string;
  let metodoId: number;
  let pagoId: number;

  beforeAll(() => {
    tokenAdmin = jwt.sign(
      { sub: 1, rol: 'ADMIN', nombreUsuario: 'admin', type: 'access' },
      process.env.JWT_SECRET as string,
      { expiresIn: '15m' },
    );
  });

  it('Debería crear un método de pago', async () => {
    const response = await request(app)
      .post('/api/pagos/metodos')
      .set('Authorization', `Bearer ${tokenAdmin}`)
      .send({ nombre: 'Yape Test', descripcion: 'Pago móvil', activo: true });

    expect(response.status).toBe(201);
    metodoId = response.body.id;
  });

  it('Debería registrar un pago', async () => {
    const response = await request(app)
      .post('/api/pagos')
      .set('Authorization', `Bearer ${tokenAdmin}`)
      .send({ cliente: 'Cliente Test', concepto: 'Membresía', monto: 100, metodoId });

    expect(response.status).toBe(201);
    pagoId = response.body.id;
  });

  it('Debería anular un pago', async () => {
    const response = await request(app)
      .patch(`/api/pagos/${pagoId}/anular`)
      .set('Authorization', `Bearer ${tokenAdmin}`);

    expect(response.status).toBe(200);
    expect(response.body.pago.estado).toBe('Anulado');
  });

  it('Limpieza de datos', async () => {
    await prisma.pago.delete({ where: { id: pagoId } });
    await prisma.metodoPago.delete({ where: { id: metodoId } });
  });
});
