import { prisma } from '@/lib/db';
import { withAuth } from '@/lib/with-auth';
import { serializePhoto } from '@/lib/serializers';
import { NextResponse } from 'next/server';

export const GET = withAuth<{ params: Promise<{ id: string }> }>(
  async (request, ctx) => {
    const { id } = await ctx.params;
    if (!id || id === 'undefined') {
      return NextResponse.json({ code: 400, message: 'Invalid photo ID' }, { status: 400 });
    }

    const photo = await prisma.photo.findFirst({
      where: { id: BigInt(id), isDeleted: false },
      include: { node: { select: { title: true, date: true } } },
    });

    if (!photo) {
      return NextResponse.json({ code: 404, message: 'Photo not found' }, { status: 404 });
    }

    const serialized = serializePhoto(photo as unknown as Record<string, unknown>);

    return NextResponse.json({
      code: 200,
      data: {
        ...serialized,
        nodeId: photo.nodeId ? Number(photo.nodeId) : null,
        nodeTitle: photo.node?.title || '',
        nodeDate: photo.node?.date || '',
      },
    });
  },
  'editor'
);

export const PUT = withAuth<{ params: Promise<{ id: string }> }>(
  async (request, ctx) => {
    const { id } = await ctx.params;
    if (!id || id === 'undefined') {
      return NextResponse.json({ code: 400, message: 'Invalid photo ID' }, { status: 400 });
    }

    const body = await request.json();

    const existing = await prisma.photo.findFirst({
      where: { id: BigInt(id), isDeleted: false },
      select: { id: true },
    });
    if (!existing) {
      return NextResponse.json({ code: 404, message: 'Photo not found' }, { status: 404 });
    }

    const photo = await prisma.photo.update({
      where: { id: BigInt(id) },
      data: {
        url: body.url,
        thumbnailUrl: body.thumbnailUrl || body.url,
        caption: body.caption || '',
        altText: body.altText || '',
        width: body.width,
        height: body.height,
        fileSize: body.fileSize,
        sortOrder: body.sortOrder || 0,
        isCover: body.isCover || false,
      },
      include: { node: { select: { title: true } } },
    });

    const serialized = serializePhoto(photo as unknown as Record<string, unknown>);

    return NextResponse.json({
      code: 200,
      data: {
        ...serialized,
        nodeId: photo.nodeId ? Number(photo.nodeId) : null,
        nodeTitle: photo.node?.title || '',
      },
    });
  },
  'admin'
);

export const DELETE = withAuth<{ params: Promise<{ id: string }> }>(
  async (request, ctx) => {
    const { id } = await ctx.params;
    if (!id || id === 'undefined') {
      return NextResponse.json({ code: 400, message: 'Invalid photo ID' }, { status: 400 });
    }

    const existing = await prisma.photo.findFirst({
      where: { id: BigInt(id), isDeleted: false },
      select: { id: true },
    });
    if (!existing) {
      return NextResponse.json({ code: 404, message: 'Photo not found' }, { status: 404 });
    }

    const photo = await prisma.photo.update({
      where: { id: BigInt(id) },
      data: { isDeleted: true },
    });

    return NextResponse.json({
      code: 200,
      data: serializePhoto(photo as unknown as Record<string, unknown>),
    });
  },
  'admin'
);