'use client';

import AdminGuard from '@/components/admin/AdminGuard';

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <AdminGuard>
      {children}
    </AdminGuard>
  );
}