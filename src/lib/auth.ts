import { randomUUID } from 'crypto';
import bcrypt from 'bcryptjs';
import { prisma } from './db';
import redis from './redis';
import { logger } from './logger';
import {
  jwt,
  JWT_SECRET,
  JWT_EXPIRES_IN,
  verifyTokenSync,
  decodeTokenMeta,
  type TokenPayload,
  type AdminRole,
} from './jwt';
import type { Admin } from '@prisma/client';

// JWT 黑名单 key 前缀（P0-8: 支持 logout/改密后撤销 token）
const JWT_BLACKLIST_PREFIX = 'jwt:blacklist:';
// 登录安全参数（可通过环境变量覆盖）
const LOGIN_ATTEMPTS_LIMIT = parseInt(process.env.LOGIN_ATTEMPTS_LIMIT || '5', 10);
const LOCK_DURATION_MINUTES = parseInt(process.env.LOCK_DURATION_MINUTES || '30', 10);

// 重新导出 TokenPayload 与 verifyTokenSync，保持向后兼容
export { type TokenPayload, type AdminRole, verifyTokenSync };

/**
 * 生成 JWT，包含 jti 用于后续撤销
 */
export function generateToken(admin: Admin): string {
  const payload: TokenPayload = {
    id: Number(admin.id),
    username: admin.username,
    role: admin.role,
    jti: randomUUID(),
  };
  return jwt.sign(payload, JWT_SECRET as string, { expiresIn: JWT_EXPIRES_IN as jwt.SignOptions['expiresIn'] });
}

/**
 * 校验 JWT：签名 + 黑名单（异步，供 route handler 使用）
 */
export async function verifyToken(token: string): Promise<TokenPayload | null> {
  const payload = verifyTokenSync(token);
  if (!payload) return null;
  // 检查黑名单
  if (await isTokenRevoked(payload.jti)) return null;
  return payload;
}

/**
 * 将 token 加入黑名单（logout / 改密时调用）
 * TTL 与 token 剩余有效期对齐，避免黑名单无限增长
 */
export async function revokeToken(token: string): Promise<void> {
  const decoded = decodeTokenMeta(token);
  if (!decoded?.jti) return;
  const ttl = decoded.exp ? Math.max(1, decoded.exp - Math.floor(Date.now() / 1000)) : 86400;
  try {
    await redis.set(`${JWT_BLACKLIST_PREFIX}${decoded.jti}`, '1', 'EX', ttl);
  } catch {
    // Redis 故障时忽略，token 仍会在过期后失效
  }
}

/**
 * 检查 jti 是否在黑名单中
 */
export async function isTokenRevoked(jti: string): Promise<boolean> {
  try {
    const exists = await redis.exists(`${JWT_BLACKLIST_PREFIX}${jti}`);
    return exists === 1;
  } catch (error) {
    // P2-10: Redis 故障时 fail-open（token 仍有效），避免全局不可用；记录告警便于排查
    logger.error('[auth] Redis 故障，黑名单校验降级为允许:', error);
    return false;
  }
}

export async function validateLogin(username: string, password: string): Promise<{
  admin: Admin | null;
  remainingAttempts: number;
  lockedUntil: Date | null;
}> {
  const admin = await prisma.admin.findUnique({ where: { username } });

  if (!admin || admin.isDeleted) {
    return { admin: null, remainingAttempts: LOGIN_ATTEMPTS_LIMIT, lockedUntil: null };
  }

  if (admin.lockedUntil && admin.lockedUntil > new Date()) {
    return { admin: null, remainingAttempts: 0, lockedUntil: admin.lockedUntil };
  }

  if (admin.status === 'locked' || admin.status === 'disabled') {
    return { admin: null, remainingAttempts: 0, lockedUntil: admin.status === 'locked' ? admin.lockedUntil : null };
  }

  // P3-7: 静态 import bcryptjs，避免动态 import 开销
  const isPasswordValid = await bcrypt.compare(password, admin.passwordHash);

  if (!isPasswordValid) {
    const failedLoginCount = (admin.failedLoginCount || 0) + 1;
    let lockedUntil: Date | null = null;

    if (failedLoginCount >= LOGIN_ATTEMPTS_LIMIT) {
      lockedUntil = new Date(Date.now() + LOCK_DURATION_MINUTES * 60 * 1000);
    }

    await prisma.admin.update({
      where: { id: admin.id },
      data: {
        failedLoginCount,
        lockedUntil,
        status: lockedUntil ? 'locked' : admin.status,
      },
    });

    return {
      admin: null,
      remainingAttempts: Math.max(0, LOGIN_ATTEMPTS_LIMIT - failedLoginCount),
      lockedUntil,
    };
  }

  await prisma.admin.update({
    where: { id: admin.id },
    data: {
      failedLoginCount: 0,
      lockedUntil: null,
      status: 'active',
      lastLoginAt: new Date(),
      loginCount: (admin.loginCount || 0) + 1,
    },
  });

  return { admin, remainingAttempts: LOGIN_ATTEMPTS_LIMIT, lockedUntil: null };
}

export function hasRole(role: AdminRole, requiredRole: AdminRole): boolean {
  const roleHierarchy: Record<AdminRole, number> = {
    super_admin: 3,
    admin: 2,
    editor: 1,
  };
  return (roleHierarchy[role] || 0) >= (roleHierarchy[requiredRole] || 0);
}
