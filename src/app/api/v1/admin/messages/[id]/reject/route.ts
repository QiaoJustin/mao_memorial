import { prisma } from '@/lib/db';
import { verifyToken, hasRole } from '@/lib/auth';
import { NextResponse } from 'next/server';

export async function PATCH(request: Request, { params }: { params: { id: string } }) {
  const token = request.headers.get('Authorization')?.replace('Bearer ', '');
  const payload = verifyToken(token || '');
  
  if (!payload || !hasRole(payload.role, 'editor')) {
    return NextResponse.json({ code: 401, message: 'Unauthorized' }, { status: 401 });
  }

  const body = await request.json();

  const message = await prisma.message.update({
    where: { id: BigInt(params.id), isDeleted: false },
    data: {
      status: 'rejected',
      rejectReason: body.rejectReason || '',
      reviewedBy: BigInt(payload.id),
      reviewedAt: new Date(),
    },
    include: { reviewer: { select: { id: true, name: true } } },
  });

  return NextResponse.json({ code: 200, data: message });
}