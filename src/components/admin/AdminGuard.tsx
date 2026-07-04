'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { decodeToken } from '@/lib/auth';

export default function AdminGuard({ children }: { children: React.ReactNode }) {
  const router = useRouter();

  useEffect(() => {
    const token = localStorage.getItem('admin-token');
    const payload = token ? decodeToken(token) : null;
    
    if (!token || !payload) {
      router.push('/admin/login');
      return;
    }
  }, [router]);

  return <>{children}</>;
}