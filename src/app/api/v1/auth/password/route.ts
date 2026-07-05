import { NextResponse, NextRequest } from 'next/server';
import { prisma } from '@/lib/db';
import { withAuth } from '@/lib/with-auth';
import { revokeToken } from '@/lib/auth';
import bcrypt from 'bcryptjs';

export const dynamic = 'force-dynamic';

export const PUT = withAuth(async (request: NextRequest, ctx) => {
  const { user } = ctx;

  let body;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({
      code: 400,
      message: '参数错误：请求体格式不正确',
      data: null,
      timestamp: Date.now(),
      requestId: `req_${Date.now()}_${Math.random().toString(36).slice(2, 11)}`,
    });
  }

  const { oldPassword, newPassword } = body;

  if (!oldPassword || !newPassword) {
    return NextResponse.json({
      code: 400,
      message: '参数错误：旧密码和新密码不能为空',
      data: null,
      timestamp: Date.now(),
      requestId: `req_${Date.now()}_${Math.random().toString(36).slice(2, 11)}`,
    });
  }

  if (newPassword.length < 6) {
    return NextResponse.json({
      code: 400,
      message: '参数错误：新密码长度至少6位',
      data: null,
      timestamp: Date.now(),
      requestId: `req_${Date.now()}_${Math.random().toString(36).slice(2, 11)}`,
    });
  }

  const admin = await prisma.admin.findUnique({
    where: { id: user.id },
    select: { id: true, passwordHash: true },
  });

  if (!admin) {
    return NextResponse.json({
      code: 404,
      message: '用户不存在',
      data: null,
      timestamp: Date.now(),
      requestId: `req_${Date.now()}_${Math.random().toString(36).slice(2, 11)}`,
    });
  }

  const isOldPasswordValid = await bcrypt.compare(oldPassword, admin.passwordHash);

  if (!isOldPasswordValid) {
    return NextResponse.json({
      code: 400,
      message: '旧密码不正确',
      data: null,
      timestamp: Date.now(),
      requestId: `req_${Date.now()}_${Math.random().toString(36).slice(2, 11)}`,
    });
  }

  const newPasswordHash = await bcrypt.hash(newPassword, 10);

  await prisma.admin.update({
    where: { id: user.id },
    data: { passwordHash: newPasswordHash },
  });

  // P0-8: 改密成功后撤销当前 token，强制重新登录
  const currentToken = request.cookies.get('admin_token')?.value;
  if (currentToken) {
    await revokeToken(currentToken);
  }

  const response = NextResponse.json({
    code: 200,
    message: '密码修改成功，请重新登录',
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
});
