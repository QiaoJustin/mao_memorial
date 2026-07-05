import { prisma } from '@/lib/db';
import { withAuth } from '@/lib/with-auth';
import { NextResponse } from 'next/server';

export const POST = withAuth(async (request, ctx) => {
  const body = await request.json();
  const { ids, action, rejectReason } = body;

  if (!ids || !Array.isArray(ids) || ids.length === 0) {
    return NextResponse.json({ code: 400, message: '请选择要操作的留言' }, { status: 400 });
  }

  const bigIntIds = ids.map((id: number) => BigInt(id));

  try {
    if (action === 'approve') {
      await prisma.message.updateMany({
        where: {
          id: { in: bigIntIds },
          isDeleted: false,
          status: 'pending',
        },
        data: {
          status: 'approved',
          reviewedAt: new Date(),
          reviewedBy: ctx.user?.id ? BigInt(ctx.user.id) : undefined,
        },
      });
    } else if (action === 'reject') {
      await prisma.message.updateMany({
        where: {
          id: { in: bigIntIds },
          isDeleted: false,
          status: 'pending',
        },
        data: {
          status: 'rejected',
          rejectReason: rejectReason || '',
          reviewedAt: new Date(),
          reviewedBy: ctx.user?.id ? BigInt(ctx.user.id) : undefined,
        },
      });
    } else if (action === 'delete') {
      await prisma.message.updateMany({
        where: {
          id: { in: bigIntIds },
          isDeleted: false,
        },
        data: {
          isDeleted: true,
        },
      });
    } else {
      return NextResponse.json({ code: 400, message: '无效的操作类型' }, { status: 400 });
    }

    return NextResponse.json({
      code: 200,
      message: '批量操作成功',
    });
  } catch (error) {
    return NextResponse.json({ code: 500, message: '批量操作失败' }, { status: 500 });
  }
}, 'editor');