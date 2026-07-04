import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { filterSensitiveWords } from '@/lib/sensitive';
import { checkMessageRateLimit } from '@/lib/rate-limit';

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  const url = new URL(request.url);
  const page = Math.max(1, parseInt(url.searchParams.get('page') || '1', 10));
  const pageSize = Math.min(50, Math.max(1, parseInt(url.searchParams.get('pageSize') || '20', 10)));
  const skip = (page - 1) * pageSize;

  const [messages, total] = await Promise.all([
    prisma.message.findMany({
      where: { status: 'approved' },
      skip,
      take: pageSize,
      orderBy: [
        { isPinned: 'desc' },
        { createdAt: 'desc' },
      ],
      select: {
        id: true,
        nickname: true,
        content: true,
        likeCount: true,
        isPinned: true,
        createdAt: true,
      },
    }),
    prisma.message.count({ where: { status: 'approved' } }),
  ]);

  const items = messages.map(msg => ({
    id: Number(msg.id),
    nickname: msg.nickname,
    content: msg.content,
    likeCount: Number(msg.likeCount || 0),
    isPinned: msg.isPinned,
    createdAt: msg.createdAt.toISOString().replace('T', ' '),
  }));

  return NextResponse.json({
    code: 200,
    message: 'success',
    data: {
      items,
      total,
      page,
      pageSize,
      totalPages: Math.ceil(total / pageSize),
    },
    timestamp: Date.now(),
    requestId: `req_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
  });
}

export async function POST(request: Request) {
  const ip = request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || 'unknown';

  const rateLimitResult = await checkMessageRateLimit(ip);
  if (!rateLimitResult.allowed) {
    return NextResponse.json({
      code: 429,
      message: '操作过于频繁，请1小时后再试',
      data: null,
      timestamp: Date.now(),
      requestId: `req_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    });
  }

  let body;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({
      code: 400,
      message: '参数错误：请求体格式不正确',
      data: null,
      timestamp: Date.now(),
      requestId: `req_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    });
  }

  const { nickname = '匿名网友', content } = body;

  if (!content || content.trim().length === 0) {
    return NextResponse.json({
      code: 400,
      message: '参数错误：留言内容不能为空',
      data: null,
      timestamp: Date.now(),
      requestId: `req_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    });
  }

  if (content.length > 200) {
    return NextResponse.json({
      code: 400,
      message: '参数错误：留言内容最长200字',
      data: null,
      timestamp: Date.now(),
      requestId: `req_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    });
  }

  if (nickname.length > 20) {
    return NextResponse.json({
      code: 400,
      message: '参数错误：昵称最长20字',
      data: null,
      timestamp: Date.now(),
      requestId: `req_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    });
  }

  const filterResult = await filterSensitiveWords(content);

  if (filterResult.blocked) {
    return NextResponse.json({
      code: 422,
      message: '留言内容包含不当信息',
      data: null,
      timestamp: Date.now(),
      requestId: `req_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    });
  }

  const message = await prisma.message.create({
    data: {
      nickname: nickname.trim() || '匿名网友',
      content: filterResult.filtered,
      ipAddress: ip,
      status: 'pending',
    },
  });

  return NextResponse.json({
    code: 201,
    message: '留言已提交，审核通过后将展示',
    data: {
      id: Number(message.id),
      status: message.status,
    },
    timestamp: Date.now(),
    requestId: `req_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
  });
}