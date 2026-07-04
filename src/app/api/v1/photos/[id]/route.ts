import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

export const dynamic = 'force-dynamic';

export async function GET(request: Request, { params }: { params: { id: string } }) {
  const id = parseInt(params.id, 10);

  if (isNaN(id)) {
    return NextResponse.json({
      code: 400,
      message: '参数错误：照片ID格式不正确',
      data: null,
      timestamp: Date.now(),
      requestId: `req_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    });
  }

  const photo = await prisma.photo.findUnique({
    where: { id },
    include: {
      node: {
        select: {
          id: true,
          date: true,
          title: true,
          eraId: true,
        },
      },
    },
  });

  if (!photo) {
    return NextResponse.json({
      code: 404,
      message: '请求的资源不存在',
      data: null,
      timestamp: Date.now(),
      requestId: `req_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    });
  }

  const era = await prisma.era.findUnique({
    where: { id: photo.node?.eraId || '' },
    select: { name: true },
  });

  const result = {
    id: Number(photo.id),
    nodeId: photo.nodeId ? Number(photo.nodeId) : null,
    node: photo.node ? {
      id: Number(photo.node.id),
      date: photo.node.date,
      title: photo.node.title,
      eraName: era?.name || '',
    } : null,
    url: photo.url,
    thumbnailUrl: photo.thumbnailUrl,
    mediumUrl: photo.mediumUrl || photo.url,
    largeUrl: photo.largeUrl || photo.url,
    caption: photo.caption || '',
    altText: photo.altText || '',
    width: photo.width || 0,
    height: photo.height || 0,
    fileSize: photo.fileSize || 0,
    sortOrder: photo.sortOrder,
    isCover: photo.isCover,
  };

  return NextResponse.json({
    code: 200,
    message: 'success',
    data: result,
    timestamp: Date.now(),
    requestId: `req_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
  });
}