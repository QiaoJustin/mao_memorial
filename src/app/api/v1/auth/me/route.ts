import { NextResponse, NextRequest } from 'next/server';
import { prisma } from '@/lib/db';
import { withAuth } from '@/lib/with-auth';

export const dynamic = 'force-dynamic';

export const GET = withAuth(async (request: NextRequest, ctx) => {
  const { user } = ctx;

  const admin = await prisma.admin.findUnique({
    where: { id: user.id, isDeleted: false },
    select: {
      id: true,
      username: true,
      name: true,
      email: true,
      role: true,
      avatarUrl: true,
      lastLoginAt: true,
      loginCount: true,
      createdAt: true,
    },
  });

  if (!admin) {
    // 用户不存在，清除 cookie
    const response = NextResponse.json({
      code: 401,
      message: '用户不存在',
      data: null,
      timestamp: Date.now(),
      requestId: `req_${Date.now()}_${Math.random().toString(36).slice(2, 11)}`,
    });
    response.cookies.set('admin_token', '', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 0,
      path: '/',
    });
    return response;
  }

  return NextResponse.json({
    code: 200,
    message: 'success',
    data: {
      id: Number(admin.id),
      username: admin.username,
      name: admin.name || '',
      email: admin.email || '',
      role: admin.role,
      avatarUrl: admin.avatarUrl || null,
      lastLoginAt: admin.lastLoginAt?.toISOString().replace('T', ' ') || '',
      loginCount: Number(admin.loginCount || 0),
      createdAt: admin.createdAt.toISOString().replace('T', ' '),
    },
    timestamp: Date.now(),
    requestId: `req_${Date.now()}_${Math.random().toString(36).slice(2, 11)}`,
  });
});
