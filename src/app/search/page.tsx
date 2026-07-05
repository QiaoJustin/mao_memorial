'use client';

import { useState, useEffect, use } from 'react';
import Link from 'next/link';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import SearchBar from '@/components/SearchBar';
import { Search, ArrowRight, TrendingUp, Clock, X } from 'lucide-react';

interface SearchResult {
  id: number;
  title: string;
  description: string;
  date: string;
  relevanceScore: number;
  thumbnailUrl?: string;
}

interface HotSearch {
  keyword: string;
  count: number;
}

interface PageProps {
  searchParams: Promise<{
    q?: string;
  }>;
}

const SEARCH_HISTORY_KEY = 'mao-memorial-search-history';
const MAX_HISTORY = 5;

export default function SearchPage({ searchParams }: PageProps) {
  const resolvedParams = use(searchParams);
  const [query, setQuery] = useState(resolvedParams.q || '');
  const [results, setResults] = useState<SearchResult[]>([]);
  const [total, setTotal] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [hotSearch, setHotSearch] = useState<HotSearch[]>([]);
  const [searchHistory, setSearchHistory] = useState<string[]>([]);

  useEffect(() => {
    const history = localStorage.getItem(SEARCH_HISTORY_KEY);
    if (history) {
      setSearchHistory(JSON.parse(history));
    }
  }, []);

  useEffect(() => {
    async function fetchHotSearch() {
      try {
        const res = await fetch('/api/v1/search/hot', { cache: 'force-cache' });
        const data = await res.json();
        setHotSearch(data.data || []);
      } catch {
        setHotSearch([]);
      }
    }
    fetchHotSearch();
  }, []);

  useEffect(() => {
    if (!query.trim()) {
      setResults([]);
      setTotal(0);
      return;
    }

    // P3-7: 同步 query 到 URL，便于分享与收藏（replaceState 不触发重新渲染）
    const newUrl = `/search?q=${encodeURIComponent(query)}`;
    window.history.replaceState(null, '', newUrl);

    // P0-5: 添加 AbortController 取消旧请求，避免快速输入时的竞态
    const controller = new AbortController();
    setIsLoading(true);

    const timer = setTimeout(async () => {
      try {
        const res = await fetch(
          `/api/v1/search?q=${encodeURIComponent(query)}&page=1&pageSize=10`,
          { signal: controller.signal }
        );
        const data = await res.json();

        if (controller.signal.aborted) return;

        if (data.code === 200) {
          setResults(data.data.items || []);
          setTotal(data.data.total || 0);

          // P0-5: 使用函数式更新，避免将 searchHistory 放入依赖数组导致无限循环
          setSearchHistory((prev) => {
            const newHistory = [query, ...prev.filter((h) => h !== query)].slice(0, MAX_HISTORY);
            localStorage.setItem(SEARCH_HISTORY_KEY, JSON.stringify(newHistory));
            return newHistory;
          });
        } else {
          setResults([]);
          setTotal(0);
        }
      } catch (e) {
        if ((e as Error).name !== 'AbortError') {
          setResults([]);
          setTotal(0);
        }
      } finally {
        if (!controller.signal.aborted) setIsLoading(false);
      }
    }, 300);

    return () => {
      controller.abort();
      clearTimeout(timer);
    };
  }, [query]);

  const handleRemoveHistory = (keyword: string) => {
    const newHistory = searchHistory.filter((h) => h !== keyword);
    setSearchHistory(newHistory);
    localStorage.setItem(SEARCH_HISTORY_KEY, JSON.stringify(newHistory));
  };

  const handleClearHistory = () => {
    setSearchHistory([]);
    localStorage.removeItem(SEARCH_HISTORY_KEY);
  };

  return (
    <div className="min-h-screen bg-bg">
      <Header />

      <section className="pt-24 pb-12 bg-gradient-crimson">
        <div className="container-page">
          <h1 className="font-serif text-3xl md:text-4xl font-bold text-white mb-4">搜索</h1>
          <p className="text-white/80 mb-6">搜索毛泽东主席生平中的时间节点和事件</p>
          <div className="max-w-xl">
            <SearchBar
              placeholder="搜索时间节点、事件..."
              initialValue={query}
              showSuggestions={true}
            />
          </div>
        </div>
      </section>

      <section className="py-12 bg-bg">
        <div className="container-page">
          {query ? (
            <div>
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-2">
                  <Search className="w-5 h-5 text-text-light" />
                  <span className="text-text-light">
                    搜索 &quot;<span className="text-text font-medium">{query}</span>&quot; 的结果
                  </span>
                </div>
                <span className="text-sm text-text-light">
                  共 {total.toLocaleString()} 条记录
                </span>
              </div>

              {isLoading ? (
                <div className="text-center py-16">
                  <div className="inline-block w-6 h-6 border-2 border-accent border-t-transparent rounded-full animate-spin" />
                </div>
              ) : results.length > 0 ? (
                <div className="space-y-4">
                  {results.map((result) => (
                    <Link
                      key={result.id}
                      href={`/timeline/${result.id}`}
                      className="card group flex flex-col md:flex-row gap-4 p-4 hover:shadow-lg transition-all"
                    >
                      {result.thumbnailUrl && (
                        <div className="w-full md:w-48 h-32 md:h-40 rounded-lg overflow-hidden flex-shrink-0">
                          <img
                            src={result.thumbnailUrl}
                            alt={result.title}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                          />
                        </div>
                      )}
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <span className="tag bg-accent/10 text-accent text-xs">
                            相关度 {result.relevanceScore}%
                          </span>
                          <span className="text-xs text-text-light">{result.date}</span>
                        </div>
                        <h3 className="font-serif font-semibold text-text text-lg mb-2 group-hover:text-accent transition-colors">
                          {result.title}
                        </h3>
                        <p className="text-sm text-text-light line-clamp-2">{result.description}</p>
                      </div>
                      <ArrowRight className="w-5 h-5 text-text-light group-hover:text-accent group-hover:translate-x-1 transition-all" />
                    </Link>
                  ))}
                </div>
              ) : (
                <div className="text-center py-16">
                  <Search className="w-12 h-12 text-text-light/30 mx-auto mb-4" />
                  <p className="text-text-light">没有找到相关结果</p>
                  <p className="text-sm text-text-light/60 mt-2">请尝试其他关键词</p>
                </div>
              )}
            </div>
          ) : (
            <div className="space-y-8">
              {searchHistory.length > 0 && (
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-2">
                      <Clock className="w-5 h-5 text-text-light" />
                      <h2 className="font-serif text-xl font-semibold text-text">搜索历史</h2>
                    </div>
                    <button
                      onClick={handleClearHistory}
                      className="text-sm text-text-light hover:text-primary transition-colors"
                    >
                      清空
                    </button>
                  </div>

                  <div className="flex flex-wrap gap-2">
                    {searchHistory.map((keyword) => (
                      <div
                        key={keyword}
                        className="flex items-center gap-2 px-3 py-2 bg-surface rounded-lg"
                      >
                        <Link
                          href={`/search?q=${encodeURIComponent(keyword)}`}
                          onClick={() => setQuery(keyword)}
                          className="text-text hover:text-accent transition-colors"
                        >
                          {keyword}
                        </Link>
                        <button
                          onClick={() => handleRemoveHistory(keyword)}
                          className="text-text-light hover:text-text transition-colors"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <div>
                <div className="flex items-center gap-2 mb-6">
                  <TrendingUp className="w-5 h-5 text-accent" />
                  <h2 className="font-serif text-xl font-semibold text-text">热门搜索</h2>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {hotSearch.map((item, index) => (
                    <Link
                      key={index}
                      href={`/search?q=${encodeURIComponent(item.keyword)}`}
                      onClick={() => setQuery(item.keyword)}
                      className="flex items-center justify-between p-4 bg-surface rounded-lg hover:bg-primary/5 transition-colors group"
                    >
                      <div className="flex items-center gap-3">
                        <span className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${
                          index < 3 ? 'bg-accent text-white' : 'bg-surface-dark text-text-light'
                        }`}>
                          {index + 1}
                        </span>
                        <span className="text-text group-hover:text-accent transition-colors">
                          {item.keyword}
                        </span>
                      </div>
                      <span className="text-sm text-text-light">{item.count.toLocaleString()}次</span>
                    </Link>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      </section>

      <Footer />
    </div>
  );
}