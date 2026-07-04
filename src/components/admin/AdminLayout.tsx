'use client';

import { useState } from 'react';
import AdminSidebar from './AdminSidebar';
import AdminHeader from './AdminHeader';

interface AdminLayoutProps {
  children: React.ReactNode;
  title: string;
  breadcrumbs?: { label: string; href?: string }[];
}

export default function AdminLayout({ children, title, breadcrumbs }: AdminLayoutProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="min-h-screen bg-bg">
      <AdminSidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      <div className="md:ml-64">
        <AdminHeader
          onMenuToggle={() => setSidebarOpen(!sidebarOpen)}
          title={title}
          breadcrumbs={breadcrumbs}
        />
        <main className="p-6">
          {children}
        </main>
      </div>
    </div>
  );
}