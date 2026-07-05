'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/use-auth';
import { setRouter } from '@/lib/admin-fetch';

/**
 * P0-7 + P0-8: AdminGuard
 * - middleware 已在服务端校验 cookie 并重定向未登录用户
 * - 此组件做客户端 UX 优化：loading 状态 + 防止内容闪现（FOUC）
 * - 通过 /api/v1/auth/me 获取用户信息
 * - 使用路由组将登录页面与受保护页面分离，避免不必要的鉴权请求
 */
export default function AdminGuard({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const { user, isLoading } = useAuth();

  useEffect(() => {
    setRouter(router);
  }, [router]);

  useEffect(() => {
    if (!isLoading && !user) {
      router.replace('/admin/login');
    }
  }, [isLoading, user, router]);

  if (isLoading || !user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-bg">
        <div className="w-8 h-8 border-2 border-accent border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return <>{children}</>;
}
