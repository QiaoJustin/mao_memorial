import { prisma } from '@/lib/db';
import { verifyToken, hasRole } from '@/lib/auth';
import { NextResponse } from 'next/server';

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = await params;
  const token = request.headers.get('Authorization')?.replace('Bearer ', '');
  const payload = verifyToken(token || '');
  
  if (!payload || !hasRole(payload.role, 'editor')) {
    return NextResponse.json({ code: 401, message: 'Unauthorized' }, { status: 401 });
  }

  const message = await prisma.message.update({
    where: { id: BigInt(resolvedParams.id), isDeleted: false },
    data: {
      status: 'approved',
      reviewedBy: BigInt(payload.id),
      reviewedAt: new Date(),
    },
    include: { reviewer: { select: { id: true, name: true } } },
  });

  return NextResponse.json({ code: 200, data: message });
}