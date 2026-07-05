import { prisma } from '@/lib/db';
import { withAuth } from '@/lib/with-auth';
import { serializeSetting } from '@/lib/serializers';
import { NextResponse } from 'next/server';

export const PUT = withAuth<{ params: Promise<{ key: string }> }>(
  async (request, ctx) => {
    const { key } = await ctx.params;
    const body = await request.json();

    const setting = await prisma.setting.upsert({
      where: { key },
      update: {
        value: body.value,
        type: body.type || 'string',
        category: body.category || 'general',
        description: body.description,
      },
      create: {
        key,
        value: body.value,
        type: body.type || 'string',
        category: body.category || 'general',
        description: body.description,
      },
    });

    return NextResponse.json({
      code: 200,
      data: serializeSetting(setting as unknown as Record<string, unknown>),
    });
  },
  'admin'
);
