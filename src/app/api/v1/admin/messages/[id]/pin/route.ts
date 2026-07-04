import { prisma } from '@/lib/db';
import { verifyToken, hasRole } from '@/lib/auth';
import { NextResponse } from 'next/server';

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = await params;
  const token = request.headers.get('Authorization')?.replace('Bearer ', '');
  const payload = verifyToken(token || '');
  
  if (!payload || !hasRole(payload.role, 'admin')) {
    return NextResponse.json({ code: 401, message: 'Unauthorized' }, { status: 401 });
  }

  const body = await request.json();

  const message = await prisma.message.update({
    where: { id: BigInt(resolvedParams.id), isDeleted: false },
    data: {
      isPinned: body.isPinned ?? true,
    },
  });

  return NextResponse.json({ code: 200, data: message });
}