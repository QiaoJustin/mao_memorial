import { prisma } from '@/lib/db';
import { withAuth } from '@/lib/with-auth';
import { serializeMessage } from '@/lib/serializers';
import { NextResponse } from 'next/server';

export const PATCH = withAuth<{ params: Promise<{ id: string }> }>(
  async (request, ctx) => {
    const { id } = await ctx.params;
    const { user } = ctx;

    const existing = await prisma.message.findFirst({
      where: { id: BigInt(id), isDeleted: false },
      select: { id: true },
    });
    if (!existing) {
      return NextResponse.json({ code: 404, message: 'Message not found' }, { status: 404 });
    }
    const message = await prisma.message.update({
      where: { id: BigInt(id) },
      data: {
        status: 'approved',
        reviewedBy: BigInt(user.id),
        reviewedAt: new Date(),
      },
      include: { reviewer: { select: { id: true, name: true } } },
    });

    return NextResponse.json({
      code: 200,
      data: serializeMessage(message as unknown as Record<string, unknown>),
    });
  },
  'editor'
);
