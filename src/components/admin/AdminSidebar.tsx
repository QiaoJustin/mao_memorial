'use client';

import { usePathname } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/hooks/use-auth';
import { ROLE_LABELS } from '@/constants/labels';
import {
  LayoutDashboard,
  Clock,
  Image,
  Music,
  MessageSquare,
  Users,
  Shield,
  Settings,
  BarChart3,
  LogOut,
} from 'lucide-react';

interface AdminSidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

const menuItems = [
  { label: '仪表盘', href: '/admin/dashboard', icon: LayoutDashboard },
  { label: '节点管理', href: '/admin/nodes', icon: Clock },
  { label: '照片管理', href: '/admin/photos', icon: Image },
  { label: '音乐管理', href: '/admin/music', icon: Music },
  { label: '留言审核', href: '/admin/messages', icon: MessageSquare },
  { label: '数据统计', href: '/admin/stats', icon: BarChart3 },
  { label: '管理员管理', href: '/admin/admins', icon: Users, role: 'super_admin' },
  { label: '敏感词管理', href: '/admin/sensitive-words', icon: Shield, role: 'admin' },
  { label: '系统设置', href: '/admin/settings', icon: Settings },
];

export default function AdminSidebar({ isOpen, onClose }: AdminSidebarProps) {
  const pathname = usePathname();
  const { user, logout } = useAuth();

  const userRole = user?.role || 'editor';

  const hasAccess = (role?: string) => {
    if (!role) return true;
    const roleHierarchy: Record<string, number> = {
      super_admin: 3,
      admin: 2,
      editor: 1,
    };
    return (roleHierarchy[userRole] || 0) >= (roleHierarchy[role] || 0);
  };

  const roleLabel = ROLE_LABELS[userRole] || '编辑';

  return (
    <>
      <div
        className={`fixed inset-0 bg-black/50 z-40 md:hidden transition-opacity ${
          isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'
        }`}
        onClick={onClose}
      />
      <aside
        className={`fixed left-0 top-0 h-full bg-bg border-r border-border z-50 w-64 flex flex-col transition-transform duration-300 md:translate-x-0 ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="p-6 border-b border-border">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-accent flex items-center justify-center text-white font-bold">
              管
            </div>
            <div>
              <h1 className="font-bold text-text text-lg">后台管理</h1>
              <p className="text-xs text-text-light">{roleLabel}</p>
            </div>
          </div>
        </div>

        <nav className="flex-1 p-4 space-y-1">
          {menuItems
            .filter((item) => hasAccess(item.role))
            .map((item) => {
              const Icon = item.icon;
              const isActive = pathname === item.href;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={onClose}
                  className={`flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-colors ${
                    isActive
                      ? 'bg-primary/10 text-primary'
                      : 'text-text-light hover:bg-surface hover:text-text'
                  }`}
                >
                  <Icon className="w-5 h-5" />
                  {item.label}
                </Link>
              );
            })}
        </nav>

        <div className="p-4 border-t border-border">
          <button
            onClick={logout}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium text-text-light hover:bg-surface hover:text-text transition-colors"
          >
            <LogOut className="w-5 h-5" />
            退出登录
          </button>
        </div>
      </aside>
    </>
  );
}
