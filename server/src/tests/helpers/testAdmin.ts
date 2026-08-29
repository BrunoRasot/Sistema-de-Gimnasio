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
  const adminFixture = await prisma.usuario.upsert({
    where: { email: 'suite-admin-fixture@test.local' },
    update: {
      activo: true,
      estadoCuenta: 'Activa',
      estadoLaboral: 'Activo',
      rol: 'ADMIN',
      cargo: 'Administrador',
    },
    create: {
      nombres: 'Admin',
      apellidos: 'Suite',
      dni: '900000001',
      email: 'suite-admin-fixture@test.local',
      nombreUsuario: 'suite_admin_fixture',
      password: await bcrypt.hash('TestPassword-123!', 4),
      rol: 'ADMIN',
      cargo: 'Administrador',
    },
  });
  return jwt.sign(
    { sub: adminFixture.id, rol: adminFixture.rol, nombreUsuario: adminFixture.nombreUsuario, type: 'access' },
    env.JWT_ACCESS_SECRET,
    { expiresIn: '15m' },
  );
};
