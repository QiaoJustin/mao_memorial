import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { getCache, setCache, getSearchSuggestCacheKey, SEARCH_SUGGEST_TTL } from '@/lib/cache';

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  const url = new URL(request.url);
  const q = url.searchParams.get('q') || '';

  if (!q || q.length < 2) {
    return NextResponse.json({
      code: 400,
      message: '参数错误：关键词最少2字',
      data: null,
      timestamp: Date.now(),
      requestId: `req_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    });
  }

  const cacheKey = getSearchSuggestCacheKey(q);
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
    where: {
      isPublished: true,
      OR: [
        { title: { startsWith: q } },
        { title: { contains: q } },
      ],
    },
    take: 8,
    orderBy: { sortOrder: 'asc' },
  });

  const suggestions = nodes.map(node => node.title);

  const result = { suggestions };
  await setCache(cacheKey, result, SEARCH_SUGGEST_TTL);

  return NextResponse.json({
    code: 200,
    message: 'success',
    data: result,
    timestamp: Date.now(),
    requestId: `req_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
  });
}