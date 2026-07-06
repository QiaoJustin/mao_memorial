'use client';

import { useRouter } from 'next/navigation';
import { ADMIN_LOGIN_PATH } from '@/constants/navigation';

/**
 * P0-8: 管理后台 fetch 封装
 * - 自动携带 cookie（credentials: 'include'）
 * - 401 时跳转登录页
 * - 统一 JSON Content-Type
 *
 * 用法：
 *   const res = await adminFetch('/api/v1/admin/nodes');
 *   const data = await res.json();
 */

let routerRef: ReturnType<typeof useRouter> | null = null;

// 在 React 组件外无法直接用 useRouter，提供 setter 让顶层组件注入
export function setRouter(router: ReturnType<typeof useRouter>) {
  routerRef = router;
}

function redirectToLogin() {
  if (typeof window !== 'undefined') {
    if (routerRef) {
      routerRef.replace(ADMIN_LOGIN_PATH);
    } else {
      window.location.href = ADMIN_LOGIN_PATH;
    }
  }
}

export async function adminFetch(url: string, options: RequestInit = {}): Promise<Response> {
  const headers = new Headers(options.headers);
  // FormData 时让浏览器自动设置 multipart/form-data; boundary=...，不能手动设 Content-Type
  if (!headers.has('Content-Type') && options.body && !(options.body instanceof FormData)) {
    headers.set('Content-Type', 'application/json');
  }

  const res = await fetch(url, {
    ...options,
    headers,
    credentials: 'include',
  });

  if (res.status === 401) {
    redirectToLogin();
    throw new Error('未登录或登录已过期');
  }

  return res;
}
