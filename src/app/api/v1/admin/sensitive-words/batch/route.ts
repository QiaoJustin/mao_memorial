import { prisma } from '@/lib/db';
import { verifyToken, hasRole } from '@/lib/auth';
import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  const token = request.headers.get('Authorization')?.replace('Bearer ', '');
  const payload = verifyToken(token || '');
  
  if (!payload || !hasRole(payload.role, 'admin')) {
    return NextResponse.json({ code: 401, message: 'Unauthorized' }, { status: 401 });
  }

  const body = await request.json();
  const { words } = body;

  if (!words || !Array.isArray(words)) {
    return NextResponse.json({ code: 400, message: 'Missing words array' }, { status: 400 });
  }

  const created: Record<string, unknown>[] = [];
  const skipped: string[] = [];

  for (const word of words) {
    const existing = await prisma.sensitiveWord.findUnique({ where: { word } });
    if (existing) {
      skipped.push(word);
      continue;
    }
    const createdWord = await prisma.sensitiveWord.create({
      data: { word, level: 1, replacement: '*' },
    });
    created.push(createdWord);
  }

  return NextResponse.json({
    code: 200,
    data: { created, skipped },
  });
}