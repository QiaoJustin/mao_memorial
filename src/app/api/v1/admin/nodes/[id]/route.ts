import { prisma } from '@/lib/db';
import { withAuth } from '@/lib/with-auth';
import { serializeNode } from '@/lib/serializers';
import { NextResponse } from 'next/server';

export const GET = withAuth<{ params: Promise<{ id: string }> }>(
  async (request, ctx) => {
    const { id } = await ctx.params;

    const node = await prisma.timelineNode.findUnique({
      where: { id: BigInt(id), isDeleted: false },
      include: {
        era: true,
        photos: { orderBy: { sortOrder: 'asc' } },
        tags: { include: { tag: true } },
      },
    });

    if (!node) {
      return NextResponse.json({ code: 404, message: 'Node not found' }, { status: 404 });
    }

    return NextResponse.json({
      code: 200,
      data: serializeNode(node as unknown as Record<string, unknown>),
    });
  },
  'editor'
);

export const PUT = withAuth<{ params: Promise<{ id: string }> }>(
  async (request, ctx) => {
    const { id } = await ctx.params;
    const body = await request.json();

    const existing = await prisma.timelineNode.findFirst({
      where: { id: BigInt(id), isDeleted: false },
      select: { id: true },
    });
    if (!existing) {
      return NextResponse.json({ code: 404, message: 'Node not found' }, { status: 404 });
    }

    const photosData = body.photos?.map((p: Record<string, unknown>, index: number) => ({
      url: p.url as string,
      thumbnailUrl: (p.thumbnailUrl as string) || (p.url as string),
      caption: (p.caption as string) || '',
      altText: (p.altText as string) || '',
      isCover: p.isCover || (index === 0),
      sortOrder: index,
    })) || [];

    const node = await prisma.timelineNode.update({
      where: { id: BigInt(id) },
      data: {
        date: body.date,
        dateSort: new Date(body.dateSort || body.date),
        year: body.year,
        eraId: body.eraId,
        title: body.title,
        description: body.description,
        historicalContext: body.historicalContext,
        thumbnailUrl: photosData[0]?.url || body.thumbnailUrl || '',
        sortOrder: body.sortOrder || 0,
        isPublished: body.isPublished,
        isFeatured: body.isFeatured,
        seoTitle: body.seoTitle,
        seoDescription: body.seoDescription,
        photoCount: photosData.length || 0,
        photos: {
          deleteMany: {},
          create: photosData,
        },
      },
      include: { era: true, photos: true },
    });

    return NextResponse.json({
      code: 200,
      data: serializeNode(node as unknown as Record<string, unknown>),
    });
  },
  'admin'
);

export const DELETE = withAuth<{ params: Promise<{ id: string }> }>(
  async (request, ctx) => {
    const { id } = await ctx.params;

    const existing = await prisma.timelineNode.findFirst({
      where: { id: BigInt(id), isDeleted: false },
      select: { id: true },
    });
    if (!existing) {
      return NextResponse.json({ code: 404, message: 'Node not found' }, { status: 404 });
    }
    const node = await prisma.timelineNode.update({
      where: { id: BigInt(id) },
      data: { isDeleted: true },
    });

    return NextResponse.json({
      code: 200,
      data: serializeNode(node as unknown as Record<string, unknown>),
    });
  },
  'admin'
);
