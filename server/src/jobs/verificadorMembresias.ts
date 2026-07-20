import cron from 'node-cron';
import { prisma } from '../database/prisma.js';

export const iniciarVerificadorMembresias = () => {
    cron.schedule('1 0 * * *', async () => {
        console.log('⏳ [CRON] Iniciando verificación automática de membresías...');

        try {
            const hoy = new Date();
            const resultado = await prisma.membresia.updateMany({
                where: {
                    fechaFin: { lt: hoy },
                    estado: 'Activa'
                },
                data: {
                    estado: 'Vencida'
                }
            });

            console.log(`[CRON] Verificación completada. ${resultado.count} membresías marcadas como vencidas.`);
        } catch (error) {
            console.error('[CRON] Error crítico al verificar membresías:', error);
        }
    });

    console.log('Tarea programada (Cron Job): Verificador de Membresías [ACTIVO]');
};