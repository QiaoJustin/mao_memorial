import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

export const dynamic = 'force-dynamic';

// P1-11: 转义正则特殊字符，防止用户输入导致正则注入或灾难性回溯
function escapeRegExp(str: string): string {
  return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

export async function GET(request: Request) {
  const url = new URL(request.url);
  const q = url.searchParams.get('q') || '';
  const page = Math.max(1, parseInt(url.searchParams.get('page') || '1', 10));
  const pageSize = Math.min(50, Math.max(1, parseInt(url.searchParams.get('pageSize') || '20', 10)));
  const skip = (page - 1) * pageSize;

  if (!q || q.length < 2) {
    return NextResponse.json({
      code: 400,
      message: '参数错误：搜索关键词最少2字',
      data: null,
      timestamp: Date.now(),
      requestId: `req_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    });
  }

  const nodes = await prisma.timelineNode.findMany({
    where: {
      isPublished: true,
      OR: [
        { title: { contains: q } },
        { description: { contains: q } },
        { historicalContext: { contains: q } },
      ],
    },
    skip,
    take: pageSize,
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

  const total = await prisma.timelineNode.count({
    where: {
      isPublished: true,
      OR: [
        { title: { contains: q } },
        { description: { contains: q } },
        { historicalContext: { contains: q } },
      ],
    },
  });

  // P1-11: 对用户输入转义后再构造正则，防止正则注入
  const escapedQ = escapeRegExp(q);

  const items = nodes.map(node => {
    const coverPhoto = node.photos[0];
    let description = node.description || '';
    if (description.includes(q)) {
      description = description.replace(new RegExp(escapedQ, 'gi'), match => `<mark>${match}</mark>`);
    }
    return {
      id: Number(node.id),
      date: node.date,
      title: node.title.replace(new RegExp(escapedQ, 'gi'), match => `<mark>${match}</mark>`),
      description,
      thumbnailUrl: coverPhoto?.thumbnailUrl || coverPhoto?.url || '',
      eraName: node.era?.name || '',
      relevanceScore: calculateRelevanceScore(node, q),
    };
  });

  items.sort((a, b) => b.relevanceScore - a.relevanceScore);

  return NextResponse.json({
    code: 200,
    message: 'success',
    data: {
      items,
      total,
      page,
      pageSize,
      totalPages: Math.ceil(total / pageSize),
      query: q,
    },
    timestamp: Date.now(),
    requestId: `req_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
  });
}

function calculateRelevanceScore(node: { title: string; description: string; historicalContext: string | null }, query: string): number {
  let score = 0;
  const lowerQuery = query.toLowerCase();
  const lowerTitle = node.title.toLowerCase();
  const lowerDesc = node.description.toLowerCase();
  const lowerContext = (node.historicalContext || '').toLowerCase();

  if (lowerTitle.includes(lowerQuery)) {
    score += 3;
    if (lowerTitle.startsWith(lowerQuery)) score += 2;
  }
  if (lowerDesc.includes(lowerQuery)) {
    score += 2;
  }
  if (lowerContext.includes(lowerQuery)) {
    score += 1;
  }

  return score;
}