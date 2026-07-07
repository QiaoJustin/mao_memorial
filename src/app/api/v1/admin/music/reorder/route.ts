import { NextRequest } from 'next/server';
import { prisma } from '@/lib/db';
import { successResponse, errorResponse } from '@/lib/api-response';
import { withAuth } from '@/lib/with-auth';
import { deleteCache } from '@/lib/cache';
import { logger } from '@/lib/logger';

export const PUT = withAuth(async (request: NextRequest) => {
  try {
    const body = await request.json();
    const { items } = body as { items: { id: number; sortOrder: number }[] };

    if (!Array.isArray(items) || items.length === 0) {
      return errorResponse('参数错误', 400);
    }

    await prisma.$transaction(
      items.map((item) =>
        prisma.song.update({
          where: { id: BigInt(item.id) },
          data: { sortOrder: item.sortOrder },
        })
      )
    );

    // 清理前台缓存，使排序立即生效
    await deleteCache('music:list');

    return successResponse(null);
  } catch (error) {
    logger.error('Failed to reorder songs', error);
    return errorResponse('排序失败', 500);
  }
}, 'editor');
