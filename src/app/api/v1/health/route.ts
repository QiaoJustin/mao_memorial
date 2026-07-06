import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import redis from '@/lib/redis';

export const dynamic = 'force-dynamic';

export async function GET() {
  const startTime = Date.now();
  const uptime = Math.floor(process.uptime());

  let dbStatus = 'disconnected';
  let redisStatus = 'disconnected';

  try {
    await prisma.$queryRaw`SELECT 1`;
    dbStatus = 'connected';
  } catch {
    dbStatus = 'error';
  }

  try {
    await redis.ping();
    redisStatus = 'connected';
  } catch {
    redisStatus = 'error';
  }

  return NextResponse.json({
    code: 200,
    message: 'success',
    data: {
      status: 'healthy',
      version: '1.0.0',
      uptime,
      database: dbStatus,
      redis: redisStatus,
      responseTime: Date.now() - startTime,
    },
    timestamp: Date.now(),
    requestId: `req_${Date.now()}_${Math.random().toString(36).slice(2, 11)}`,
  });
}
