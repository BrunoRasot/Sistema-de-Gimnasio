import type { Server } from 'node:http';
import app from './app.js';
import { env } from './config/env.js';
import { prisma } from './database/prisma.js';
import { iniciarVerificadorMembresias } from './jobs/verificadorMembresias.js';
import { logger } from './utils/logger.js';

const closeHttpServer = (server: Server) =>
  new Promise<void>((resolve, reject) => {
    server.close((error) => (error ? reject(error) : resolve()));
  });

export const startServer = () => {
  const scheduledTask = iniciarVerificadorMembresias();
  const server = app.listen(env.PORT, () => {
    logger.info(`Servidor escuchando en el puerto ${env.PORT}`);
  });
  server.requestTimeout = 30_000;
  server.headersTimeout = 15_000;
  server.keepAliveTimeout = 5_000;
  server.maxRequestsPerSocket = 1_000;

  let shuttingDown = false;
  const shutdown = async (signal: NodeJS.Signals) => {
    if (shuttingDown) return;
    shuttingDown = true;
    logger.info(`Señal ${signal} recibida; iniciando apagado controlado`);
    scheduledTask.stop();
    const forceClose = setTimeout(() => server.closeAllConnections(), 10_000);
    forceClose.unref();
    await closeHttpServer(server);
    clearTimeout(forceClose);
    await prisma.$disconnect();
    logger.info('Servidor detenido correctamente');
  };

  process.once('SIGTERM', () => void shutdown('SIGTERM'));
  process.once('SIGINT', () => void shutdown('SIGINT'));

  return { server, scheduledTask, shutdown };
};
