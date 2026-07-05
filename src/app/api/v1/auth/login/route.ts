import { NextResponse, NextRequest } from 'next/server';
import { validateLogin, generateToken } from '@/lib/auth';
import { getClientIp } from '@/lib/get-client-ip';
import { checkLoginRateLimit } from '@/lib/rate-limit';

export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
  // P1-10: 登录 IP 限流，防止暴力破解（5次/30分钟）
  const ip = getClientIp(request);
  const rateLimitResult = await checkLoginRateLimit(ip);
  if (!rateLimitResult.allowed) {
    return NextResponse.json({
      code: 429,
      message: '登录尝试过于频繁，请30分钟后再试',
      data: { remaining: rateLimitResult.remaining },
      timestamp: Date.now(),
      requestId: `req_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    }, { status: 429 });
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

  // P0-8: 不再返回 token 到响应体，仅通过 httpOnly cookie 传递
  const response = NextResponse.json({
    code: 200,
    message: '登录成功',
    data: {
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
    requestId: `req_${Date.now()}_${Math.random().toString(36).slice(2, 11)}`,
  });

  response.cookies.set('admin_token', token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: process.env.NODE_ENV === 'production' ? 'strict' : 'lax',
    maxAge: 86400,
    path: '/',
  });

  return response;
}