import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import redis from '@/lib/redis';
import { clearNodeCache } from '@/lib/cache';
import { getClientIp } from '@/lib/get-client-ip';

export const dynamic = 'force-dynamic';

export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = await params;
  const id = parseInt(resolvedParams.id, 10);

  if (isNaN(id)) {
    return NextResponse.json({
      code: 400,
      message: '参数错误：节点ID格式不正确',
      data: null,
      timestamp: Date.now(),
      requestId: `req_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    });
  }

  // P1-9: 使用 getClientIp 工具函数，正确解析 XFF 链中第一个 IP
  const ip = getClientIp(request);
  const viewKey = `view:node:${id}:ip:${ip}`;

  try {
    const hasViewed = await redis.get(viewKey);
    
    if (!hasViewed) {
      await Promise.all([
        prisma.timelineNode.update({
          where: { id },
          data: { viewCount: { increment: 1 } },
        }),
        redis.set(viewKey, '1', 'EX', 3600),
        clearNodeCache(id),
      ]);
    }

    const node = await prisma.timelineNode.findUnique({
      where: { id },
      select: { viewCount: true },
    });

    return NextResponse.json({
      code: 200,
      message: 'success',
      data: {
        viewCount: node?.viewCount || 0,
      },
      timestamp: Date.now(),
      requestId: `req_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    });
  } catch {
    return NextResponse.json({
      code: 200,
      message: 'success',
      data: { viewCount: 0 },
      timestamp: Date.now(),
      requestId: `req_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    });
  }
}