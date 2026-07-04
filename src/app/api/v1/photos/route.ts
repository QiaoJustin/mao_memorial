import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { getCache, setCache, getPhotosCacheKey } from '@/lib/cache';

export const dynamic = 'force-dynamic';

interface PhotosQuery {
  page: number;
  pageSize: number;
  era?: string;
  year?: number;
  nodeId?: number;
  sort: string;
}

function parseQueryParams(request: Request): PhotosQuery {
  const url = new URL(request.url);
  return {
    page: parseInt(url.searchParams.get('page') || '1', 10),
    pageSize: parseInt(url.searchParams.get('pageSize') || '24', 10),
    era: url.searchParams.get('era') || undefined,
    year: url.searchParams.get('year') ? parseInt(url.searchParams.get('year')!, 10) : undefined,
    nodeId: url.searchParams.get('nodeId') ? parseInt(url.searchParams.get('nodeId')!, 10) : undefined,
    sort: url.searchParams.get('sort') || 'dateSort',
  };
}

export async function GET(request: Request) {
  const { page, pageSize, era, year, nodeId, sort } = parseQueryParams(request);
  
  const validPage = Math.max(1, page);
  const validPageSize = Math.min(100, Math.max(1, pageSize));
  const skip = (validPage - 1) * validPageSize;

  const cacheKey = getPhotosCacheKey(validPage, validPageSize, era, year);
  const cached = await getCache(cacheKey);

  if (cached && !nodeId && cached.items && cached.items.length > 0) {
    return NextResponse.json({
      code: 200,
      message: 'success',
      data: cached,
      timestamp: Date.now(),
      requestId: `req_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    });
  }

  const where: Record<string, unknown> = {};

  if (nodeId) {
    where.nodeId = nodeId;
  }

  let eraId: string | undefined;
  if (era) {
    const eraRecord = await prisma.era.findFirst({
      where: { name: era },
      select: { id: true },
    });
    eraId = eraRecord?.id;
  }

  if (eraId) {
    where.node = { eraId };
  }

  if (year) {
    where.node = { ...where.node as Record<string, unknown>, year };
  }

  const orderBy = sort === 'dateSort' 
    ? { node: { dateSort: 'asc' } }
    : { [sort]: 'asc' };

  const [photos, total] = await Promise.all([
    prisma.photo.findMany({
      where,
      skip,
      take: validPageSize,
      orderBy,
      include: {
        node: {
          select: {
            title: true,
            date: true,
            eraId: true,
            dateSort: true,
          },
        },
      },
    }),
    prisma.photo.count({ where }),
  ]);

  const eraMap = await prisma.era.findMany({
    select: { id: true, name: true },
  });
  const eraNameMap = new Map(eraMap.map(e => [e.id, e.name]));

  const items = photos.map(photo => ({
    id: Number(photo.id),
    nodeId: photo.nodeId ? Number(photo.nodeId) : null,
    nodeTitle: photo.node?.title || '',
    nodeDate: photo.node?.date || '',
    url: photo.url,
    thumbnailUrl: photo.thumbnailUrl,
    caption: photo.caption || '',
    eraId: photo.node?.eraId || '',
    eraName: eraNameMap.get(photo.node?.eraId || '') || '',
    width: Number(photo.width || 0),
    height: Number(photo.height || 0),
  }));

  const result = {
    items,
    total,
    page: validPage,
    pageSize: validPageSize,
    totalPages: Math.ceil(total / validPageSize),
  };

  if (!nodeId) {
    await setCache(cacheKey, result);
  }

  return NextResponse.json({
    code: 200,
    message: 'success',
    data: result,
    timestamp: Date.now(),
    requestId: `req_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
  });
}