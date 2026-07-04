import { prisma } from '@/lib/db';
import { verifyToken, hasRole } from '@/lib/auth';
import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  const token = request.headers.get('Authorization')?.replace('Bearer ', '');
  const payload = verifyToken(token || '');
  
  if (!payload || !hasRole(payload.role, 'editor')) {
    return NextResponse.json({ code: 401, message: 'Unauthorized' }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const page = parseInt(searchParams.get('page') || '1', 10);
  const pageSize = parseInt(searchParams.get('pageSize') || '20', 10);
  const q = searchParams.get('q');
  const eraId = searchParams.get('eraId');
  const isPublished = searchParams.get('isPublished');
  const isFeatured = searchParams.get('isFeatured');

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
      orderBy: { dateSort: 'asc' },
      skip: (page - 1) * pageSize,
      take: pageSize,
    }),
    prisma.timelineNode.count({ where }),
  ]);

  const formattedList = list.map(item => ({
    ...item,
    id: Number(item.id),
    year: Number(item.year),
    photoCount: Number(item.photoCount || 0),
    viewCount: Number(item.viewCount || 0),
    likeCount: Number(item.likeCount || 0),
    sortOrder: Number(item.sortOrder),
    createdAt: item.createdAt.toISOString().replace('T', ' '),
    updatedAt: item.updatedAt.toISOString().replace('T', ' '),
    photos: item.photos.map(p => ({
      ...p,
      id: Number(p.id),
      nodeId: Number(p.nodeId),
      sortOrder: Number(p.sortOrder),
      width: p.width ? Number(p.width) : null,
      height: p.height ? Number(p.height) : null,
      fileSize: p.fileSize ? Number(p.fileSize) : null,
    })),
  }));

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
}

export async function POST(request: Request) {
  const token = request.headers.get('Authorization')?.replace('Bearer ', '');
  const payload = verifyToken(token || '');
  
  if (!payload || !hasRole(payload.role, 'admin')) {
    return NextResponse.json({ code: 401, message: 'Unauthorized' }, { status: 401 });
  }

  const body = await request.json();
  
  const node = await prisma.timelineNode.create({
    data: {
      date: body.date,
      dateSort: new Date(body.dateSort || body.date),
      year: body.year,
      eraId: body.eraId,
      title: body.title,
      description: body.description,
      historicalContext: body.historicalContext,
      thumbnailUrl: body.thumbnailUrl || '',
      sortOrder: body.sortOrder || 0,
      isPublished: body.isPublished ?? true,
      isFeatured: body.isFeatured ?? false,
      seoTitle: body.seoTitle,
      seoDescription: body.seoDescription,
      photoCount: body.photos?.length || 0,
    },
    include: { era: true, photos: true },
  });

  const formattedNode = {
    ...node,
    id: Number(node.id),
    year: Number(node.year),
    photoCount: Number(node.photoCount || 0),
    viewCount: Number(node.viewCount || 0),
    sortOrder: Number(node.sortOrder),
    createdAt: node.createdAt.toISOString().replace('T', ' '),
    updatedAt: node.updatedAt.toISOString().replace('T', ' '),
    photos: node.photos.map(p => ({ ...p, id: Number(p.id), sortOrder: Number(p.sortOrder) })),
  };

  return NextResponse.json({ code: 200, data: formattedNode }, { status: 201 });
}