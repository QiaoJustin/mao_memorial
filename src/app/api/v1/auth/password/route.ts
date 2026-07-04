import { NextResponse, NextRequest } from 'next/server';
import { prisma } from '@/lib/db';
import { verifyToken } from '@/lib/auth';

export const dynamic = 'force-dynamic';

export async function PUT(request: NextRequest) {
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

  let body;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({
      code: 400,
      message: '参数错误：请求体格式不正确',
      data: null,
      timestamp: Date.now(),
      requestId: `req_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    });
  }

  const { oldPassword, newPassword } = body;

  if (!oldPassword || !newPassword) {
    return NextResponse.json({
      code: 400,
      message: '参数错误：旧密码和新密码不能为空',
      data: null,
      timestamp: Date.now(),
      requestId: `req_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    });
  }

  if (newPassword.length < 6) {
    return NextResponse.json({
      code: 400,
      message: '参数错误：新密码长度至少6位',
      data: null,
      timestamp: Date.now(),
      requestId: `req_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    });
  }

  const admin = await prisma.admin.findUnique({
    where: { id: payload.id },
    select: { id: true, passwordHash: true },
  });

  if (!admin) {
    return NextResponse.json({
      code: 404,
      message: '用户不存在',
      data: null,
      timestamp: Date.now(),
      requestId: `req_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    });
  }

  const { compare, hash } = await import('bcryptjs');
  const isOldPasswordValid = await compare(oldPassword, admin.passwordHash);

  if (!isOldPasswordValid) {
    return NextResponse.json({
      code: 400,
      message: '旧密码不正确',
      data: null,
      timestamp: Date.now(),
      requestId: `req_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    });
  }

  const newPasswordHash = await hash(newPassword, 10);

  await prisma.admin.update({
    where: { id: payload.id },
    data: { passwordHash: newPasswordHash },
  });

  const response = NextResponse.json({
    code: 200,
    message: '密码修改成功',
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