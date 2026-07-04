import jwt from 'jsonwebtoken';
import { prisma } from './db';
import type { Admin } from '@prisma/client';

const JWT_SECRET = process.env.JWT_SECRET || 'mao-memorial-secret-key';
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '24h';
const LOGIN_ATTEMPTS_LIMIT = 5;
const LOCK_DURATION_MINUTES = 30;

export interface TokenPayload {
  id: number;
  username: string;
  role: string;
}

export function generateToken(admin: Admin): string {
  const payload: TokenPayload = {
    id: Number(admin.id),
    username: admin.username,
    role: admin.role,
  };
  return jwt.sign(payload, JWT_SECRET as string, { expiresIn: JWT_EXPIRES_IN as jwt.SignOptions['expiresIn'] });
}

export function verifyToken(token: string): TokenPayload | null {
  try {
    return jwt.verify(token, JWT_SECRET as string) as TokenPayload;
  } catch {
    return null;
  }
}

export function decodeToken(token: string): TokenPayload | null {
  try {
    return jwt.decode(token) as TokenPayload;
  } catch {
    return null;
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

  const isPasswordValid = await import('bcryptjs').then(({ compare }) => compare(password, admin.passwordHash));
  
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

export function hasRole(role: string, requiredRole: string): boolean {
  const roleHierarchy: Record<string, number> = {
    super_admin: 3,
    admin: 2,
    editor: 1,
  };
  return (roleHierarchy[role] || 0) >= (roleHierarchy[requiredRole] || 0);
}

export function requireRole(role: string, requiredRole: string): boolean {
  return hasRole(role, requiredRole);
}
