import { Router, Request, Response } from 'express';
import prisma from '../infra/database/prisma.js';

const router = Router();

router.get('/', async (_req: Request, res: Response): Promise<void> => {
  let isDbConnected = false;
  try {
    // Perform low-overhead database ping
    await prisma.$queryRaw`SELECT 1`;
    isDbConnected = true;
  } catch (err: any) {
    isDbConnected = false;
  }

  const statusCode = isDbConnected ? 200 : 503;
  res.status(statusCode).json({
    success: isDbConnected,
    message: isDbConnected ? 'Service is healthy' : 'Service degraded: database unreachable',
    data: {
      status: isDbConnected ? 'UP' : 'DEGRADED',
      environment: process.env.NODE_ENV || 'development',
      uptime: Math.floor(process.uptime()),
      timestamp: new Date().toISOString(),
      database: isDbConnected ? 'connected' : 'disconnected',
    },
  });
});

export default router;

