import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { getCache, setCache, getTimelineCacheKey, TIMELINE_CACHE_TTL } from '@/lib/cache';

export const dynamic = 'force-dynamic';

interface TimelineQuery {
  page: number;
  pageSize: number;
  era?: string;
  year?: number;
  featured?: boolean;
}

function parseQueryParams(request: Request): TimelineQuery {
  const url = new URL(request.url);
  return {
    page: parseInt(url.searchParams.get('page') || '1', 10),
    pageSize: parseInt(url.searchParams.get('pageSize') || '10', 10),
    era: url.searchParams.get('era') || undefined,
    year: url.searchParams.get('year') ? parseInt(url.searchParams.get('year')!, 10) : undefined,
    featured: url.searchParams.get('featured') === 'true',
  };
}

export async function GET(request: Request) {
  const { page, pageSize, era, year, featured } = parseQueryParams(request);
  
  const validPage = Math.max(1, page);
  const validPageSize = Math.min(50, Math.max(1, pageSize));
  const skip = (validPage - 1) * validPageSize;

  const cacheKey = getTimelineCacheKey(validPage, validPageSize, era, year);
  const cached = await getCache(cacheKey);

  if (cached && !featured) {
    return NextResponse.json({
      code: 200,
      message: 'success',
      data: cached,
      timestamp: Date.now(),
      requestId: `req_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    });
  }

  const where: Record<string, unknown> = {
    isPublished: true,
  };

  if (era) {
    const eraRecord = await prisma.era.findFirst({
      where: { name: era },
      select: { id: true },
    });
    if (eraRecord?.id) {
      where.eraId = eraRecord.id;
    }
  }

  if (year) {
    where.year = year;
  }

  if (featured) {
    where.isFeatured = true;
  }

  const [nodes, total] = await Promise.all([
    prisma.timelineNode.findMany({
      where,
      skip,
      take: validPageSize,
      orderBy: { sortOrder: 'asc' },
      include: {
        era: { select: { name: true } },
        photos: {
          where: { isCover: true },
          select: { url: true, thumbnailUrl: true },
          take: 1,
        },
      },
    }),
    prisma.timelineNode.count({ where }),
  ]);

  const items = nodes.map(node => {
    const coverPhoto = node.photos[0];
    return {
      id: Number(node.id),
      date: node.date,
      dateSort: node.dateSort.toISOString(),
      year: Number(node.year),
      eraId: node.eraId,
      eraName: node.era?.name || '',
      title: node.title,
      description: node.description,
      thumbnailUrl: coverPhoto?.thumbnailUrl || coverPhoto?.url || '',
      photoCount: Number(node.photoCount || 0),
      viewCount: Number(node.viewCount || 0),
      sortOrder: Number(node.sortOrder),
      isFeatured: node.isFeatured,
    };
  });

  const result = {
    items,
    total,
    page: validPage,
    pageSize: validPageSize,
    totalPages: Math.ceil(total / validPageSize),
  };

  if (!featured) {
    await setCache(cacheKey, result, TIMELINE_CACHE_TTL);
  }

  return NextResponse.json({
    code: 200,
    message: 'success',
    data: result,
    timestamp: Date.now(),
    requestId: `req_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
  });
}