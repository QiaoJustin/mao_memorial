import { prisma } from '@/lib/db';
import { withAuth } from '@/lib/with-auth';
import { serializeSensitiveWord } from '@/lib/serializers';
import { NextResponse } from 'next/server';

export const POST = withAuth(async (request) => {
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
    created.push(serializeSensitiveWord(createdWord as unknown as Record<string, unknown>));
  }

  return NextResponse.json({
    code: 200,
    data: { created, skipped },
  });
}, 'admin');
