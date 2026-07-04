import { prisma } from '@/lib/db';
import { verifyToken, hasRole } from '@/lib/auth';
import { NextResponse } from 'next/server';

export async function PUT(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = await params;
  const token = request.headers.get('Authorization')?.replace('Bearer ', '');
  const payload = verifyToken(token || '');
  
  if (!payload || !hasRole(payload.role, 'super_admin')) {
    return NextResponse.json({ code: 401, message: 'Unauthorized' }, { status: 401 });
  }

  const body = await request.json();
  const bcrypt = await import('bcryptjs');

  const admin = await prisma.admin.update({
    where: { id: BigInt(resolvedParams.id), isDeleted: false },
    data: {
      passwordHash: await bcrypt.hash(body.password, 10),
      failedLoginCount: 0,
      lockedUntil: null,
      status: 'active',
    },
    select: {
      id: true,
      username: true,
      name: true,
    },
  });

  return NextResponse.json({ code: 200, data: admin });
}