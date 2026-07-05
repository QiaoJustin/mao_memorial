'use client';

interface AdminPaginationProps {
  page: number;
  pageSize: number;
  total: number;
  onPageChange: (page: number) => void;
}

// P1-4: 抽取 admin 列表页通用分页组件
export function AdminPagination({ page, pageSize, total, onPageChange }: AdminPaginationProps) {
  const totalPages = Math.ceil(total / pageSize);
  if (total === 0) return null;

  return (
    <div className="px-4 py-4 border-t border-border flex items-center justify-between">
      <span className="text-sm text-text-light">共 {total.toLocaleString()} 条记录</span>
      <div className="flex items-center gap-2">
        {page > 1 && (
          <button
            onClick={() => onPageChange(page - 1)}
            className="px-3 py-1.5 text-sm border border-border rounded-lg hover:bg-bg transition-colors"
          >
            上一页
          </button>
        )}
        <span className="text-sm text-text-light">
          第 {page} 页 / 共 {totalPages} 页
        </span>
        {page < totalPages && (
          <button
            onClick={() => onPageChange(page + 1)}
            className="px-3 py-1.5 text-sm border border-border rounded-lg hover:bg-bg transition-colors"
          >
            下一页
          </button>
        )}
      </div>
    </div>
  );
}
