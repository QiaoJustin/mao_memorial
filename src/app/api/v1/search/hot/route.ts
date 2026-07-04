import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { getCache, setCache, getHotSearchCacheKey, HOT_SEARCH_TTL } from '@/lib/cache';

export const dynamic = 'force-dynamic';

const HOT_KEYWORDS = [
  { keyword: '开国大典', count: 5680 },
  { keyword: '延安', count: 3200 },
  { keyword: '井冈山', count: 2800 },
  { keyword: '长征', count: 2400 },
  { keyword: '毛主席', count: 2100 },
  { keyword: '毛泽东', count: 1800 },
  { keyword: '遵义会议', count: 1500 },
  { keyword: '新中国', count: 1200 },
];

export async function GET(request: Request) {
  const url = new URL(request.url);
  const limit = Math.min(20, Math.max(1, parseInt(url.searchParams.get('limit') || '10', 10)));

  const cacheKey = getHotSearchCacheKey();
  const cached = await getCache<Array<{ keyword: string; count: number }>>(cacheKey);

  if (cached) {
    return NextResponse.json({
      code: 200,
      message: 'success',
      data: cached.slice(0, limit),
      timestamp: Date.now(),
      requestId: `req_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    });
  }

  const topNodes = await prisma.timelineNode.findMany({
    where: { isPublished: true },
    take: 10,
    orderBy: { viewCount: 'desc' },
    select: { title: true, viewCount: true },
  });

  const hotSearches = topNodes.map(node => ({
    keyword: node.title,
    count: node.viewCount || 0,
  }));

  if (hotSearches.length < limit) {
    const remaining = limit - hotSearches.length;
    hotSearches.push(...HOT_KEYWORDS.slice(0, remaining));
  }

  hotSearches.sort((a, b) => b.count - a.count);

  await setCache(cacheKey, hotSearches, HOT_SEARCH_TTL);

  return NextResponse.json({
    code: 200,
    message: 'success',
    data: hotSearches.slice(0, limit),
    timestamp: Date.now(),
    requestId: `req_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
  });
}