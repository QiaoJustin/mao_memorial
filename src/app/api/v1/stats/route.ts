import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const [nodeCount, photoCount, messageCount] = await Promise.all([
      prisma.timelineNode.count({ where: { isPublished: true, isDeleted: false } }),
      prisma.photo.count({ where: { isDeleted: false } }),
      prisma.message.count({ where: { status: 'approved', isDeleted: false } }),
    ]);

    return NextResponse.json({
      code: 200,
      message: 'success',
      data: {
        nodeCount,
        photoCount,
        messageCount,
      },
      timestamp: Date.now(),
    });
  } catch {
    return NextResponse.json({
      code: 500,
      message: '获取统计数据失败',
      data: null,
      timestamp: Date.now(),
    }, { status: 500 });
  }
}