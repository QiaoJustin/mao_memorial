'use client';

import { useState } from 'react';
import { Filter, ArrowDown, Search } from 'lucide-react';

interface Era {
  id: number;
  name: string;
}

interface GalleryFilterProps {
  eras: Era[];
  selectedEra: string | undefined;
  onEraChange: (era: string | undefined) => void;
  searchQuery: string;
  onSearchChange: (query: string) => void;
}

export default function GalleryFilter({
  eras,
  selectedEra,
  onEraChange,
  searchQuery,
  onSearchChange,
}: GalleryFilterProps) {
  const [sortOpen, setSortOpen] = useState(false);
  const [sortBy, setSortBy] = useState<'asc' | 'desc'>('asc');

  const handleSortChange = (sort: 'asc' | 'desc') => {
    setSortBy(sort);
    setSortOpen(false);
  };

  return (
    <div className="bg-surface rounded-lg p-4 mb-6">
      <div className="flex flex-col md:flex-row md:items-center gap-4">
        <div className="flex-1">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-text-light" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => onSearchChange(e.target.value)}
              placeholder="搜索照片说明..."
              className="w-full pl-10 pr-4 py-2 rounded-lg bg-bg border border-border text-text placeholder-text-light focus:outline-none focus:border-accent transition-colors"
            />
          </div>
        </div>

        <div className="flex items-center gap-2 overflow-x-auto scrollbar-hide">
          <span className="text-sm text-text-light whitespace-nowrap flex-shrink-0">年代：</span>
          <button
            onClick={() => onEraChange(undefined)}
            className={`px-3 py-1.5 rounded-full text-sm whitespace-nowrap transition-colors flex-shrink-0 ${
              !selectedEra
                ? 'bg-accent text-white'
                : 'bg-bg text-text-light hover:bg-primary/10 hover:text-primary'
            }`}
          >
            全部
          </button>
          {eras.map((era) => (
            <button
              key={era.id}
              onClick={() => onEraChange(era.name)}
              className={`px-3 py-1.5 rounded-full text-sm whitespace-nowrap transition-colors flex-shrink-0 ${
                selectedEra === era.name
                  ? 'bg-accent text-white'
                  : 'bg-bg text-text-light hover:bg-primary/10 hover:text-primary'
              }`}
            >
              {era.name}
            </button>
          ))}
        </div>

        <div className="relative">
          <button
            onClick={() => setSortOpen(!sortOpen)}
            className="flex items-center gap-2 px-4 py-2 rounded-lg bg-bg border border-border text-text-light hover:border-accent transition-colors"
          >
            <Filter className="w-4 h-4" />
            <span className="text-sm">
              {sortBy === 'asc' ? '时间正序' : '时间倒序'}
            </span>
            <ArrowDown className={`w-4 h-4 transition-transform ${sortOpen ? 'rotate-180' : ''}`} />
          </button>

          {sortOpen && (
            <div className="absolute top-full right-0 mt-2 bg-surface border border-border rounded-lg shadow-lg z-50 min-w-[140px]">
              <button
                onClick={() => handleSortChange('asc')}
                className={`block w-full px-4 py-2 text-sm text-left transition-colors ${
                  sortBy === 'asc' ? 'bg-primary/10 text-primary' : 'text-text hover:bg-bg'
                }`}
              >
                时间正序
              </button>
              <button
                onClick={() => handleSortChange('desc')}
                className={`block w-full px-4 py-2 text-sm text-left transition-colors ${
                  sortBy === 'desc' ? 'bg-primary/10 text-primary' : 'text-text hover:bg-bg'
                }`}
              >
                时间倒序
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}