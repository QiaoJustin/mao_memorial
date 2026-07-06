'use client';

import { useState } from 'react';
import AdminGuard from '@/components/admin/AdminGuard';
import AdminSidebar from '@/components/admin/AdminSidebar';
import AdminHeader from '@/components/admin/AdminHeader';
import { usePathname } from 'next/navigation';

// 从路径推导页面标题
const PAGE_TITLES: Record<string, string> = {
  '/admin/dashboard': '仪表盘',
  '/admin/nodes': '节点管理',
  '/admin/photos': '照片管理',
  '/admin/messages': '留言审核',
  '/admin/admins': '管理员管理',
  '/admin/sensitive-words': '敏感词管理',
  '/admin/settings': '系统设置',
  '/admin/stats': '数据统计',
};

function getPageTitle(pathname: string): string {
  // 先精确匹配
  if (PAGE_TITLES[pathname]) return PAGE_TITLES[pathname];
  // 前缀匹配
  for (const [path, title] of Object.entries(PAGE_TITLES)) {
    if (pathname.startsWith(path + '/')) return title;
  }
  return '管理后台';
}

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const pathname = usePathname();
  const title = getPageTitle(pathname);

  return (
    <AdminGuard>
      <div className="min-h-screen bg-bg">
        <AdminSidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
        <div className="md:ml-64">
          <AdminHeader
            onMenuToggle={() => setSidebarOpen(!sidebarOpen)}
            title={title}
          />
          <main className="p-6">
            {children}
          </main>
        </div>
      </div>
    </AdminGuard>
  );
}