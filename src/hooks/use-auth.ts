'use client';

import { useEffect, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';

/**
 * P0-8: 客户端鉴权 hook
 * 由于 httpOnly cookie JS 无法直接读取，必须调用 /api/v1/auth/me 验证登录状态
 * middleware 已在服务端做重定向，此 hook 主要是 UX 优化（提供 loading 状态）
 */

export interface CurrentUser {
  id: number;
  username: string;
  name: string;
  email: string;
  role: string;
  avatarUrl: string | null;
  lastLoginAt: string;
  loginCount: number;
  createdAt: string;
}

interface UseAuthResult {
  user: CurrentUser | null;
  isLoading: boolean;
  error: Error | null;
  refresh: () => Promise<void>;
  logout: () => Promise<void>;
}

export function useAuth(): UseAuthResult {
  const router = useRouter();
  const [user, setUser] = useState<CurrentUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const refresh = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const res = await fetch('/api/v1/auth/me', { credentials: 'include' });
      const data = await res.json();
      if (data.code === 200) {
        setUser(data.data);
      } else {
        setUser(null);
        if (data.code === 401) {
          const currentPath = typeof window !== 'undefined' ? window.location.pathname : '';
          if (currentPath !== '/admin/login') {
            router.replace('/admin/login');
          }
        }
      }
    } catch (err) {
      setUser(null);
      setError(err as Error);
    } finally {
      setIsLoading(false);
    }
  }, [router]);

  const logout = useCallback(async () => {
    try {
      await fetch('/api/v1/auth/logout', {
        method: 'POST',
        credentials: 'include',
      });
    } catch {
      // 忽略错误，仍跳转登录页
    }
    setUser(null);
    router.replace('/admin/login');
  }, [router]);

  useEffect(() => {
    refresh();
  }, [refresh]);

  return { user, isLoading, error, refresh, logout };
}
