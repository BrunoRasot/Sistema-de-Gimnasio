import crypto from 'node:crypto';
import bcrypt from 'bcryptjs';
import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import request from 'supertest';
import app from '../../app.js';
import { prisma } from '../../database/prisma.js';
import { env } from '../../config/env.js';

describe('Integración: recuperación de contraseña', () => {
  let usuarioId: number;
  const suffix = `${Date.now()}-${Math.random().toString(16).slice(2)}`;
  const nombreUsuario = `recovery-${suffix}`;
  const email = `${nombreUsuario}@test.local`;
  const codigo = '314159';
  const nuevaPassword = 'NuevaPassword-456!';

  beforeAll(async () => {
    const usuario = await prisma.usuario.create({
      data: {
        nombres: 'Usuario', apellidos: 'Recuperación', dni: `${Date.now()}`.slice(-8) + Math.floor(Math.random() * 10),
        email, nombreUsuario, password: await bcrypt.hash('PasswordAnterior-123!', 4), rol: 'USER', cargo: `Recovery-${suffix}`,
      },
    });
    usuarioId = usuario.id;
  });

  afterAll(async () => {
    await prisma.usuario.deleteMany({ where: { id: usuarioId } });
  });

  it('responde igual aunque la cuenta no exista', async () => {
    const existente = await request(app).post('/api/auth/solicitar-recuperacion').send({ identificador: email });
    const inexistente = await request(app).post('/api/auth/solicitar-recuperacion').send({ identificador: 'nadie@test.local' });
    expect(existente.status).toBe(200);
    expect(inexistente.status).toBe(200);
    expect(existente.body.mensaje).toBe(inexistente.body.mensaje);
    expect(await prisma.passwordResetToken.count({ where: { usuarioId } })).toBe(1);
  });

  it('cambia la contraseña, desbloquea la cuenta y revoca sesiones', async () => {
    await prisma.usuario.update({ where: { id: usuarioId }, data: { estadoCuenta: 'Bloqueada', bloqueoHasta: new Date(Date.now() + 60_000), intentosFallidos: 3 } });
    await prisma.passwordResetToken.deleteMany({ where: { usuarioId } });
    await prisma.passwordResetToken.create({
      data: { usuarioId, token: crypto.createHmac('sha256', env.JWT_ACCESS_SECRET).update(`${usuarioId}:${codigo}`).digest('hex'), expiresAt: new Date(Date.now() + 60_000) },
    });
    await prisma.refreshToken.create({ data: { usuarioId, token: crypto.randomUUID(), expiresAt: new Date(Date.now() + 60_000) } });

    const response = await request(app).post('/api/auth/restablecer-password').send({ identificador: email, codigo, nuevaPassword });
    expect(response.status).toBe(200);
    const usuario = await prisma.usuario.findUniqueOrThrow({ where: { id: usuarioId } });
    expect(await bcrypt.compare(nuevaPassword, usuario.password)).toBe(true);
    expect(usuario.estadoCuenta).toBe('Activa');
    expect(usuario.bloqueoHasta).toBeNull();
    expect(await prisma.refreshToken.count({ where: { usuarioId } })).toBe(0);
  });

  it('impide reutilizar el código', async () => {
    const response = await request(app).post('/api/auth/restablecer-password').send({ identificador: email, codigo, nuevaPassword: 'OtraPassword-789!' });
    expect(response.status).toBe(400);
  });

  it('rechaza contraseñas débiles', async () => {
    const response = await request(app).post('/api/auth/restablecer-password').send({ identificador: email, codigo: '000000', nuevaPassword: 'débil' });
    expect(response.status).toBe(400);
  });
});
