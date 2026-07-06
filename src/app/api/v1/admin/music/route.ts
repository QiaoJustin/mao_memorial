import { NextRequest } from 'next/server';
import { prisma } from '@/lib/db';
import { successResponse, errorResponse, paginatedResponse } from '@/lib/api-response';
import { withAuth } from '@/lib/with-auth';
import { deleteCache } from '@/lib/cache';
import { logger } from '@/lib/logger';

export const GET = withAuth(async (request: NextRequest) => {
  try {
    const { searchParams } = new URL(request.url);
    const page = Math.max(1, parseInt(searchParams.get('page') || '1', 10));
    const pageSize = Math.min(100, Math.max(1, parseInt(searchParams.get('pageSize') || '20', 10)));
    const search = searchParams.get('search') || '';

    const where: Record<string, unknown> = { isDeleted: false };

    if (search) {
      where.OR = [
        { title: { contains: search } },
        { artist: { contains: search } },
        { album: { contains: search } },
      ];
    }

    const skip = (page - 1) * pageSize;

    const [list, total] = await Promise.all([
      prisma.song.findMany({
        where,
        orderBy: { sortOrder: 'asc' },
        skip,
        take: pageSize,
      }),
      prisma.song.count({ where }),
    ]);

    const formattedList = list.map((song) => ({
      ...song,
      id: Number(song.id),
    }));

    return paginatedResponse(formattedList, total, page, pageSize);
  } catch (error) {
    logger.error('Failed to fetch admin music list', error);
    return errorResponse('获取音乐列表失败', 500);
  }
}, 'editor');

export const POST = withAuth(async (request: NextRequest) => {
  try {
    const body = await request.json();

    if (!body.title || !body.audioUrl) {
      return errorResponse('标题和音频链接为必填项', 400);
    }

    const song = await prisma.song.create({
      data: {
        title: body.title,
        artist: body.artist || null,
        album: body.album || null,
        duration: body.duration || null,
        audioUrl: body.audioUrl,
        coverUrl: body.coverUrl || null,
        sortOrder: body.sortOrder || 0,
      },
    });

    // 新建后清理前台缓存
    await deleteCache('music:list');

    return successResponse(
      { ...song, id: Number(song.id) },
      201
    );
  } catch (error) {
    logger.error('Failed to create song', error);
    return errorResponse('创建歌曲失败', 500);
  }
}, 'editor');
