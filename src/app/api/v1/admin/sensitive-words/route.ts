import { prisma } from '@/lib/db';
import { verifyToken, hasRole } from '@/lib/auth';
import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  const token = request.headers.get('Authorization')?.replace('Bearer ', '');
  const payload = verifyToken(token || '');
  
  if (!payload || !hasRole(payload.role, 'admin')) {
    return NextResponse.json({ code: 401, message: 'Unauthorized' }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const page = parseInt(searchParams.get('page') || '1', 10);
  const pageSize = parseInt(searchParams.get('pageSize') || '50', 10);
  const q = searchParams.get('q');
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
      list,
      total,
      totalPages: Math.ceil(total / pageSize),
      page,
      pageSize,
    },
  });
}

export async function POST(request: Request) {
  const token = request.headers.get('Authorization')?.replace('Bearer ', '');
  const payload = verifyToken(token || '');
  
  if (!payload || !hasRole(payload.role, 'admin')) {
    return NextResponse.json({ code: 401, message: 'Unauthorized' }, { status: 401 });
  }

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

  return NextResponse.json({ code: 200, data: word }, { status: 201 });
}