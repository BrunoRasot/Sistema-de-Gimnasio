import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { randomInt } from 'node:crypto';
import { env } from '../../config/env.js';
import { prisma } from '../../database/prisma.js';

export const crearAdminDePrueba = async (prefix: string) => {
  const suffix = `${Date.now()}-${Math.random().toString(16).slice(2)}`;
  const admin = await prisma.usuario.create({
    data: {
      nombres: 'Admin',
      apellidos: 'Pruebas',
      dni: String(randomInt(100_000_000, 1_000_000_000)),
      email: `${prefix}-${suffix}@test.local`,
      nombreUsuario: `${prefix}-${suffix}`,
      password: await bcrypt.hash('TestPassword-123!', 4),
      rol: 'ADMIN',
      cargo: 'Administrador',
    },
  });

  const token = jwt.sign(
    { sub: admin.id, rol: admin.rol, nombreUsuario: admin.nombreUsuario, type: 'access' },
    env.JWT_ACCESS_SECRET,
    { expiresIn: '15m' },
  );

  const limpiar = async () => {
    await new Promise((resolve) => setTimeout(resolve, 50));
    await prisma.auditoria.deleteMany({ where: { usuarioId: admin.id } });
    await prisma.refreshToken.deleteMany({ where: { usuarioId: admin.id } });
    await prisma.usuario.deleteMany({ where: { id: admin.id } });
  };

  return { admin, token, limpiar };
};

export const obtenerTokenAdminActivo = async () => {
  const adminExistente = await prisma.usuario.findFirst({
    where: { rol: 'ADMIN', activo: true, estadoCuenta: 'Activa', estadoLaboral: 'Activo' },
    orderBy: { id: 'asc' },
  });
  if (!adminExistente) {
    const { token } = await crearAdminDePrueba('suite-admin');
    return token;
  }
  return jwt.sign(
    { sub: adminExistente.id, rol: adminExistente.rol, nombreUsuario: adminExistente.nombreUsuario, type: 'access' },
    env.JWT_ACCESS_SECRET,
    { expiresIn: '15m' },
  );
};
