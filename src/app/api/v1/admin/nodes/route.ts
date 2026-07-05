import { prisma } from '@/lib/db';
import { withAuth } from '@/lib/with-auth';
import { serializeNode } from '@/lib/serializers';
import { NextResponse } from 'next/server';

export const GET = withAuth(async (request) => {
  const { searchParams } = new URL(request.url);
  const page = parseInt(searchParams.get('page') || '1', 10);
  const pageSize = parseInt(searchParams.get('pageSize') || '20', 10);
  const q = searchParams.get('q') || searchParams.get('keyword');
  const eraId = searchParams.get('eraId');
  const isPublished = searchParams.get('isPublished');
  const isFeatured = searchParams.get('isFeatured');
  const sortBy = searchParams.get('sortBy') || 'dateSort';
  const sortOrder = searchParams.get('sortOrder') === 'desc' ? 'desc' : 'asc';

  const where: Record<string, unknown> = { isDeleted: false };

  if (q) {
    where.OR = [
      { title: { contains: q as string } },
      { description: { contains: q as string } },
    ];
  }

  if (eraId) {
    where.eraId = eraId;
  }

  if (isPublished !== null) {
    where.isPublished = isPublished === 'true';
  }

  if (isFeatured !== null) {
    where.isFeatured = isFeatured === 'true';
  }

  const [list, total] = await Promise.all([
    prisma.timelineNode.findMany({
      where,
      include: { era: { select: { id: true, name: true } }, photos: { take: 1 } },
      orderBy: { [sortBy]: sortOrder },
      skip: (page - 1) * pageSize,
      take: pageSize,
    }),
    prisma.timelineNode.count({ where }),
  ]);

  const formattedList = list.map((item) =>
    serializeNode(item as unknown as Record<string, unknown>)
  );

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

  const photosData = body.photos?.map((p: Record<string, unknown>, index: number) => ({
    url: p.url as string,
    thumbnailUrl: (p.thumbnailUrl as string) || (p.url as string),
    caption: (p.caption as string) || '',
    altText: (p.altText as string) || '',
    isCover: p.isCover || (index === 0),
    sortOrder: index,
  })) || [];

  const node = await prisma.timelineNode.create({
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
      isPublished: body.isPublished ?? true,
      isFeatured: body.isFeatured ?? false,
      seoTitle: body.seoTitle,
      seoDescription: body.seoDescription,
      photoCount: photosData.length || 0,
      photos: {
        create: photosData,
      },
    },
    include: { era: true, photos: true },
  });

  return NextResponse.json(
    { code: 200, data: serializeNode(node as unknown as Record<string, unknown>) },
    { status: 201 }
  );
}, 'admin');
