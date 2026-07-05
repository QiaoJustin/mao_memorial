import { prisma } from '@/lib/db';
import { withAuth } from '@/lib/with-auth';
import { serializeSensitiveWord } from '@/lib/serializers';
import { NextResponse } from 'next/server';

export const GET = withAuth(async (request) => {
  const { searchParams } = new URL(request.url);
  const page = parseInt(searchParams.get('page') || '1', 10);
  const pageSize = parseInt(searchParams.get('pageSize') || '50', 10);
  const q = searchParams.get('q') || searchParams.get('keyword');
  const category = searchParams.get('category');

  const where: Record<string, unknown> = { isActive: true };

  if (q) {
    where.word = { contains: q as string };
  }

  if (category) {
    where.category = category;
  }

  const [list, total] = await Promise.all([
    prisma.sensitiveWord.findMany({
      where,
      orderBy: { level: 'desc' },
      skip: (page - 1) * pageSize,
      take: pageSize,
    }),
    prisma.sensitiveWord.count({ where }),
  ]);

  return NextResponse.json({
    code: 200,
    data: {
      list: list.map((w) => serializeSensitiveWord(w as unknown as Record<string, unknown>)),
      total: Number(total),
      totalPages: Math.ceil(Number(total) / pageSize),
      page,
      pageSize,
    },
  });
}, 'editor');

export const POST = withAuth(async (request) => {
  const body = await request.json();

  const existing = await prisma.sensitiveWord.findUnique({ where: { word: body.word } });
  if (existing) {
    return NextResponse.json({ code: 400, message: 'Word already exists' }, { status: 400 });
  }

  const word = await prisma.sensitiveWord.create({
    data: {
      word: body.word,
      level: body.level || 1,
      category: body.category,
      replacement: body.replacement || '*',
    },
  });

  return NextResponse.json(
    { code: 200, data: serializeSensitiveWord(word as unknown as Record<string, unknown>) },
    { status: 201 }
  );
}, 'admin');
