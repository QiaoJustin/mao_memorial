import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { getCache, setCache, getNodeCacheKey } from '@/lib/cache';

export const dynamic = 'force-dynamic';

export async function GET(request: Request, { params }: { params: { id: string } }) {
  const id = parseInt(params.id, 10);

  if (isNaN(id)) {
    return NextResponse.json({
      code: 400,
      message: '参数错误：节点ID格式不正确',
      data: null,
      timestamp: Date.now(),
      requestId: `req_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    });
  }

  const cacheKey = getNodeCacheKey(id);
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

  const node = await prisma.timelineNode.findUnique({
    where: { id, isPublished: true },
    include: {
      era: { select: { name: true } },
      photos: {
        select: {
          id: true,
          url: true,
          thumbnailUrl: true,
          caption: true,
          sortOrder: true,
          isCover: true,
        },
        orderBy: { sortOrder: 'asc' },
      },
      tags: {
        include: {
          tag: {
            select: {
              id: true,
              name: true,
              slug: true,
            },
          },
        },
      },
    },
  });

  if (!node) {
    return NextResponse.json({
      code: 404,
      message: '请求的资源不存在',
      data: null,
      timestamp: Date.now(),
      requestId: `req_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    });
  }

  const coverPhoto = node.photos.find(p => p.isCover) || node.photos[0];

  const result = {
    id: Number(node.id),
    date: node.date,
    dateSort: node.dateSort.toISOString(),
    year: Number(node.year),
    eraId: node.eraId,
    eraName: node.era?.name || '',
    title: node.title,
    description: node.description,
    historicalContext: node.historicalContext || '',
    thumbnailUrl: coverPhoto?.thumbnailUrl || coverPhoto?.url || '',
    photoCount: Number(node.photoCount || 0),
    viewCount: Number(node.viewCount || 0),
    likeCount: Number(node.likeCount || 0),
    sortOrder: Number(node.sortOrder),
    isFeatured: node.isFeatured,
    tags: node.tags.map(nt => ({
      id: Number(nt.tag.id),
      name: nt.tag.name,
      slug: nt.tag.slug,
    })),
    photos: node.photos.map(photo => ({
      id: Number(photo.id),
      url: photo.url,
      thumbnailUrl: photo.thumbnailUrl,
      caption: photo.caption,
      sortOrder: photo.sortOrder,
      isCover: photo.isCover,
    })),
    seoTitle: node.seoTitle || '',
    seoDescription: node.seoDescription || '',
    createdAt: node.createdAt.toISOString().replace('T', ' '),
    updatedAt: node.updatedAt.toISOString().replace('T', ' '),
  };

  await setCache(cacheKey, result);

  return NextResponse.json({
    code: 200,
    message: 'success',
    data: result,
    timestamp: Date.now(),
    requestId: `req_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
  });
}