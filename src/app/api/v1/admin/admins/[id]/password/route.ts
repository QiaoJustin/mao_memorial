import { prisma } from '@/lib/db';
import { withAuth } from '@/lib/with-auth';
import { serializeAdmin } from '@/lib/serializers';
import { NextResponse } from 'next/server';

export const PUT = withAuth<{ params: Promise<{ id: string }> }>(
  async (request, ctx) => {
    const { id } = await ctx.params;
    const body = await request.json();
    const bcrypt = await import('bcryptjs');

    const existing = await prisma.admin.findFirst({
      where: { id: BigInt(id), isDeleted: false },
      select: { id: true },
    });
    if (!existing) {
      return NextResponse.json({ code: 404, message: 'Admin not found' }, { status: 404 });
    }
    const admin = await prisma.admin.update({
      where: { id: BigInt(id) },
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

    return NextResponse.json({
      code: 200,
      data: serializeAdmin(admin as unknown as Record<string, unknown>),
    });
  },
  'super_admin'
);
