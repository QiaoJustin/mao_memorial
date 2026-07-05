import { prisma } from '@/lib/db';
import { withAuth } from '@/lib/with-auth';
import { serializeMessage } from '@/lib/serializers';
import { NextResponse } from 'next/server';

export const PATCH = withAuth<{ params: Promise<{ id: string }> }>(
  async (request, ctx) => {
    const { id } = await ctx.params;
    const { user } = ctx;

    let body;
    try {
      body = await request.json();
    } catch {
      return NextResponse.json({ code: 400, message: '请求体格式错误' }, { status: 400 });
    }

    try {
      const existing = await prisma.message.findFirst({
        where: { id: BigInt(id), isDeleted: false },
        select: { id: true },
      });
      if (!existing) {
        return NextResponse.json({ code: 404, message: '留言不存在或已删除' }, { status: 404 });
      }
      const message = await prisma.message.update({
        where: { id: BigInt(id) },
        data: {
          status: 'rejected',
          rejectReason: body.rejectReason || '',
          reviewedBy: BigInt(user.id),
          reviewedAt: new Date(),
        },
        include: { reviewer: { select: { id: true, name: true } } },
      });

      return NextResponse.json({
        code: 200,
        data: serializeMessage(message as unknown as Record<string, unknown>),
      });
    } catch {
      return NextResponse.json({ code: 404, message: '留言不存在或已删除' }, { status: 404 });
    }
  },
  'editor'
);
