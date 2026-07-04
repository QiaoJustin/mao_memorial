import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { getCache, setCache, getFeaturedCacheKey } from '@/lib/cache';

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  const url = new URL(request.url);
  const limit = Math.min(20, Math.max(1, parseInt(url.searchParams.get('limit') || '5', 10)));

  const cacheKey = getFeaturedCacheKey(limit);
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

  const nodes = await prisma.timelineNode.findMany({
    where: { isPublished: true, isFeatured: true },
    take: limit,
    orderBy: { sortOrder: 'asc' },
    include: {
      era: { select: { name: true } },
      photos: {
        where: { isCover: true },
        select: { thumbnailUrl: true, url: true },
        take: 1,
      },
    },
  });

  const result = nodes.map(node => {
    const coverPhoto = node.photos[0];
    return {
      id: Number(node.id),
      date: node.date,
      title: node.title,
      description: node.description,
      thumbnailUrl: coverPhoto?.thumbnailUrl || coverPhoto?.url || '',
      eraName: node.era?.name || '',
    };
  });

  await setCache(cacheKey, result);

  return NextResponse.json({
    code: 200,
    message: 'success',
    data: result,
    timestamp: Date.now(),
    requestId: `req_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
  });
}