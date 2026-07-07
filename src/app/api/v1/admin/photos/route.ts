import { prisma } from '@/lib/db';
import { withAuth } from '@/lib/with-auth';
import { serializePhoto } from '@/lib/serializers';
import { NextResponse } from 'next/server';

export const GET = withAuth(async (request) => {
  const { searchParams } = new URL(request.url);
  const page = parseInt(searchParams.get('page') || '1', 10);
  const pageSize = parseInt(searchParams.get('pageSize') || '20', 10);
  const q = searchParams.get('q') || searchParams.get('keyword');
  const nodeId = searchParams.get('nodeId');

  const where: Record<string, unknown> = { isDeleted: false };

  if (q) {
    where.OR = [
      { caption: { contains: q as string } },
      { url: { contains: q as string } },
    ];
  }

  if (nodeId) {
    where.nodeId = BigInt(nodeId);
  }

  const [list, total] = await Promise.all([
    prisma.photo.findMany({
      where,
      include: { node: { select: { title: true, date: true } } },
      orderBy: { sortOrder: 'asc' },
      skip: (page - 1) * pageSize,
      take: pageSize,
    }),
    prisma.photo.count({ where }),
  ]);

  const formattedList = list.map((item) => {
    const serialized = serializePhoto(item as unknown as Record<string, unknown>);
    return {
      ...serialized,
      nodeId: item.nodeId ? Number(item.nodeId) : null,
      nodeTitle: item.node?.title || '',
      nodeDate: item.node?.date || '',
    };
  });

  return NextResponse.json({
    code: 200,
    data: {
      list: formattedList,
      total: Number(total),
      totalPages: Math.ceil(Number(total) / pageSize),
      page,
      pageSize,
    },
  });
}, 'editor');

export const POST = withAuth(async (request) => {
  const body = await request.json();

  if (!body.nodeId) {
    return NextResponse.json({ code: 400, message: 'nodeId is required' }, { status: 400 });
  }

  const photo = await prisma.photo.create({
    data: {
      nodeId: BigInt(body.nodeId),
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
      nodeId: Number(photo.nodeId),
      nodeTitle: photo.node?.title || '',
    },
  }, { status: 201 });
}, 'admin');