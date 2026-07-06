import { NextRequest } from 'next/server';
import { prisma } from '@/lib/db';
import { successResponse, errorResponse } from '@/lib/api-response';
import { withAuth } from '@/lib/with-auth';
import { deleteCache } from '@/lib/cache';
import { unlink } from 'fs/promises';
import { join } from 'path';
import { logger } from '@/lib/logger';

export const GET = withAuth<{ params: Promise<{ id: string }> }>(
  async (_request: NextRequest, ctx) => {
    try {
      const { id } = await ctx.params;
      const songId = BigInt(id);

      const song = await prisma.song.findFirst({
        where: { id: songId, isDeleted: false },
      });

      if (!song) {
        return errorResponse('歌曲不存在', 404);
      }

      return successResponse({ ...song, id: Number(song.id) });
    } catch (error) {
      logger.error('Failed to fetch song', error);
      return errorResponse('获取歌曲详情失败', 500);
    }
  },
  'editor'
);

export const PUT = withAuth<{ params: Promise<{ id: string }> }>(
  async (request: NextRequest, ctx) => {
    try {
      const { id } = await ctx.params;
      const songId = BigInt(id);

      const existing = await prisma.song.findFirst({
        where: { id: songId, isDeleted: false },
        select: { id: true },
      });

      if (!existing) {
        return errorResponse('歌曲不存在', 404);
      }

      const body = await request.json();

      const song = await prisma.song.update({
        where: { id: songId },
        data: {
          ...(body.title !== undefined && { title: body.title }),
          ...(body.artist !== undefined && { artist: body.artist }),
          ...(body.album !== undefined && { album: body.album }),
          ...(body.duration !== undefined && { duration: body.duration }),
          ...(body.audioUrl !== undefined && { audioUrl: body.audioUrl }),
          ...(body.coverUrl !== undefined && { coverUrl: body.coverUrl }),
          ...(body.sortOrder !== undefined && { sortOrder: body.sortOrder }),
          ...(body.isActive !== undefined && { isActive: body.isActive }),
        },
      });

      // 更新后清理前台缓存
      await deleteCache('music:list');

      return successResponse({ ...song, id: Number(song.id) });
    } catch (error) {
      logger.error('Failed to update song', error);
      return errorResponse('更新歌曲失败', 500);
    }
  },
  'editor'
);

export const DELETE = withAuth<{ params: Promise<{ id: string }> }>(
  async (_request: NextRequest, ctx) => {
    try {
      const { id } = await ctx.params;
      const songId = BigInt(id);

      // 查出完整记录，包括文件路径
      const song = await prisma.song.findFirst({
        where: { id: songId, isDeleted: false },
        select: { id: true, audioUrl: true, coverUrl: true },
      });

      if (!song) {
        return errorResponse('歌曲不存在', 404);
      }

      // 硬删除数据库记录
      await prisma.song.delete({
        where: { id: songId },
      });

      // 清理前台缓存
      await deleteCache('music:list');

      // 异步删除文件（不阻塞响应）
      const deleteFile = async (url: string) => {
        if (!url) return;
        try {
          const filename = url.replace('/uploads/', '');
          const filePath = join(process.cwd(), 'public', 'uploads', filename);
          await unlink(filePath);
        } catch {
          // 文件不存在或删除失败不影响主流程
        }
      };

      await Promise.all([
        deleteFile(song.audioUrl),
        deleteFile(song.coverUrl || ''),
      ]);

      return successResponse(null);
    } catch (error) {
      logger.error('Failed to delete song', error);
      return errorResponse('删除歌曲失败', 500);
    }
  },
  'editor'
);
