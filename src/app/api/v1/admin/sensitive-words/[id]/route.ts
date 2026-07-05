import { prisma } from '@/lib/db';
import { withAuth } from '@/lib/with-auth';
import { serializeSensitiveWord } from '@/lib/serializers';
import { NextResponse } from 'next/server';

/**
 * 敏感词管理 - 单条操作（P0-3：补全缺失的 [id] 路由）
 * - DELETE: 删除敏感词（admin）
 * - PUT: 更新敏感词（admin）
 */

// 删除敏感词
export const DELETE = withAuth<{ params: Promise<{ id: string }> }>(
  async (request, ctx) => {
    const { id } = await ctx.params;
    try {
      const word = await prisma.sensitiveWord.delete({
        where: { id: BigInt(id) },
      });
      return NextResponse.json({
        code: 200,
        data: serializeSensitiveWord(word as unknown as Record<string, unknown>),
      });
    } catch {
      return NextResponse.json(
        { code: 404, message: '敏感词不存在', data: null },
        { status: 404 }
      );
    }
  },
  'admin'
);

// 更新敏感词
export const PUT = withAuth<{ params: Promise<{ id: string }> }>(
  async (request, ctx) => {
    const { id } = await ctx.params;
    const body = await request.json();

    try {
      const word = await prisma.sensitiveWord.update({
        where: { id: BigInt(id) },
        data: {
          word: body.word,
          level: body.level,
          category: body.category,
          replacement: body.replacement,
          isActive: body.isActive,
        },
      });
      return NextResponse.json({
        code: 200,
        data: serializeSensitiveWord(word as unknown as Record<string, unknown>),
      });
    } catch {
      return NextResponse.json(
        { code: 404, message: '敏感词不存在或更新失败', data: null },
        { status: 404 }
      );
    }
  },
  'admin'
);
