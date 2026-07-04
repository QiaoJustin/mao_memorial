'use client';

import { useState, useEffect } from 'react';
import { Search, X } from 'lucide-react';
import Link from 'next/link';

interface SearchBarProps {
  placeholder?: string;
  initialValue?: string;
  showSuggestions?: boolean;
}

export default function SearchBar({
  placeholder = '搜索时间节点...',
  initialValue = '',
  showSuggestions = true,
}: SearchBarProps) {
  const [query, setQuery] = useState(initialValue);
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [isFocused, setIsFocused] = useState(false);

  useEffect(() => {
    if (!showSuggestions || !query || query.length < 2) {
      setSuggestions([]);
      return;
    }

    const fetchSuggestions = async () => {
      try {
        const response = await fetch(`/api/v1/search/suggest?q=${encodeURIComponent(query)}`);
        const data = await response.json();
        if (data.code === 200) {
          setSuggestions(data.data || []);
        }
      } catch {
        setSuggestions([]);
      }
    };

    const timer = setTimeout(fetchSuggestions, 300);
    return () => clearTimeout(timer);
  }, [query, showSuggestions]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (query.trim()) {
      window.location.href = `/search?q=${encodeURIComponent(query.trim())}`;
    }
  };

  return (
    <div className="relative w-full">
      <form onSubmit={handleSubmit}>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-text-light" />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onFocus={() => setIsFocused(true)}
            onBlur={() => setTimeout(() => setIsFocused(false), 200)}
            placeholder={placeholder}
            className="w-full pl-10 pr-10 py-3 rounded-lg bg-surface border border-border text-text placeholder-text-light focus:outline-none focus:border-accent focus:ring-1 focus:ring-accent transition-all"
          />
          {query && (
            <button
              type="button"
              onClick={() => setQuery('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-text-light hover:text-text transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>
      </form>

      {isFocused && suggestions.length > 0 && (
        <div className="absolute top-full left-0 right-0 mt-2 bg-surface border border-border rounded-lg shadow-lg z-50 max-h-64 overflow-y-auto">
          {suggestions.map((suggestion, index) => (
            <Link
              key={index}
              href={`/search?q=${encodeURIComponent(suggestion)}`}
              onClick={() => setIsFocused(false)}
              className="block px-4 py-3 text-sm text-text hover:bg-primary/5 hover:text-primary transition-colors border-b border-border last:border-b-0"
            >
              {suggestion}
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}