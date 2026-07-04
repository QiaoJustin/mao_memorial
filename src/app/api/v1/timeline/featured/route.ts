import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

export const dynamic = 'force-dynamic';

interface FeaturedQuery {
  limit: number;
}

function parseQueryParams(request: Request): FeaturedQuery {
  const url = new URL(request.url);
  return {
    limit: parseInt(url.searchParams.get('limit') || '6', 10),
  };
}

export async function GET(request: Request) {
  const { limit } = parseQueryParams(request);
  
  const validLimit = Math.min(20, Math.max(1, limit));

  const nodes = await prisma.timelineNode.findMany({
    where: { isPublished: true },
    take: validLimit,
    orderBy: { viewCount: 'desc' },
    include: {
      era: { select: { name: true } },
      photos: {
        where: { isCover: true },
        select: { url: true, thumbnailUrl: true },
        take: 1,
      },
    },
  });

  const items = nodes.map(node => {
    const coverPhoto = node.photos[0];
    return {
      id: Number(node.id),
      date: node.date,
      year: Number(node.year),
      eraName: node.era?.name || '',
      title: node.title,
      description: node.description,
      photoUrl: coverPhoto?.thumbnailUrl || coverPhoto?.url || '',
      viewCount: Number(node.viewCount || 0),
    };
  });

  return NextResponse.json({
    code: 200,
    message: 'success',
    data: items,
    timestamp: Date.now(),
    requestId: `req_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
  });
}