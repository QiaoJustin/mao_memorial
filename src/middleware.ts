import { NextRequest, NextResponse } from 'next/server';
import { verifyToken } from '@/lib/jwt';

/**
 * P0-8: 服务端统一鉴权中间件
 * - 保护 /admin/** 页面（除 /admin/login）
 * - 保护 /api/v1/admin/** 与 /api/v1/auth/me、/api/v1/auth/password 接口
 * - 使用 verifyToken（异步版本，使用 jose，兼容 Edge Runtime）
 *   黑名单校验由 route handler 中的 withAuth 异步完成
 */

const PUBLIC_ADMIN_PATHS = new Set(['/admin/login']);

function isProtectedAdminPage(pathname: string): boolean {
  return pathname.startsWith('/admin') && !PUBLIC_ADMIN_PATHS.has(pathname);
}

function isProtectedApi(pathname: string): boolean {
  if (pathname.startsWith('/api/v1/admin/')) return true;
  if (pathname === '/api/v1/auth/me') return true;
  if (pathname === '/api/v1/auth/password') return true;
  return false;
}

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const token = request.cookies.get('admin_token')?.value;

  // 保护 admin 页面：未登录或 token 无效则重定向到登录页
  if (isProtectedAdminPage(pathname)) {
    if (!token || !(await verifyToken(token))) {
      const loginUrl = new URL('/admin/login', request.url);
      loginUrl.searchParams.set('redirect', pathname);
      return NextResponse.redirect(loginUrl);
    }
    return NextResponse.next();
  }

  // 保护 admin API：未登录或 token 无效则返回 401
  if (isProtectedApi(pathname)) {
    const payload = token ? await verifyToken(token) : null;
    if (!payload) {
      return NextResponse.json(
        {
          code: 401,
          message: '未登录或登录已过期',
          data: null,
          timestamp: Date.now(),
        },
        { status: 401 }
      );
    }
    // 注入用户信息到请求头，供下游 route handler 使用（withAuth 仍会查黑名单）
    const requestHeaders = new Headers(request.headers);
    requestHeaders.set('x-user-id', String(payload.id));
    requestHeaders.set('x-user-username', payload.username);
    requestHeaders.set('x-user-role', payload.role);
    return NextResponse.next({
      request: { headers: requestHeaders },
    });
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/admin/:path*', '/api/v1/admin/:path*', '/api/v1/auth/me', '/api/v1/auth/password'],
};
