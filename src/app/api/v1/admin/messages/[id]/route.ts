import { prisma } from '@/lib/db';
import { withAuth } from '@/lib/with-auth';
import { serializeMessage } from '@/lib/serializers';
import { NextResponse } from 'next/server';

export const GET = withAuth<{ params: Promise<{ id: string }> }>(
  async (request, ctx) => {
    const { id } = await ctx.params;

    const message = await prisma.message.findUnique({
      where: { id: BigInt(id), isDeleted: false },
      include: { reviewer: { select: { id: true, name: true } } },
    });

    if (!message) {
      return NextResponse.json({ code: 404, message: 'Message not found' }, { status: 404 });
    }

    return NextResponse.json({
      code: 200,
      data: serializeMessage(message as unknown as Record<string, unknown>),
    });
  },
  'editor'
);

export const DELETE = withAuth<{ params: Promise<{ id: string }> }>(
  async (request, ctx) => {
    const { id } = await ctx.params;

    const existing = await prisma.message.findFirst({
      where: { id: BigInt(id), isDeleted: false },
      select: { id: true },
    });
    if (!existing) {
      return NextResponse.json({ code: 404, message: 'Message not found' }, { status: 404 });
    }
    const message = await prisma.message.update({
      where: { id: BigInt(id) },
      data: { isDeleted: true },
    });

    return NextResponse.json({
      code: 200,
      data: serializeMessage(message as unknown as Record<string, unknown>),
    });
  },
  'admin'
);
