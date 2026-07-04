'use client';

import { useState, useEffect } from 'react';
import { Menu, User, Bell } from 'lucide-react';

interface AdminHeaderProps {
  onMenuToggle: () => void;
  title: string;
  breadcrumbs?: { label: string; href?: string }[];
}

interface UserInfo {
  name: string;
  role: string;
}

export default function AdminHeader({ onMenuToggle, title, breadcrumbs }: AdminHeaderProps) {
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [user, setUser] = useState<UserInfo>({ name: '未知用户', role: 'editor' });

  useEffect(() => {
    const token = localStorage.getItem('admin-token');
    if (!token) {
      setUser({ name: '未知用户', role: 'editor' });
      return;
    }
    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      setUser({ name: payload.username || '未知用户', role: payload.role || 'editor' });
    } catch {
      setUser({ name: '未知用户', role: 'editor' });
    }
  }, []);

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
              {user.name.charAt(0)}
            </div>
            <div className="text-left hidden sm:block">
              <p className="text-sm font-medium text-text">{user.name}</p>
              <p className="text-xs text-text-light">
                {user.role === 'super_admin' ? '超级管理员' : user.role === 'admin' ? '管理员' : '编辑'}
              </p>
            </div>
          </button>

          {userMenuOpen && (
            <div className="absolute right-0 top-full mt-2 w-48 bg-surface border border-border rounded-lg shadow-lg z-50">
              <div className="p-4 border-b border-border">
                <p className="text-sm font-medium text-text">{user.name}</p>
                <p className="text-xs text-text-light">
                  {user.role === 'super_admin' ? '超级管理员' : user.role === 'admin' ? '管理员' : '编辑'}
                </p>
              </div>
              <button
                onClick={() => {
                  localStorage.removeItem('admin-token');
                  window.location.href = '/admin/login';
                }}
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