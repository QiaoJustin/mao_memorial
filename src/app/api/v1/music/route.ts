import { NextRequest } from 'next/server';
import { prisma } from '@/lib/db';
import { successResponse, errorResponse } from '@/lib/api-response';
import { getCache, setCache } from '@/lib/cache';
import { logger } from '@/lib/logger';

const MUSIC_CACHE_KEY = 'music:list';
const MUSIC_CACHE_TTL = 600;

export async function GET(_request: NextRequest) {
  try {
    const cached = await getCache<unknown[]>(MUSIC_CACHE_KEY);
    if (cached) {
      return successResponse(cached);
    }

    const songs = await prisma.song.findMany({
      where: { isActive: true, isDeleted: false },
      orderBy: { sortOrder: 'asc' },
    });

    const result = songs.map((song) => ({
      ...song,
      id: Number(song.id),
    }));

    await setCache(MUSIC_CACHE_KEY, result, MUSIC_CACHE_TTL);

    return successResponse(result);
  } catch (error) {
    logger.error('Failed to fetch music list', error);
    return errorResponse('获取音乐列表失败', 500);
  }
}
