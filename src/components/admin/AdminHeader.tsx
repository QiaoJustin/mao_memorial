'use client';

import { useState } from 'react';
import { Menu, User, Bell } from 'lucide-react';
import { useAuth } from '@/hooks/use-auth';

interface AdminHeaderProps {
  onMenuToggle: () => void;
  title: string;
  breadcrumbs?: { label: string; href?: string }[];
}

export default function AdminHeader({ onMenuToggle, title, breadcrumbs }: AdminHeaderProps) {
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const { user, logout } = useAuth();

  const displayName = user?.name || user?.username || '未知用户';
  const displayRole = user?.role || 'editor';

  const roleLabel = displayRole === 'super_admin' ? '超级管理员' : displayRole === 'admin' ? '管理员' : '编辑';

  return (
    <header className="h-16 bg-surface border-b border-border flex items-center justify-between px-6 sticky top-0 z-30">
      <div className="flex items-center gap-4">
        <button
          onClick={onMenuToggle}
          className="md:hidden p-2 rounded-lg hover:bg-bg transition-colors"
        >
          <Menu className="w-5 h-5 text-text" />
        </button>
        <div>
          <h2 className="text-lg font-bold text-text">{title}</h2>
          {breadcrumbs && breadcrumbs.length > 0 && (
            <nav className="flex items-center gap-2 text-xs text-text-light mt-1">
              {breadcrumbs.map((crumb, index) => (
                <span key={index}>
                  {index > 0 && <span className="mx-1">/</span>}
                  {crumb.href ? (
                    <a href={crumb.href} className="hover:text-primary transition-colors">
                      {crumb.label}
                    </a>
                  ) : (
                    <span>{crumb.label}</span>
                  )}
                </span>
              ))}
            </nav>
          )}
        </div>
      </div>

      <div className="flex items-center gap-4">
        <button className="relative p-2 rounded-lg hover:bg-bg transition-colors">
          <Bell className="w-5 h-5 text-text-light" />
          <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full" />
        </button>

        <div className="relative">
          <button
            onClick={() => setUserMenuOpen(!userMenuOpen)}
            className="flex items-center gap-3 p-2 rounded-lg hover:bg-bg transition-colors"
          >
            <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary font-medium">
              {displayName.charAt(0)}
            </div>
            <div className="text-left hidden sm:block">
              <p className="text-sm font-medium text-text">{displayName}</p>
              <p className="text-xs text-text-light">{roleLabel}</p>
            </div>
          </button>

          {userMenuOpen && (
            <div className="absolute right-0 top-full mt-2 w-48 bg-surface border border-border rounded-lg shadow-lg z-50">
              <div className="p-4 border-b border-border">
                <p className="text-sm font-medium text-text">{displayName}</p>
                <p className="text-xs text-text-light">{roleLabel}</p>
              </div>
              <button
                onClick={logout}
                className="w-full px-4 py-3 text-left text-sm text-text-light hover:bg-bg hover:text-text transition-colors"
              >
                退出登录
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
