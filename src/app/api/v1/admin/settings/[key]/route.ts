import { prisma } from '@/lib/db';
import { verifyToken, hasRole } from '@/lib/auth';
import { NextResponse } from 'next/server';

export async function PUT(request: Request, { params }: { params: { key: string } }) {
  const token = request.headers.get('Authorization')?.replace('Bearer ', '');
  const payload = verifyToken(token || '');
  
  if (!payload || !hasRole(payload.role, 'admin')) {
    return NextResponse.json({ code: 401, message: 'Unauthorized' }, { status: 401 });
  }

  const body = await request.json();

  const setting = await prisma.setting.upsert({
    where: { key: params.key },
    update: {
      value: body.value,
      type: body.type || 'string',
      category: body.category || 'general',
      description: body.description,
    },
    create: {
      key: params.key,
      value: body.value,
      type: body.type || 'string',
      category: body.category || 'general',
      description: body.description,
    },
  });

  return NextResponse.json({ code: 200, data: setting });
}