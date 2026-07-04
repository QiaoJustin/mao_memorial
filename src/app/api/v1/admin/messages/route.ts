import { prisma } from '@/lib/db';
import { verifyToken, hasRole } from '@/lib/auth';
import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  const token = request.headers.get('Authorization')?.replace('Bearer ', '');
  const payload = verifyToken(token || '');
  
  if (!payload || !hasRole(payload.role, 'editor')) {
    return NextResponse.json({ code: 401, message: 'Unauthorized' }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const page = parseInt(searchParams.get('page') || '1', 10);
  const pageSize = parseInt(searchParams.get('pageSize') || '20', 10);
  const status = searchParams.get('status');
  const q = searchParams.get('q');

  const where: Record<string, unknown> = { isDeleted: false };
  
  if (status) {
    where.status = status;
  }
  
  if (q) {
    where.OR = [
      { nickname: { contains: q as string } },
      { content: { contains: q as string } },
    ];
  }

  const [list, total] = await Promise.all([
    prisma.message.findMany({
      where,
      include: { reviewer: { select: { id: true, name: true } } },
      orderBy: { createdAt: 'desc' },
      skip: (page - 1) * pageSize,
      take: pageSize,
    }),
    prisma.message.count({ where }),
  ]);

  const formattedList = list.map(item => ({
    ...item,
    id: Number(item.id),
    likeCount: Number(item.likeCount || 0),
    reviewedBy: item.reviewedBy ? Number(item.reviewedBy) : null,
    createdAt: item.createdAt.toISOString().replace('T', ' '),
    updatedAt: item.updatedAt.toISOString().replace('T', ' '),
    reviewer: item.reviewer ? { ...item.reviewer, id: Number(item.reviewer.id) } : null,
  }));

  return NextResponse.json({
    code: 200,
    data: {
      list: formattedList,
      total,
      totalPages: Math.ceil(total / pageSize),
      page,
      pageSize,
    },
  });
}