'use client';

import { useState, useEffect } from 'react';
import { Menu, Bell, X, Clock, MessageSquare } from 'lucide-react';
import { useAuth } from '@/hooks/use-auth';
import { adminFetch } from '@/lib/admin-fetch';
import { ROLE_LABELS, DEFAULT_ROLE } from '@/constants/labels';
import { API } from '@/constants/api';

interface AdminHeaderProps {
  onMenuToggle: () => void;
  title: string;
  breadcrumbs?: { label: string; href?: string }[];
}

interface Notification {
  id: number;
  nickname: string;
  content: string;
  createdAt: string;
}

export default function AdminHeader({ onMenuToggle, title, breadcrumbs }: AdminHeaderProps) {
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [notificationOpen, setNotificationOpen] = useState(false);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [pendingCount, setPendingCount] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const { user, logout } = useAuth();

  const displayName = user?.name || user?.username || '未知用户';
  const displayRole = user?.role || DEFAULT_ROLE;

  const roleLabel = ROLE_LABELS[displayRole] || '编辑';

  useEffect(() => {
    fetchNotifications();
  }, []);

  const fetchNotifications = async () => {
    setIsLoading(true);
    try {
      const res = await adminFetch(API.ADMIN.MESSAGES_PENDING);
      const data = await res.json();
      if (data.code === 200) {
        setNotifications(data.data.list);
        setPendingCount(data.data.total);
      }
    } catch {
      setNotifications([]);
      setPendingCount(0);
    } finally {
      setIsLoading(false);
    }
  };

  const handleNotificationClick = () => {
    setNotificationOpen(!notificationOpen);
    if (!notificationOpen) {
      fetchNotifications();
    }
  };

  const formatTime = (dateStr: string) => {
    const date = new Date(dateStr);
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);

    if (minutes < 1) return '刚刚';
    if (minutes < 60) return `${minutes}分钟前`;
    if (hours < 24) return `${hours}小时前`;
    if (days < 7) return `${days}天前`;
    return dateStr.substring(0, 10);
  };

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
        <div className="relative">
          <button
            onClick={handleNotificationClick}
            className="relative p-2 rounded-lg hover:bg-bg transition-colors"
          >
            <Bell className="w-5 h-5 text-text-light" />
            {pendingCount > 0 && (
              <span className="absolute top-1 right-1 min-w-[18px] h-[18px] bg-red-500 text-white text-xs rounded-full flex items-center justify-center px-1">
                {pendingCount > 99 ? '99+' : pendingCount}
              </span>
            )}
          </button>

          {notificationOpen && (
            <div className="absolute right-0 top-full mt-2 w-80 bg-surface border border-border rounded-lg shadow-lg z-50">
              <div className="flex items-center justify-between p-4 border-b border-border">
                <h3 className="text-sm font-semibold text-text">消息通知</h3>
                <button
                  onClick={() => setNotificationOpen(false)}
                  className="p-1 hover:bg-bg rounded transition-colors"
                >
                  <X className="w-4 h-4 text-text-light" />
                </button>
              </div>
              <div className="max-h-80 overflow-y-auto">
                {isLoading ? (
                  <div className="p-4 text-center">
                    <div className="inline-block w-5 h-5 border-2 border-accent border-t-transparent rounded-full animate-spin" />
                  </div>
                ) : notifications.length === 0 ? (
                  <div className="p-8 text-center text-text-light">
                    <Bell className="w-10 h-10 mx-auto mb-2 opacity-50" />
                    <p className="text-sm">暂无待审核消息</p>
                  </div>
                ) : (
                  <div className="divide-y divide-border">
                    {notifications.map((notification) => (
                      <a
                        key={notification.id}
                        href={`/admin/messages?status=pending`}
                        className="p-4 hover:bg-bg transition-colors block"
                      >
                        <div className="flex items-start gap-3">
                          <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                            <MessageSquare className="w-4 h-4 text-primary" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-text truncate">{notification.nickname}</p>
                            <p className="text-xs text-text-light truncate mt-1">{notification.content}</p>
                            <div className="flex items-center gap-1 mt-2 text-xs text-text-light">
                              <Clock className="w-3 h-3" />
                              {formatTime(notification.createdAt)}
                            </div>
                          </div>
                        </div>
                      </a>
                    ))}
                  </div>
                )}
              </div>
              {pendingCount > 0 && (
                <div className="p-3 border-t border-border">
                  <a
                    href="/admin/messages?status=pending"
                    className="block text-center text-sm text-accent hover:text-accent-dark transition-colors"
                  >
                    查看全部 ({pendingCount})
                  </a>
                </div>
              )}
            </div>
          )}
        </div>

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
