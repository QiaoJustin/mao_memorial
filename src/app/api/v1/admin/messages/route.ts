import { prisma } from '@/lib/db';
import { withAuth } from '@/lib/with-auth';
import { serializeMessage } from '@/lib/serializers';
import { NextResponse } from 'next/server';

export const GET = withAuth(async (request) => {
  const { searchParams } = new URL(request.url);
  const page = parseInt(searchParams.get('page') || '1', 10);
  const pageSize = parseInt(searchParams.get('pageSize') || '20', 10);
  const status = searchParams.get('status');
  const q = searchParams.get('q') || searchParams.get('keyword');

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

  const formattedList = list.map((item) =>
    serializeMessage(item as unknown as Record<string, unknown>)
  );

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
}, 'editor');
