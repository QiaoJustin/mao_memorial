import jwt from 'jsonwebtoken';
import { jwtVerify, type JWTPayload } from 'jose';

/**
 * JWT 核心工具（Edge Runtime 兼容）
 * - 使用 jose 进行 token 验证（兼容 Edge Runtime）
 * - 使用 jsonwebtoken 进行 token 生成（仅在 Node.js 环境使用）
 * 供 middleware.ts 与 auth.ts 共享
 */

// P0-9: JWT_SECRET 缺失或过短时 fail-fast，杜绝弱默认密钥
const JWT_SECRET = process.env.JWT_SECRET;
if (!JWT_SECRET || JWT_SECRET.length < 32) {
  throw new Error('JWT_SECRET 环境变量未设置或长度不足 32 字符，应用拒绝启动');
}

export const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '24h';

// P3-1: 收紧 role 类型为联合类型，避免任意字符串通过
export type AdminRole = 'super_admin' | 'admin' | 'editor';

export interface TokenPayload {
  id: number;
  username: string;
  role: AdminRole;
  jti: string; // 唯一标识，用于撤销
}

/**
 * 异步签名校验（使用 jose，兼容 Edge Runtime）
 * 供 middleware（Edge Runtime）使用，做快速过滤
 * 真正的黑名单校验在 route handler 中由 verifyToken 异步完成
 */
export async function verifyToken(token: string): Promise<TokenPayload | null> {
  try {
    const { payload } = await jwtVerify(token, new TextEncoder().encode(JWT_SECRET));
    // P2-5: 运行时校验关键字段类型，防止 token payload 被篡改或结构异常
    if (
      typeof payload.id !== 'number' ||
      typeof payload.username !== 'string' ||
      typeof payload.role !== 'string' ||
      typeof payload.jti !== 'string'
    ) {
      return null;
    }
    if (!payload.jti) return null;
    return payload as TokenPayload;
  } catch {
    return null;
  }
}

/**
 * 同步签名校验（使用 jsonwebtoken，仅用于 Node.js 环境）
 * 供 auth.ts 等 Node.js 环境使用
 * @deprecated 使用 verifyToken（异步版本）替代，兼容 Edge Runtime
 */
export function verifyTokenSync(token: string): TokenPayload | null {
  try {
    const payload = jwt.verify(token, JWT_SECRET as string) as TokenPayload;
    if (
      typeof payload.id !== 'number' ||
      typeof payload.username !== 'string' ||
      typeof payload.role !== 'string' ||
      typeof payload.jti !== 'string'
    ) {
      return null;
    }
    if (!payload.jti) return null;
    return payload;
  } catch {
    return null;
  }
}

/**
 * 解码 token 拿到 jti 与 exp（用于撤销时计算 TTL）
 */
export function decodeTokenMeta(token: string): { jti?: string; exp?: number } | null {
  try {
    return jwt.decode(token) as { jti?: string; exp?: number } | null;
  } catch {
    return null;
  }
}

export { jwt, JWT_SECRET };
