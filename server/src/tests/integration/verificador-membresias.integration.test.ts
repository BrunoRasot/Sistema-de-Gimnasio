import { afterAll, describe, expect, it } from 'vitest';
import { prisma } from '../../database/prisma.js';
import { verificarMembresiasVencidas } from '../../jobs/verificadorMembresias.js';

describe('Integración: job de vencimiento de membresías', () => {
  let miembroId: number;
  let planId: number;
  const suffix = `${Date.now()}-${Math.random().toString(16).slice(2)}`;

  afterAll(async () => {
    if (miembroId) await prisma.membresia.deleteMany({ where: { miembroId } });
    if (miembroId) await prisma.miembro.deleteMany({ where: { id: miembroId } });
    if (planId) await prisma.plan.deleteMany({ where: { id: planId } });
  });

  it('vence la membresía e inactiva al miembro sin otra cobertura', async () => {
    const plan = await prisma.plan.create({
      data: { nombre: `Plan job ${suffix}`, precio: 20, duracionDias: 30 },
    });
    planId = plan.id;
    const miembro = await prisma.miembro.create({
      data: { nombres: 'Job', apellidos: 'Test', dni: `${Date.now()}`.slice(-8) },
    });
    miembroId = miembro.id;
    await prisma.membresia.create({
      data: {
        miembroId,
        planId,
        fechaInicio: new Date('2025-01-01T00:00:00Z'),
        fechaFin: new Date('2025-02-01T00:00:00Z'),
        montoPagado: 20,
      },
    });

    const resultado = await verificarMembresiasVencidas(new Date('2025-03-01T00:00:00Z'));
    const [membresia, miembroActualizado] = await Promise.all([
      prisma.membresia.findFirstOrThrow({ where: { miembroId } }),
      prisma.miembro.findUniqueOrThrow({ where: { id: miembroId } }),
    ]);

    expect(resultado.membresiasVencidas).toBeGreaterThanOrEqual(1);
    expect(membresia.estado).toBe('Vencida');
    expect(miembroActualizado.estado).toBe('Inactivo');
  });
});
