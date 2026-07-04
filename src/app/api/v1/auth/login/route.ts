import { NextResponse } from 'next/server';
import { validateLogin, generateToken } from '@/lib/auth';

export const dynamic = 'force-dynamic';

export async function POST(request: Request) {
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

  const { username, password } = body;

  if (!username || !password) {
    return NextResponse.json({
      code: 400,
      message: '参数错误：用户名和密码不能为空',
      data: null,
      timestamp: Date.now(),
      requestId: `req_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    });
  }

  const { admin, remainingAttempts, lockedUntil } = await validateLogin(username, password);

  if (!admin) {
    const message = lockedUntil 
      ? `账号已被锁定，请${Math.ceil((lockedUntil.getTime() - Date.now()) / 60000)}分钟后再试`
      : remainingAttempts > 0
        ? `用户名或密码错误，剩余${remainingAttempts}次尝试机会`
        : '用户名或密码错误';

    return NextResponse.json({
      code: 401,
      message,
      data: { remainingAttempts },
      timestamp: Date.now(),
      requestId: `req_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    });
  }

  const token = generateToken(admin);

  const response = NextResponse.json({
    code: 200,
    message: '登录成功',
    data: {
      token,
      expiresIn: 86400,
      user: {
        id: Number(admin.id),
        username: admin.username,
        name: admin.name || '',
        role: admin.role,
        avatarUrl: admin.avatarUrl || null,
        lastLoginAt: admin.lastLoginAt?.toISOString().replace('T', ' ') || '',
      },
    },
    timestamp: Date.now(),
    requestId: `req_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
  });

  response.cookies.set('admin_token', token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
    maxAge: 86400,
    path: '/',
  });

  return response;
}