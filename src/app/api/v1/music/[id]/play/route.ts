import { NextRequest } from 'next/server';
import { prisma } from '@/lib/db';
import { successResponse, errorResponse } from '@/lib/api-response';
import { logger } from '@/lib/logger';

export async function POST(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const songId = BigInt(id);

    const existing = await prisma.song.findFirst({
      where: { id: songId, isDeleted: false },
      select: { id: true },
    });

    if (!existing) {
      return errorResponse('歌曲不存在', 404);
    }

    await prisma.song.update({
      where: { id: songId },
      data: { playCount: { increment: 1 } },
    });

    return successResponse(null);
  } catch (error) {
    logger.error('Failed to update play count', error);
    return errorResponse('更新播放次数失败', 500);
  }
}
