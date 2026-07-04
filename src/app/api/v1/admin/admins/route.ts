import { prisma } from '@/lib/db';
import { verifyToken, hasRole } from '@/lib/auth';
import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  const token = request.headers.get('Authorization')?.replace('Bearer ', '');
  const payload = verifyToken(token || '');
  
  if (!payload || !hasRole(payload.role, 'super_admin')) {
    return NextResponse.json({ code: 401, message: 'Unauthorized' }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const page = parseInt(searchParams.get('page') || '1', 10);
  const pageSize = parseInt(searchParams.get('pageSize') || '20', 10);
  const q = searchParams.get('q');

  const where: Record<string, unknown> = { isDeleted: false };
  
  if (q) {
    where.OR = [
      { username: { contains: q as string } },
      { name: { contains: q as string } },
      { email: { contains: q as string } },
    ];
  }

  const [list, total] = await Promise.all([
    prisma.admin.findMany({
      where,
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
      orderBy: { createdAt: 'desc' },
      skip: (page - 1) * pageSize,
      take: pageSize,
    }),
    prisma.admin.count({ where }),
  ]);

  const formattedList = list.map(item => ({
    ...item,
    id: Number(item.id),
    loginCount: Number(item.loginCount || 0),
    lastLoginAt: item.lastLoginAt?.toISOString().replace('T', ' ') || '',
    createdAt: item.createdAt.toISOString().replace('T', ' '),
  }));

  return NextResponse.json({
    code: 200,
    data: {
      list: formattedList,
      total,
      totalPages: Math.ceil(total / pageSize),
      page,
      pageSize,
    },
  });
}

export async function POST(request: Request) {
  const token = request.headers.get('Authorization')?.replace('Bearer ', '');
  const payload = verifyToken(token || '');
  
  if (!payload || !hasRole(payload.role, 'super_admin')) {
    return NextResponse.json({ code: 401, message: 'Unauthorized' }, { status: 401 });
  }

  const body = await request.json();
  const bcrypt = await import('bcryptjs');
  
  const existing = await prisma.admin.findUnique({ where: { username: body.username } });
  if (existing) {
    return NextResponse.json({ code: 400, message: 'Username already exists' }, { status: 400 });
  }

  const admin = await prisma.admin.create({
    data: {
      username: body.username,
      passwordHash: await bcrypt.hash(body.password, 10),
      name: body.name,
      email: body.email,
      phone: body.phone,
      role: body.role || 'editor',
      status: body.status || 'active',
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

  const formattedAdmin = {
    ...admin,
    id: Number(admin.id),
    createdAt: admin.createdAt.toISOString().replace('T', ' '),
  };

  return NextResponse.json({ code: 200, data: formattedAdmin }, { status: 201 });
}