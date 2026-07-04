import { prisma } from '@/lib/db';
import { verifyToken, hasRole } from '@/lib/auth';
import { NextResponse } from 'next/server';

export async function GET(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = await params;
  const token = request.headers.get('Authorization')?.replace('Bearer ', '');
  const payload = verifyToken(token || '');
  
  if (!payload || !hasRole(payload.role, 'editor')) {
    return NextResponse.json({ code: 401, message: 'Unauthorized' }, { status: 401 });
  }

  const node = await prisma.timelineNode.findUnique({
    where: { id: BigInt(resolvedParams.id), isDeleted: false },
    include: {
      era: true,
      photos: { orderBy: { sortOrder: 'asc' } },
      tags: { include: { tag: true } },
    },
  });

  if (!node) {
    return NextResponse.json({ code: 404, message: 'Node not found' }, { status: 404 });
  }

  return NextResponse.json({ code: 200, data: node });
}

export async function PUT(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = await params;
  const token = request.headers.get('Authorization')?.replace('Bearer ', '');
  const payload = verifyToken(token || '');
  
  if (!payload || !hasRole(payload.role, 'admin')) {
    return NextResponse.json({ code: 401, message: 'Unauthorized' }, { status: 401 });
  }

  const body = await request.json();

  const node = await prisma.timelineNode.update({
    where: { id: BigInt(resolvedParams.id), isDeleted: false },
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
      isPublished: body.isPublished,
      isFeatured: body.isFeatured,
      seoTitle: body.seoTitle,
      seoDescription: body.seoDescription,
      photoCount: body.photos?.length || 0,
    },
    include: { era: true, photos: true },
  });

  return NextResponse.json({ code: 200, data: node });
}

export async function DELETE(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = await params;
  const token = request.headers.get('Authorization')?.replace('Bearer ', '');
  const payload = verifyToken(token || '');
  
  if (!payload || !hasRole(payload.role, 'admin')) {
    return NextResponse.json({ code: 401, message: 'Unauthorized' }, { status: 401 });
  }

  const node = await prisma.timelineNode.update({
    where: { id: BigInt(resolvedParams.id), isDeleted: false },
    data: { isDeleted: true },
  });

  return NextResponse.json({ code: 200, data: node });
}