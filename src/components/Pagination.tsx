'use client';

import Link from 'next/link';
import { ChevronLeft, ChevronRight } from 'lucide-react';

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  baseUrl: string;
}

export default function Pagination({ currentPage, totalPages, baseUrl }: PaginationProps) {
  if (totalPages <= 1) return null;

  const getPageUrl = (page: number) => {
    const url = new URL(baseUrl, window.location.origin);
    url.searchParams.set('page', page.toString());
    return url.pathname + url.search;
  };

  const renderPageNumbers = () => {
    const pages = [];
    const maxVisible = 5;
    let start = Math.max(1, currentPage - Math.floor(maxVisible / 2));
    const end = Math.min(totalPages, start + maxVisible - 1);

    if (end - start + 1 < maxVisible) {
      start = Math.max(1, end - maxVisible + 1);
    }

    if (start > 1) {
      pages.push(
        <Link
          key={1}
          href={getPageUrl(1)}
          className="px-3 py-1 rounded-lg text-sm text-text-light hover:text-primary hover:bg-surface transition-colors"
        >
          1
        </Link>
      );
      if (start > 2) {
        pages.push(<span key="dots-start" className="px-2 text-text-light">...</span>);
      }
    }

    for (let i = start; i <= end; i++) {
      pages.push(
        <Link
          key={i}
          href={getPageUrl(i)}
          className={`px-3 py-1 rounded-lg text-sm font-medium transition-colors ${
            i === currentPage
              ? 'bg-primary text-white'
              : 'text-text-light hover:text-primary hover:bg-surface'
          }`}
        >
          {i}
        </Link>
      );
    }

    if (end < totalPages) {
      if (end < totalPages - 1) {
        pages.push(<span key="dots-end" className="px-2 text-text-light">...</span>);
      }
      pages.push(
        <Link
          key={totalPages}
          href={getPageUrl(totalPages)}
          className="px-3 py-1 rounded-lg text-sm text-text-light hover:text-primary hover:bg-surface transition-colors"
        >
          {totalPages}
        </Link>
      );
    }

    return pages;
  };

  return (
    <div className="flex items-center justify-center gap-2">
      <Link
        href={getPageUrl(currentPage - 1)}
        className={`p-2 rounded-lg transition-colors ${
          currentPage === 1
            ? 'text-text-light/30 cursor-not-allowed'
            : 'text-text-light hover:text-primary hover:bg-surface'
        }`}
      >
        <ChevronLeft className="w-5 h-5" />
      </Link>
      {renderPageNumbers()}
      <Link
        href={getPageUrl(currentPage + 1)}
        className={`p-2 rounded-lg transition-colors ${
          currentPage === totalPages
            ? 'text-text-light/30 cursor-not-allowed'
            : 'text-text-light hover:text-primary hover:bg-surface'
        }`}
      >
        <ChevronRight className="w-5 h-5" />
      </Link>
    </div>
  );
}