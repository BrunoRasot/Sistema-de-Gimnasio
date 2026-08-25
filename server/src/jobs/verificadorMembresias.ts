import cron from 'node-cron';
import { prisma } from '../database/prisma.js';
import { logger } from '../utils/logger.js';

export const verificarMembresiasVencidas = async (hoy = new Date()) => {
  return prisma.$transaction(async (tx) => {
    const vencidas = await tx.membresia.updateMany({
      where: { fechaFin: { lt: hoy }, estado: 'Activa' },
      data: { estado: 'Vencida' },
    });
    const miembrosSinMembresia = await tx.miembro.findMany({
      where: {
        estado: 'Activo',
        membresias: { none: { estado: 'Activa', fechaFin: { gte: hoy } } },
      },
      select: { id: true },
    });
    if (miembrosSinMembresia.length > 0) {
      await tx.miembro.updateMany({
        where: { id: { in: miembrosSinMembresia.map((miembro) => miembro.id) } },
        data: { estado: 'Inactivo' },
      });
    }
    return { membresiasVencidas: vencidas.count, miembrosInactivados: miembrosSinMembresia.length };
  });
};

export const iniciarVerificadorMembresias = () => {
  const tarea = cron.schedule('1 0 * * *', async () => {
    logger.info('[CRON] Iniciando verificación automática de membresías');
    try {
      const resultado = await verificarMembresiasVencidas();
      logger.info(
        `[CRON] Verificación completada. ${resultado.membresiasVencidas} membresías marcadas como vencidas.`,
      );
    } catch (error) {
      logger.error(`[CRON] Error crítico al verificar membresías: ${error}`);
    }
  });

  logger.info('Tarea programada: verificador de membresías activo');
  return tarea;
};
