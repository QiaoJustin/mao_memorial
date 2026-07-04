import { prisma } from '@/lib/db';
import { verifyToken, hasRole } from '@/lib/auth';
import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  const token = request.headers.get('Authorization')?.replace('Bearer ', '');
  const payload = verifyToken(token || '');
  
  if (!payload || !hasRole(payload.role, 'editor')) {
    return NextResponse.json({ code: 401, message: 'Unauthorized' }, { status: 401 });
  }

  const now = new Date();
  const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

  const [
    totalNodes,
    totalPhotos,
    totalMessages,
    pendingMessages,
    weeklyStats,
    hotNodes,
    eraDistribution,
  ] = await Promise.all([
    prisma.timelineNode.count({ where: { isDeleted: false, isPublished: true } }),
    prisma.photo.count({ where: { isDeleted: false } }),
    prisma.message.count({ where: { isDeleted: false } }),
    prisma.message.count({ where: { isDeleted: false, status: 'pending' } }),
    prisma.accessLog.groupBy({
      by: ['createdAt'],
      where: { createdAt: { gte: thirtyDaysAgo } },
      _count: { id: true },
      orderBy: { createdAt: 'asc' },
    }),
    prisma.timelineNode.findMany({
      where: { isDeleted: false, isPublished: true },
      orderBy: { viewCount: 'desc' },
      take: 10,
      select: { id: true, title: true, viewCount: true, date: true },
    }),
    prisma.timelineNode.groupBy({
      by: ['eraId'],
      where: { isDeleted: false, isPublished: true },
      _count: { id: true },
    }),
  ]);

  const eraNames = await prisma.era.findMany({
    select: { id: true, name: true },
  });
  const eraMap = new Map(eraNames.map((e) => [e.id, e.name]));

  const timelineData = weeklyStats.map((s) => ({
    date: s.createdAt.toISOString().split('T')[0],
    count: s._count.id,
  }));

  const eraData = eraDistribution.map((e) => ({
    era: eraMap.get(e.eraId) || e.eraId,
    count: e._count.id,
  }));

  return NextResponse.json({
    code: 200,
    data: {
      overview: {
        totalNodes,
        totalPhotos,
        totalMessages,
        pendingMessages,
      },
      timeline: timelineData,
      hotNodes,
      eraDistribution: eraData,
    },
  });
}