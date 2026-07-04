import { prisma } from '@/lib/db';
import { verifyToken, hasRole } from '@/lib/auth';
import { NextResponse } from 'next/server';

export async function GET(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = await params;
  const token = request.headers.get('Authorization')?.replace('Bearer ', '');
  const payload = verifyToken(token || '');
  
  if (!payload || !hasRole(payload.role, 'super_admin')) {
    return NextResponse.json({ code: 401, message: 'Unauthorized' }, { status: 401 });
  }

  const admin = await prisma.admin.findUnique({
    where: { id: BigInt(resolvedParams.id), isDeleted: false },
    select: {
      id: true,
      username: true,
      name: true,
      email: true,
      phone: true,
      role: true,
      status: true,
      lastLoginAt: true,
      loginCount: true,
      createdAt: true,
    },
  });

  if (!admin) {
    return NextResponse.json({ code: 404, message: 'Admin not found' }, { status: 404 });
  }

  return NextResponse.json({ code: 200, data: admin });
}

export async function PUT(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = await params;
  const token = request.headers.get('Authorization')?.replace('Bearer ', '');
  const payload = verifyToken(token || '');
  
  if (!payload || !hasRole(payload.role, 'super_admin')) {
    return NextResponse.json({ code: 401, message: 'Unauthorized' }, { status: 401 });
  }

  const body = await request.json();

  const admin = await prisma.admin.update({
    where: { id: BigInt(resolvedParams.id), isDeleted: false },
    data: {
      name: body.name,
      email: body.email,
      phone: body.phone,
      role: body.role,
      status: body.status,
    },
    select: {
      id: true,
      username: true,
      name: true,
      email: true,
      phone: true,
      role: true,
      status: true,
      createdAt: true,
    },
  });

  return NextResponse.json({ code: 200, data: admin });
}

export async function DELETE(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = await params;
  const token = request.headers.get('Authorization')?.replace('Bearer ', '');
  const payload = verifyToken(token || '');
  
  if (!payload || !hasRole(payload.role, 'super_admin')) {
    return NextResponse.json({ code: 401, message: 'Unauthorized' }, { status: 401 });
  }

  const admin = await prisma.admin.update({
    where: { id: BigInt(resolvedParams.id), isDeleted: false },
    data: { isDeleted: true },
  });

  return NextResponse.json({ code: 200, data: admin });
}