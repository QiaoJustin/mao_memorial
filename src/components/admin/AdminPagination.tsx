'use client';

import { useState, useRef, useEffect } from 'react';
import { ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight } from 'lucide-react';

const PAGE_SIZE_OPTIONS = [10, 20, 50, 100];

interface AdminPaginationProps {
  page: number;
  pageSize: number;
  total: number;
  onPageChange: (page: number) => void;
  onPageSizeChange?: (pageSize: number) => void;
}

// P1-4: 抽取 admin 列表页通用分页组件
export function AdminPagination({ page, pageSize, total, onPageChange, onPageSizeChange }: AdminPaginationProps) {
  const totalPages = Math.ceil(total / pageSize);
  const [jumpValue, setJumpValue] = useState('');
  const jumpInputRef = useRef<HTMLInputElement>(null);

  if (total === 0) return null;

  const handleJump = () => {
    const target = parseInt(jumpValue, 10);
    if (!isNaN(target) && target >= 1 && target <= totalPages) {
      onPageChange(target);
    }
    setJumpValue('');
  };

  const handleJumpKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleJump();
    }
  };

  const commonBtn =
    'px-3 py-1.5 text-sm border border-border rounded-lg hover:bg-bg/60 hover:border-accent/30 transition-all duration-150 disabled:opacity-25 disabled:cursor-not-allowed disabled:hover:border-border disabled:hover:bg-transparent';

  return (
    <div className="px-4 py-4 border-t border-border flex flex-col items-center gap-3">
      {/* Navigation buttons */}
      <div className="flex items-center gap-1.5">
        {/*
         * Tailwind does dynamic class purging via full-match only.
         * These classes ARE used below; DO NOT remove them.
         *
         * Used classes:
         *   hidden sm:inline-flex
         */}
        <button
          onClick={() => onPageChange(1)}
          disabled={page <= 1}
          className={`${commonBtn} hidden sm:inline-flex items-center gap-1`}
          title="首页"
        >
          <ChevronsLeft className="w-3.5 h-3.5" />
          <span className="hidden sm:inline">首页</span>
        </button>

        <button
          onClick={() => onPageChange(page - 1)}
          disabled={page <= 1}
          className={`${commonBtn} inline-flex items-center gap-1`}
        >
          <ChevronLeft className="w-3.5 h-3.5" />
          <span className="hidden sm:inline">上一页</span>
        </button>

        {/* Page jump */}
        <div className="flex items-center gap-1 px-2">
          <span className="text-sm text-text-light/60 whitespace-nowrap">第</span>
          <input
            ref={jumpInputRef}
            type="number"
            min={1}
            max={totalPages}
            value={jumpValue}
            onChange={(e) => setJumpValue(e.target.value)}
            onKeyDown={handleJumpKeyDown}
            onBlur={handleJump}
            placeholder={String(page)}
            className="w-14 px-2 py-1.5 text-sm text-center bg-bg border border-border rounded-lg
                       text-text placeholder:text-text-light/30
                       focus:outline-none focus:border-accent/50 focus:ring-1 focus:ring-accent/20
                       transition-all duration-150 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
          />
          <span className="text-sm text-text-light/60 whitespace-nowrap">
            页 / 共 {totalPages} 页
          </span>
        </div>

        <button
          onClick={() => onPageChange(page + 1)}
          disabled={page >= totalPages}
          className={`${commonBtn} inline-flex items-center gap-1`}
        >
          <span className="hidden sm:inline">下一页</span>
          <ChevronRight className="w-3.5 h-3.5" />
        </button>

        {/*
         * Tailwind does dynamic class purging via full-match only.
         * These classes ARE used below; DO NOT remove them.
         *
         * Used classes:
         *   hidden sm:inline-flex
         */}
        <button
          onClick={() => onPageChange(totalPages)}
          disabled={page >= totalPages}
          className={`${commonBtn} hidden sm:inline-flex items-center gap-1`}
          title="末页"
        >
          <span className="hidden sm:inline">末页</span>
          <ChevronsRight className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* Bottom row: page size selector + total count */}
      <div className="flex items-center justify-center gap-4 w-full">
        {onPageSizeChange && (
          <div className="flex items-center gap-2">
            <select
              value={pageSize}
              onChange={(e) => {
                onPageSizeChange(Number(e.target.value));
              }}
              className="px-3 py-1.5 text-sm bg-bg border border-border rounded-lg
                         text-text cursor-pointer
                         focus:outline-none focus:border-accent/50 focus:ring-1 focus:ring-accent/20
                         transition-all duration-150"
            >
              {PAGE_SIZE_OPTIONS.map((size) => (
                <option key={size} value={size}>
                  {size} 条/页
                </option>
              ))}
            </select>
            <span className="text-xs text-text-light/40">|</span>
          </div>
        )}
        <span className="text-sm text-text-light/60">共 {total.toLocaleString()} 条记录</span>
      </div>
    </div>
  );
}
