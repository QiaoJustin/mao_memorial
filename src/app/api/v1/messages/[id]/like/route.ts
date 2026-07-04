import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import redis from '@/lib/redis';

export const dynamic = 'force-dynamic';

export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = await params;
  const id = parseInt(resolvedParams.id, 10);

  if (isNaN(id)) {
    return NextResponse.json({
      code: 400,
      message: '参数错误：留言ID格式不正确',
      data: null,
      timestamp: Date.now(),
      requestId: `req_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    });
  }

  const message = await prisma.message.findUnique({
    where: { id, status: 'approved' },
    select: { id: true, likeCount: true },
  });

  if (!message) {
    return NextResponse.json({
      code: 404,
      message: '请求的资源不存在',
      data: null,
      timestamp: Date.now(),
      requestId: `req_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    });
  }

  const ip = request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || 'unknown';
  const likeKey = `like:message:${id}:ip:${ip}`;

  try {
    const hasLiked = await redis.get(likeKey);
    
    if (hasLiked) {
      return NextResponse.json({
        code: 200,
        message: 'success',
        data: {
          likeCount: message.likeCount || 0,
          liked: true,
        },
        timestamp: Date.now(),
        requestId: `req_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      });
    }

    const updatedMessage = await prisma.message.update({
      where: { id },
      data: { likeCount: { increment: 1 } },
      select: { likeCount: true },
    });

    await redis.set(likeKey, '1', 'EX', 86400);

    return NextResponse.json({
      code: 200,
      message: 'success',
      data: {
        likeCount: updatedMessage.likeCount || 0,
        liked: true,
      },
      timestamp: Date.now(),
      requestId: `req_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    });
  } catch {
    return NextResponse.json({
      code: 200,
      message: 'success',
      data: {
        likeCount: message.likeCount || 0,
        liked: false,
      },
      timestamp: Date.now(),
      requestId: `req_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    });
  }
}