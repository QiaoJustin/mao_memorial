'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import AdminLayout from '@/components/admin/AdminLayout';
import { adminFetch } from '@/lib/admin-fetch';
import { Clock, Image, MessageSquare, AlertCircle, TrendingUp } from 'lucide-react';

interface DashboardData {
  overview: {
    totalNodes: number;
    totalPhotos: number;
    totalMessages: number;
    pendingMessages: number;
  };
  timeline: { date: string; count: number }[];
  hotNodes: { id: number; title: string; viewCount: number; date: string }[];
  eraDistribution: { era: string; count: number }[];
}

const statCards = [
  { label: '时间节点', icon: Clock, color: 'bg-blue-500' },
  { label: '照片数量', icon: Image, color: 'bg-green-500' },
  { label: '留言总数', icon: MessageSquare, color: 'bg-purple-500' },
  { label: '待审核', icon: AlertCircle, color: 'bg-orange-500' },
];

export default function DashboardPage() {
  const [data, setData] = useState<DashboardData | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setIsLoading(true);
    try {
      const res = await adminFetch('/api/v1/admin/stats/dashboard');
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

  const statValues = data?.overview || { totalNodes: 0, totalPhotos: 0, totalMessages: 0, pendingMessages: 0 };

  return (
    <AdminLayout title="仪表盘">
      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          {statCards.map((card) => (
            <div key={card.label} className="card p-6 animate-pulse">
              <div className="flex items-center justify-between mb-4">
                <div className={`w-12 h-12 rounded-lg ${card.color} flex items-center justify-center bg-text-light/20`} />
              </div>
              <div className="h-6 w-24 bg-text-light/20 rounded mb-2" />
              <div className="h-4 w-16 bg-text-light/20 rounded" />
            </div>
          ))}
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            {statCards.map((card, index) => {
              const Icon = card.icon;
              const values = [statValues.totalNodes, statValues.totalPhotos, statValues.totalMessages, statValues.pendingMessages];
              return (
                <div key={card.label} className="card p-6">
                  <div className="flex items-center justify-between mb-4">
                    <div className={`w-12 h-12 rounded-lg ${card.color} flex items-center justify-center`}>
                      <Icon className="w-6 h-6 text-white" />
                    </div>
                    {index === 3 && statValues.pendingMessages > 0 && (
                      <span className="px-2 py-1 bg-red-500 text-white text-xs rounded-full animate-pulse">
                        {statValues.pendingMessages}
                      </span>
                    )}
                  </div>
                  <p className="text-3xl font-bold text-text mb-1">{values[index].toLocaleString()}</p>
                  <p className="text-text-light">{card.label}</p>
                </div>
              );
            })}
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="card p-6">
              <h3 className="font-semibold text-text mb-4 flex items-center gap-2">
                <TrendingUp className="w-5 h-5 text-accent" />
                访问趋势（近30天）
              </h3>
              {data?.timeline && data.timeline.length > 0 ? (
                <div className="space-y-2">
                  {data.timeline.slice(-7).map((item) => (
                    <div key={item.date} className="flex items-center gap-3">
                      <span className="text-xs text-text-light w-16">{item.date}</span>
                      <div className="flex-1 h-6 bg-bg rounded-full overflow-hidden">
                        <div
                          className="h-full bg-gradient-to-r from-accent to-primary transition-all"
                          style={{ width: `${Math.max(5, (item.count / Math.max(...data.timeline.map((t) => t.count))) * 100)}%` }}
                        />
                      </div>
                      <span className="text-xs text-text-light w-12 text-right">{item.count}</span>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-text-light text-center py-8">暂无数据</p>
              )}
            </div>

            <div className="card p-6">
              <h3 className="font-semibold text-text mb-4">热门节点 TOP10</h3>
              {data?.hotNodes && data.hotNodes.length > 0 ? (
                <div className="space-y-3">
                  {data.hotNodes.map((node, index) => (
                    <Link
                      key={node.id}
                      href={`/admin/nodes/${node.id}/edit`}
                      className="flex items-center gap-3 p-3 rounded-lg hover:bg-bg transition-colors group"
                    >
                      <span className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${
                        index < 3 ? 'bg-accent text-white' : 'bg-bg text-text-light'
                      }`}>
                        {index + 1}
                      </span>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm text-text truncate group-hover:text-accent transition-colors">
                          {node.title}
                        </p>
                        <p className="text-xs text-text-light">{node.date}</p>
                      </div>
                      <span className="text-sm text-text-light">{node.viewCount.toLocaleString()} 浏览</span>
                    </Link>
                  ))}
                </div>
              ) : (
                <p className="text-text-light text-center py-8">暂无数据</p>
              )}
            </div>
          </div>

          <div className="card p-6 mt-6">
            <h3 className="font-semibold text-text mb-4">年代分布</h3>
            {data?.eraDistribution && data.eraDistribution.length > 0 ? (
              <div className="flex flex-wrap gap-4">
                {data.eraDistribution.map((item) => (
                  <div key={item.era} className="flex items-center gap-2 bg-bg px-4 py-2 rounded-lg">
                    <span className="text-text">{item.era}</span>
                    <span className="text-accent font-bold">{item.count}</span>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-text-light text-center py-8">暂无数据</p>
            )}
          </div>

          {statValues.pendingMessages > 0 && (
            <div className="card p-6 mt-6 bg-orange-50 border-orange-200">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <AlertCircle className="w-8 h-8 text-orange-500" />
                  <div>
                    <h3 className="font-semibold text-text">有待审核留言</h3>
                    <p className="text-sm text-text-light">
                      有 {statValues.pendingMessages} 条留言等待审核处理
                    </p>
                  </div>
                </div>
                <Link
                  href="/admin/messages?status=pending"
                  className="px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors"
                >
                  去审核
                </Link>
              </div>
            </div>
          )}
        </>
      )}
    </AdminLayout>
  );
}