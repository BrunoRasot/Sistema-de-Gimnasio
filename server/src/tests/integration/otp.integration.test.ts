import bcrypt from 'bcryptjs';
import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import request from 'supertest';
import app from '../../app.js';
import { prisma } from '../../database/prisma.js';

describe('Integración: contraseña y OTP', () => {
  let usuarioId: number;
  const suffix = `${Date.now()}-${Math.random().toString(16).slice(2)}`;
  const nombreUsuario = `otp-${suffix}`;
  const password = 'PasswordOTP-123!';

  beforeAll(async () => {
    const usuario = await prisma.usuario.create({
      data: {
        nombres: 'Usuario',
        apellidos: 'OTP',
        dni: `${Date.now()}`.slice(-8) + Math.floor(Math.random() * 10),
        email: `${nombreUsuario}@test.local`,
        nombreUsuario,
        password: await bcrypt.hash(password, 4),
        rol: 'USER',
        cargo: `OTP-${suffix}`,
      },
    });
    usuarioId = usuario.id;
  });

  afterAll(async () => {
    if (usuarioId) {
      await prisma.refreshToken.deleteMany({ where: { usuarioId } });
      await prisma.usuario.deleteMany({ where: { id: usuarioId } });
    }
  });

  it('valida la contraseña y genera un OTP cifrado', async () => {
    const response = await request(app).post('/api/auth/login').send({ usuario: nombreUsuario, password });
    expect(response.status).toBe(200);

    const usuario = await prisma.usuario.findUniqueOrThrow({ where: { id: usuarioId } });
    expect(usuario.codigoOtp).toBeTruthy();
    expect(usuario.codigoOtp).not.toMatch(/^\d{6}$/);
    expect(usuario.expiracionOtp).toBeInstanceOf(Date);
  });

  it('rechaza un OTP incorrecto', async () => {
    const response = await request(app)
      .post('/api/auth/verificar-otp')
      .send({ usuario: nombreUsuario, codigo: '000000' });
    expect(response.status).toBe(401);
  });

  it('acepta un OTP vigente una sola vez', async () => {
    await prisma.usuario.update({
      where: { id: usuarioId },
      data: {
        codigoOtp: await bcrypt.hash('123456', 4),
        expiracionOtp: new Date(Date.now() + 60_000),
        intentosFallidos: 0,
      },
    });

    const response = await request(app)
      .post('/api/auth/verificar-otp')
      .send({ usuario: nombreUsuario, codigo: '123456' });
    expect(response.status).toBe(200);
    expect(response.body.token).toBeDefined();

    const reutilizado = await request(app)
      .post('/api/auth/verificar-otp')
      .send({ usuario: nombreUsuario, codigo: '123456' });
    expect(reutilizado.status).toBe(401);
  });

  it('rechaza un OTP vencido', async () => {
    await prisma.usuario.update({
      where: { id: usuarioId },
      data: {
        codigoOtp: await bcrypt.hash('654321', 4),
        expiracionOtp: new Date(Date.now() - 1_000),
      },
    });
    const response = await request(app)
      .post('/api/auth/verificar-otp')
      .send({ usuario: nombreUsuario, codigo: '654321' });
    expect(response.status).toBe(401);
  });
});
