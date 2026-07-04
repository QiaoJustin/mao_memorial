import { prisma } from '@/lib/db';
import { verifyToken, hasRole } from '@/lib/auth';
import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  const token = request.headers.get('Authorization')?.replace('Bearer ', '');
  const payload = verifyToken(token || '');
  
  if (!payload || !hasRole(payload.role, 'editor')) {
    return NextResponse.json({ code: 401, message: 'Unauthorized' }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const days = parseInt(searchParams.get('days') || '30', 10);
  const endDate = new Date();
  const startDate = new Date(endDate.getTime() - days * 24 * 60 * 60 * 1000);

  const [
    pvStats,
    uvStats,
    pageStats,
    refererStats,
  ] = await Promise.all([
    prisma.accessLog.count({ where: { createdAt: { gte: startDate, lte: endDate } } }),
    prisma.accessLog.findMany({
      where: { createdAt: { gte: startDate, lte: endDate } },
      distinct: ['ipAddress'],
    }).then((logs) => logs.length),
    prisma.accessLog.groupBy({
      by: ['path'],
      where: { createdAt: { gte: startDate, lte: endDate } },
      _count: { id: true },
      orderBy: { _count: { id: 'desc' } },
      take: 20,
    }),
    prisma.accessLog.groupBy({
      by: ['referer'],
      where: { createdAt: { gte: startDate, lte: endDate }, referer: { not: null } },
      _count: { id: true },
      orderBy: { _count: { id: 'desc' } },
      take: 10,
    }),
  ]);

  const dailyStats = await prisma.accessLog.groupBy({
    by: ['createdAt'],
    where: { createdAt: { gte: startDate, lte: endDate } },
    _count: { id: true },
    orderBy: { createdAt: 'asc' },
  });

  return NextResponse.json({
    code: 200,
    data: {
      pv: pvStats,
      uv: uvStats,
      dailyStats: dailyStats.map((s) => ({
        date: s.createdAt.toISOString().split('T')[0],
        pv: s._count.id,
      })),
      pageStats: pageStats.map((p) => ({
        path: p.path,
        count: p._count.id,
      })),
      refererStats: refererStats.map((r) => ({
        referer: r.referer || '',
        count: r._count.id,
      })),
    },
  });
}