'use client';

import { useState, useEffect } from 'react';
import AdminLayout from '@/components/admin/AdminLayout';
import { adminFetch } from '@/lib/admin-fetch';
import { TrendingUp, Users, Globe, FileText } from 'lucide-react';

interface StatsData {
  pv: number;
  uv: number;
  dailyStats: { date: string; pv: number }[];
  pageStats: { path: string; count: number }[];
  refererStats: { referer: string; count: number }[];
}

export default function StatsPage() {
  const [data, setData] = useState<StatsData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [days, setDays] = useState(30);

  useEffect(() => {
    fetchStats();
  }, [days]);

  const fetchStats = async () => {
    setIsLoading(true);
    try {
      const res = await adminFetch(`/api/v1/admin/stats/traffic?days=${days}`);
      const result = await res.json();
      if (result.code === 200) {
        setData(result.data);
      }
    } catch {
      setData(null);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AdminLayout title="数据统计" breadcrumbs={[{ label: '数据统计' }]}>
      <div className="card p-6 mb-6 flex items-center justify-between">
        <h3 className="font-semibold text-text">统计周期</h3>
        <div className="flex items-center gap-2">
          {[7, 14, 30, 90].map((d) => (
            <button
              key={d}
              onClick={() => setDays(d)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                days === d ? 'bg-accent text-white' : 'bg-bg text-text-light hover:text-text'
              }`}
            >
              {d}天
            </button>
          ))}
        </div>
      </div>

      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {[1, 2].map((i) => (
            <div key={i} className="card p-6 animate-pulse">
              <div className="h-6 w-24 bg-text-light/20 rounded mb-2" />
              <div className="h-8 w-32 bg-text-light/20 rounded" />
            </div>
          ))}
        </div>
      ) : data ? (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            <div className="card p-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-12 h-12 rounded-lg bg-blue-500 flex items-center justify-center">
                  <TrendingUp className="w-6 h-6 text-white" />
                </div>
                <div>
                  <p className="text-text-light text-sm">总访问量（PV）</p>
                  <p className="text-3xl font-bold text-text">{data.pv.toLocaleString()}</p>
                </div>
              </div>
            </div>

            <div className="card p-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-12 h-12 rounded-lg bg-green-500 flex items-center justify-center">
                  <Users className="w-6 h-6 text-white" />
                </div>
                <div>
                  <p className="text-text-light text-sm">独立访客（UV）</p>
                  <p className="text-3xl font-bold text-text">{data.uv.toLocaleString()}</p>
                </div>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="card p-6">
              <h3 className="font-semibold text-text mb-4">访问趋势</h3>
              {data.dailyStats.length > 0 ? (
                <div className="space-y-2">
                  {data.dailyStats.map((item) => (
                    <div key={item.date} className="flex items-center gap-3">
                      <span className="text-xs text-text-light w-16">{item.date}</span>
                      <div className="flex-1 h-6 bg-bg rounded-full overflow-hidden">
                        <div
                          className="h-full bg-gradient-to-r from-accent to-primary transition-all"
                          style={{ width: `${Math.max(5, (item.pv / Math.max(...data.dailyStats.map((d) => d.pv))) * 100)}%` }}
                        />
                      </div>
                      <span className="text-xs text-text-light w-12 text-right">{item.pv}</span>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-text-light text-center py-8">暂无数据</p>
              )}
            </div>

            <div className="card p-6">
              <h3 className="font-semibold text-text mb-4 flex items-center gap-2">
                <Globe className="w-5 h-5 text-accent" />
                热门页面 TOP10
              </h3>
              {data.pageStats.length > 0 ? (
                <div className="space-y-3">
                  {data.pageStats.slice(0, 10).map((page, index) => (
                    <div key={page.path} className="flex items-center gap-3 p-3 rounded-lg hover:bg-bg transition-colors">
                      <span className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${
                        index < 3 ? 'bg-accent text-white' : 'bg-bg text-text-light'
                      }`}>
                        {index + 1}
                      </span>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm text-text truncate">{page.path}</p>
                      </div>
                      <span className="text-sm text-text-light">{page.count.toLocaleString()} 次</span>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-text-light text-center py-8">暂无数据</p>
              )}
            </div>
          </div>

          <div className="card p-6 mt-6">
            <h3 className="font-semibold text-text mb-4 flex items-center gap-2">
              <FileText className="w-5 h-5 text-accent" />
              来源分布
            </h3>
            {data.refererStats.length > 0 ? (
              <div className="flex flex-wrap gap-4">
                {data.refererStats.map((item) => (
                  <div key={item.referer} className="flex items-center gap-2 bg-bg px-4 py-2 rounded-lg">
                    <span className="text-text text-sm truncate max-w-[200px]">{item.referer || '直接访问'}</span>
                    <span className="text-accent font-bold">{item.count}</span>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-text-light text-center py-8">暂无数据</p>
            )}
          </div>
        </>
      ) : (
        <div className="card p-6">
          <p className="text-text-light text-center py-8">暂无数据</p>
        </div>
      )}
    </AdminLayout>
  );
}