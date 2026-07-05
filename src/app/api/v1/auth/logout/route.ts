import { NextResponse, NextRequest } from 'next/server';
import { revokeToken } from '@/lib/auth';

export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
  // P0-8: 将当前 token 加入黑名单，防止 logout 后 token 仍可用
  const token = request.cookies.get('admin_token')?.value;
  if (token) {
    await revokeToken(token);
  }

  const response = NextResponse.json({
    code: 200,
    message: '退出成功',
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
