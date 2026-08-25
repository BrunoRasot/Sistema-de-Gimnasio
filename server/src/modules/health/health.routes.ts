import { Router } from 'express';
import { prisma } from '../../database/prisma.js';

const healthRoutes = Router();

healthRoutes.get('/live', (_req, res) => {
  res.status(200).json({ status: 'ok' });
});

healthRoutes.get('/ready', async (_req, res) => {
  try {
    await prisma.$queryRaw`SELECT 1`;
    res.status(200).json({ status: 'ready', database: 'up' });
  } catch {
    res.status(503).json({ status: 'not_ready', database: 'down' });
  }
});

export default healthRoutes;
