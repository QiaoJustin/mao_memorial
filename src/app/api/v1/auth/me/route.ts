import { NextResponse, NextRequest } from 'next/server';
import { prisma } from '@/lib/db';
import { verifyToken } from '@/lib/auth';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  const token = request.cookies.get('admin_token')?.value || 
    request.headers.get('Authorization')?.replace('Bearer ', '') || '';

  if (!token) {
    return NextResponse.json({
      code: 401,
      message: '请先登录',
      data: null,
      timestamp: Date.now(),
      requestId: `req_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    });
  }

  const payload = verifyToken(token);

  if (!payload) {
    const response = NextResponse.json({
      code: 401,
      message: '登录已过期，请重新登录',
      data: null,
      timestamp: Date.now(),
      requestId: `req_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
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

  const admin = await prisma.admin.findUnique({
    where: { id: payload.id, isDeleted: false },
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
    const response = NextResponse.json({
      code: 401,
      message: '用户不存在',
      data: null,
      timestamp: Date.now(),
      requestId: `req_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
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
    requestId: `req_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
  });
}