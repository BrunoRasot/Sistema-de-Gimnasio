import crypto from 'node:crypto';
import jwt from 'jsonwebtoken';
import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import request from 'supertest';
import app from '../../app.js';
import { env } from '../../config/env.js';
import { prisma } from '../../database/prisma.js';
import { crearAdminDePrueba } from '../helpers/testAdmin.js';

describe('Integración: autenticación y ciclo de sesión', () => {
  let adminId: number;
  let refreshToken: string;
  let refreshTokenRevocado: string;
  let limpiarAdmin: () => Promise<void>;

  beforeAll(async () => {
    const testAdmin = await crearAdminDePrueba('integration-auth');
    adminId = testAdmin.admin.id;
    limpiarAdmin = testAdmin.limpiar;
    refreshToken = jwt.sign({ sub: adminId, type: 'refresh' }, env.JWT_REFRESH_SECRET, {
      expiresIn: '7d',
    });
    await prisma.refreshToken.create({
      data: {
        token: crypto.createHash('sha256').update(refreshToken).digest('hex'),
        usuarioId: adminId,
        expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      },
    });
  });

  afterAll(async () => {
    if (limpiarAdmin) await limpiarAdmin();
  });

  it('renueva un access token a partir de una cookie válida', async () => {
    const response = await request(app)
      .post('/api/auth/refresh-token')
      .set('Cookie', `refreshToken=${refreshToken}`);

    expect(response.status).toBe(200);
    const payload = jwt.verify(response.body.token, env.JWT_ACCESS_SECRET) as jwt.JwtPayload;
    expect(Number(payload.sub)).toBe(adminId);
    expect(payload.type).toBe('access');
    expect(response.body.usuario.rol).toBe('ADMIN');
    refreshTokenRevocado = refreshToken;
    const setCookie = response.headers['set-cookie'] as unknown as string[];
    refreshToken = setCookie[0]!.match(/refreshToken=([^;]+)/)![1]!;
    expect(refreshToken).not.toBe(refreshTokenRevocado);
    expect(await prisma.refreshToken.count({ where: { usuarioId: adminId } })).toBe(1);
  });

  it('cierra la sesión y revoca el refresh token persistido', async () => {
    const response = await request(app)
      .post('/api/auth/logout')
      .set('Cookie', `refreshToken=${refreshToken}`);

    expect(response.status).toBe(200);
    expect(await prisma.refreshToken.count({ where: { usuarioId: adminId } })).toBe(0);
  });

  it('rechaza reutilizar una sesión revocada', async () => {
    const sesionVigente = jwt.sign(
      { sub: adminId, type: 'refresh', jti: crypto.randomUUID() },
      env.JWT_REFRESH_SECRET,
      { expiresIn: '7d' },
    );
    await prisma.refreshToken.create({
      data: {
        token: crypto.createHash('sha256').update(sesionVigente).digest('hex'),
        usuarioId: adminId,
        expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      },
    });
    const response = await request(app)
      .post('/api/auth/refresh-token')
      .set('Cookie', `refreshToken=${refreshTokenRevocado}`);
    expect(response.status).toBe(403);
    expect(await prisma.refreshToken.count({ where: { usuarioId: adminId } })).toBe(1);
  });
});
