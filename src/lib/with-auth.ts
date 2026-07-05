import { NextRequest, NextResponse } from 'next/server';
import { verifyToken, hasRole, type TokenPayload } from './auth';

/**
 * P0-8 + P1-3: 鉴权高阶函数
 * - 从 cookie 读取 admin_token
 * - 调用 verifyToken（含黑名单校验）
 * - 角色检查
 * - 将 user 信息注入到 handler context
 *
 * 用法：
 *   export const GET = withAuth(async (request, ctx) => {
 *     const { user } = ctx;
 *     // ... 业务逻辑
 *   }, 'editor');
 *
 *   export const DELETE = withAuth<{ params: Promise<{ id: string }> }>(
 *     async (request, ctx) => {
 *       const { id } = await ctx.params;
 *       // ...
 *     },
 *     'admin'
 *   );
 */

// 通用路由上下文类型
export type RouteContext = { params: Promise<Record<string, string>> };

// 已鉴权的 handler 上下文
export type AuthedContext<T extends RouteContext | unknown = unknown> = T extends RouteContext
  ? T & { user: TokenPayload }
  : { user: TokenPayload };

type AuthedHandler<T> = (
  request: NextRequest,
  ctx: AuthedContext<T>
) => Promise<NextResponse | Response>;

/**
 * 鉴权失败的统一响应
 */
function authFailed(message: string, status: 401 | 403): NextResponse {
  return NextResponse.json(
    {
      code: status,
      message,
      data: null,
      timestamp: Date.now(),
    },
    { status }
  );
}

/**
 * 包裹 route handler，自动完成鉴权
 * @param handler 业务 handler
 * @param requiredRole 需要的最低角色（editor < admin < super_admin）
 */
export function withAuth<T extends RouteContext | unknown = unknown>(
  handler: AuthedHandler<T>,
  requiredRole: 'editor' | 'admin' | 'super_admin' = 'editor'
) {
  return async (request: NextRequest, context: T): Promise<NextResponse | Response> => {
    // 从 cookie 读取 token（前端使用 httpOnly cookie，不再用 Authorization 头）
    const token = request.cookies.get('admin_token')?.value;
    if (!token) {
      return authFailed('未登录或登录已过期', 401);
    }

    // 完整校验：签名 + 黑名单
    const payload = await verifyToken(token);
    if (!payload) {
      return authFailed('登录已过期，请重新登录', 401);
    }

    // 角色检查
    if (!hasRole(payload.role, requiredRole)) {
      return authFailed('权限不足', 403);
    }

    // 注入 user 信息到 context
    // 注：context 类型为 T（可能是 unknown），需断言为对象类型才能 spread
    const authedContext = { ...(context as Record<string, unknown>), user: payload } as AuthedContext<T>;
    return handler(request, authedContext);
  };
}
