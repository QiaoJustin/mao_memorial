import { prisma } from '@/lib/db';
import { withAuth } from '@/lib/with-auth';
import { serializeAdmin } from '@/lib/serializers';
import { NextResponse } from 'next/server';
import { z } from 'zod';

// P2-6: 创建管理员接口输入校验 schema
const createAdminSchema = z.object({
  username: z.string().min(3).max(50).regex(/^[a-zA-Z0-9_]+$/, '用户名仅支持字母、数字、下划线'),
  password: z.string().min(8).max(128, '密码长度不能超过 128 字符'),
  name: z.string().min(1).max(50),
  email: z.string().email().optional(),
  phone: z.string().max(20).optional(),
  role: z.enum(['admin', 'editor']).optional(),
  status: z.enum(['active', 'disabled']).optional(),
});

export const GET = withAuth(async (request) => {
  const { searchParams } = new URL(request.url);
  const page = parseInt(searchParams.get('page') || '1', 10);
  const pageSize = parseInt(searchParams.get('pageSize') || '20', 10);
  const q = searchParams.get('q') || searchParams.get('keyword');

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

  const formattedList = list.map((item) =>
    serializeAdmin(item as unknown as Record<string, unknown>)
  );

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
}, 'super_admin');

export const POST = withAuth(async (request) => {
  const body = await request.json();

  // P2-6: zod 校验输入，失败返回 400
  const parsed = createAdminSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { code: 400, message: '参数错误', data: parsed.error.flatten() },
      { status: 400 }
    );
  }
  const data = parsed.data;
  const bcrypt = await import('bcryptjs');

  const existing = await prisma.admin.findUnique({ where: { username: data.username } });
  if (existing) {
    return NextResponse.json({ code: 400, message: 'Username already exists' }, { status: 400 });
  }

  const admin = await prisma.admin.create({
    data: {
      username: data.username,
      passwordHash: await bcrypt.hash(data.password, 10),
      name: data.name,
      email: data.email,
      phone: data.phone,
      role: data.role || 'editor',
      status: data.status || 'active',
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

  return NextResponse.json(
    { code: 200, data: serializeAdmin(admin as unknown as Record<string, unknown>) },
    { status: 201 }
  );
}, 'super_admin');
