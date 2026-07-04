import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

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

  const currentNode = await prisma.timelineNode.findUnique({
    where: { id },
    select: { sortOrder: true, eraId: true },
  });

  if (!currentNode) {
    return NextResponse.json({
      code: 404,
      message: '请求的资源不存在',
      data: null,
      timestamp: Date.now(),
      requestId: `req_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    });
  }

  const [prevNode, nextNode] = await Promise.all([
    prisma.timelineNode.findFirst({
      where: {
        isPublished: true,
        sortOrder: { lt: currentNode.sortOrder },
      },
      orderBy: { sortOrder: 'desc' },
      select: {
        id: true,
        date: true,
        title: true,
        photos: {
          where: { isCover: true },
          select: { thumbnailUrl: true, url: true },
          take: 1,
        },
      },
    }),
    prisma.timelineNode.findFirst({
      where: {
        isPublished: true,
        sortOrder: { gt: currentNode.sortOrder },
      },
      orderBy: { sortOrder: 'asc' },
      select: {
        id: true,
        date: true,
        title: true,
        photos: {
          where: { isCover: true },
          select: { thumbnailUrl: true, url: true },
          take: 1,
        },
      },
    }),
  ]);

  const formatNode = (node: typeof prevNode) => {
    if (!node) return null;
    const coverPhoto = node.photos[0];
    return {
      id: Number(node.id),
      date: node.date,
      title: node.title,
      thumbnailUrl: coverPhoto?.thumbnailUrl || coverPhoto?.url || '',
    };
  };

  return NextResponse.json({
    code: 200,
    message: 'success',
    data: {
      prev: formatNode(prevNode),
      next: formatNode(nextNode),
    },
    timestamp: Date.now(),
    requestId: `req_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
  });
}