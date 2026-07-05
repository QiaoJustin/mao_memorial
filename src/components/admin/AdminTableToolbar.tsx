'use client';
import { Search, Plus } from 'lucide-react';
import Link from 'next/link';

interface AdminTableToolbarProps {
  searchValue: string;
  onSearchChange: (value: string) => void;
  searchPlaceholder?: string;
  newHref?: string;
  newLabel?: string;
  children?: React.ReactNode;
}

// P2-9: 抽取 admin 列表页通用工具栏组件（搜索 + 筛选 + 新增按钮）
export function AdminTableToolbar({
  searchValue,
  onSearchChange,
  searchPlaceholder = '搜索...',
  newHref,
  newLabel = '新增',
  children,
}: AdminTableToolbarProps) {
  return (
    <div className="card p-6 mb-6">
      <div className="flex flex-col md:flex-row md:items-center gap-4">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-text-light" />
          <input
            type="text"
            value={searchValue}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder={searchPlaceholder}
            className="w-full pl-10 pr-4 py-2 rounded-lg bg-bg border border-border text-text placeholder-text-light focus:outline-none focus:border-accent"
          />
        </div>
        {children && <div className="flex items-center gap-2">{children}</div>}
        {newHref && (
          <Link
            href={newHref}
            className="flex items-center gap-2 px-4 py-2 bg-accent text-white rounded-lg hover:bg-accent-light transition-colors"
          >
            <Plus className="w-5 h-5" />
            {newLabel}
          </Link>
        )}
      </div>
    </div>
  );
}
