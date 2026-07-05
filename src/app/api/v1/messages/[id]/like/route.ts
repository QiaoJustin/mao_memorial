import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import redis from '@/lib/redis';
import { getClientIp } from '@/lib/get-client-ip';

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

  const message = await prisma.message.findFirst({
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

  // P1-9: 使用 getClientIp 工具函数，正确解析 XFF 链中第一个 IP
  const ip = getClientIp(request);
  const likeKey = `like:message:${id}:ip:${ip}`;

  try {
    const hasLiked = await redis.get(likeKey);

    if (hasLiked) {
      // P1-6: 已点赞则返回当前状态，不重复递增
      return NextResponse.json({
        code: 200,
        message: 'success',
        data: {
          likeCount: Number(message.likeCount || 0),
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

    // P1-6: 点赞成功，返回最新 likeCount（BigInt 转 Number 避免序列化错误）
    return NextResponse.json({
      code: 200,
      message: 'success',
      data: {
        likeCount: Number(updatedMessage.likeCount || 0),
        liked: true,
      },
      timestamp: Date.now(),
      requestId: `req_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    });
  } catch {
    // P1-6: 异常时返回当前实际状态（已点赞检查失败，按未点赞处理）
    return NextResponse.json({
      code: 200,
      message: 'success',
      data: {
        likeCount: Number(message.likeCount || 0),
        liked: false,
      },
      timestamp: Date.now(),
      requestId: `req_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    });
  }
}