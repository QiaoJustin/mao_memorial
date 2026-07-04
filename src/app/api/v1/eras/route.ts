import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { getCache, setCache, getEraCacheKey, ERA_CACHE_TTL } from '@/lib/cache';

export const dynamic = 'force-dynamic';

export async function GET() {
  const cacheKey = getEraCacheKey();
  const cached = await getCache(cacheKey);

  if (cached) {
    return NextResponse.json({
      code: 200,
      message: 'success',
      data: cached,
      timestamp: Date.now(),
      requestId: `req_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    });
  }

  const eras = await prisma.era.findMany({
    where: { isActive: true },
    orderBy: { sortOrder: 'asc' },
    select: {
      id: true,
      name: true,
      period: true,
      description: true,
      icon: true,
      color: true,
      sortOrder: true,
      nodeCount: true,
    },
  });

  await setCache(cacheKey, eras, ERA_CACHE_TTL);

  return NextResponse.json({
    code: 200,
    message: 'success',
    data: eras,
    timestamp: Date.now(),
    requestId: `req_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
  });
}
