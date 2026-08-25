import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import request from 'supertest';
import app from '../../app.js';
import { prisma } from '../../database/prisma.js';
import { crearAdminDePrueba } from '../helpers/testAdmin.js';

describe('E2E: administración completa de trabajadores', () => {
  let token: string;
  let adminId: number;
  let limpiarAdmin: () => Promise<void>;
  let usuarioId: number;
  const suffix = `${Date.now()}-${Math.random().toString(16).slice(2)}`;
  const dni = `${Date.now()}`.slice(-8) + Math.floor(Math.random() * 10);

  beforeAll(async () => {
    const testAdmin = await crearAdminDePrueba('e2e-users');
    token = testAdmin.token;
    adminId = testAdmin.admin.id;
    limpiarAdmin = testAdmin.limpiar;
  });

  afterAll(async () => {
    if (usuarioId) {
      await prisma.refreshToken.deleteMany({ where: { usuarioId } });
      await prisma.auditoria.deleteMany({ where: { usuarioId } });
      await prisma.usuario.deleteMany({ where: { id: usuarioId } });
    }
    if (limpiarAdmin) await limpiarAdmin();
  });

  it('crea, consulta, edita, bloquea y desactiva un trabajador', async () => {
    const crear = await request(app)
      .post('/api/usuarios')
      .set('Authorization', `Bearer ${token}`)
      .send({
        nombres: 'Trabajador',
        apellidos: 'E2E',
        dni,
        email: `trabajador-${suffix}@test.local`,
        nombreUsuario: `worker-${suffix}`,
        password: 'Password-123!',
        rol: 'USER',
        cargo: 'Recepcionista',
      });
    expect(crear.status).toBe(201);
    usuarioId = crear.body.id;
    expect(crear.body.password).toBeUndefined();

    const obtener = await request(app)
      .get(`/api/usuarios/${usuarioId}`)
      .set('Authorization', `Bearer ${token}`);
    expect(obtener.status).toBe(200);
    expect(obtener.body.dni).toBe(dni);
    expect(obtener.body.password).toBeUndefined();

    const actualizar = await request(app)
      .put(`/api/usuarios/${usuarioId}`)
      .set('Authorization', `Bearer ${token}`)
      .send({ telefono: '988887777', cargo: 'Cajero' });
    expect(actualizar.status).toBe(200);

    const restablecer = await request(app)
      .patch(`/api/usuarios/${usuarioId}/restablecer-password`)
      .set('Authorization', `Bearer ${token}`)
      .send({ nuevaPassword: 'NuevaPassword-123!' });
    expect(restablecer.status).toBe(200);

    const bloquear = await request(app)
      .patch(`/api/usuarios/${usuarioId}/estado`)
      .set('Authorization', `Bearer ${token}`)
      .send({ estado: 'Bloqueada' });
    expect(bloquear.status).toBe(200);

    const eliminar = await request(app)
      .delete(`/api/usuarios/${usuarioId}`)
      .set('Authorization', `Bearer ${token}`);
    expect(eliminar.status).toBe(200);

    const persistido = await prisma.usuario.findUniqueOrThrow({ where: { id: usuarioId } });
    expect(persistido).toMatchObject({ activo: false, estadoLaboral: 'Inactivo' });
  });

  it('oculta contraseñas en la auditoría', async () => {
    await new Promise((resolve) => setTimeout(resolve, 100));
    const auditoria = await prisma.auditoria.findFirst({
      where: { usuarioId: adminId, accion: { contains: '/api/usuarios' } },
      orderBy: { createdAt: 'asc' },
    });
    expect(auditoria?.detalles).toContain('***OCULTO***');
    expect(auditoria?.detalles).not.toContain('Password-123!');
  });
});
