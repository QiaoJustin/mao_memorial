'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import AdminLayout from '@/components/admin/AdminLayout';
import { AdminPagination } from '@/components/admin/AdminPagination';
import { AdminTableToolbar } from '@/components/admin/AdminTableToolbar';
import { adminFetch } from '@/lib/admin-fetch';
import { Filter, Eye, Edit, Trash2, CheckCircle, XCircle, Star } from 'lucide-react';

interface Node {
  id: number;
  title: string;
  date: string;
  year: number;
  era: { id: string; name: string };
  photoCount: number;
  viewCount: number;
  isPublished: boolean;
  isFeatured: boolean;
  photos: { url: string }[];
}

export default function NodesPage() {
  const router = useRouter();
  const [nodes, setNodes] = useState<Node[]>([]);
  const [page, setPage] = useState(1);
  const [pageSize] = useState(20);
  const [total, setTotal] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedEra, setSelectedEra] = useState('');
  const [filterPublished, setFilterPublished] = useState<string>('');
  const [sortBy, setSortBy] = useState('dateSort');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');
  const [selectedIds, setSelectedIds] = useState<number[]>([]);
  const [eras, setEras] = useState<{ id: string; name: string }[]>([]);

  // P1-5: eras 初始化 Effect（仅 mount 时执行一次，fetchEras 与列表请求解耦）
  useEffect(() => {
    fetchEras();
  }, []);

  // P1-5: 合并"筛选变化"和"page 变化"为单个 Effect，避免筛选变化时触发两次请求；
  // 使用 AbortController 防止快速切换筛选时旧请求覆盖新请求；
  // 筛选变化时通过回调重置 page=1，而非在此 Effect 内部 setPage
  useEffect(() => {
    const controller = new AbortController();
    fetchNodes(controller.signal);
    return () => controller.abort();
  }, [page, searchQuery, selectedEra, filterPublished, sortBy, sortOrder]);

  const fetchEras = async () => {
    try {
      const res = await fetch('/api/v1/eras', { cache: 'force-cache' });
      const data = await res.json();
      setEras(data.data || []);
    } catch {
      setEras([]);
    }
  };

  const fetchNodes = async (signal?: AbortSignal) => {
    setIsLoading(true);
    try {
      let url = `/api/v1/admin/nodes?page=${page}&pageSize=${pageSize}`;
      if (searchQuery) url += `&q=${encodeURIComponent(searchQuery)}`;
      if (selectedEra) url += `&eraId=${encodeURIComponent(selectedEra)}`;
      if (filterPublished) url += `&isPublished=${filterPublished}`;
      url += `&sortBy=${sortBy}&sortOrder=${sortOrder}`;

      // P1-5: 传入 AbortSignal，使请求可被取消
      const res = await adminFetch(url, signal ? { signal } : undefined);

      const data = await res.json();
      if (data.code === 200) {
        setNodes(data.data.list);
        setTotal(data.data.total);
      }
    } catch (error) {
      // P1-5: 忽略 AbortController 主动取消触发的错误，避免误报
      if (error instanceof Error && error.name === 'AbortError') return;
      console.error('Fetch nodes error:', error);
      setNodes([]);
    } finally {
      setIsLoading(false);
    }
  };

  // P1-5: 筛选变化时重置 page=1，避免在 Effect 内部 setPage 触发额外请求
  const handleSearchChange = (value: string) => {
    setSearchQuery(value);
    setPage(1);
  };

  const handleEraChange = (value: string) => {
    setSelectedEra(value);
    setPage(1);
  };

  const handleFilterPublishedChange = (value: string) => {
    setFilterPublished(value);
    setPage(1);
  };

  const handleSortChange = (field: string) => {
    if (sortBy === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(field);
      setSortOrder('asc');
    }
  };

  const handleSelectAll = () => {
    if (selectedIds.length === nodes.length) {
      setSelectedIds([]);
    } else {
      setSelectedIds(nodes.map((n) => n.id));
    }
  };

  const handleSelect = (id: number) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]
    );
  };

  const handleBatchAction = async (action: string) => {
    if (selectedIds.length === 0) return;
    try {
      const res = await adminFetch('/api/v1/admin/nodes/batch', {
        method: 'POST',
        body: JSON.stringify({ ids: selectedIds, action }),
      });
      const data = await res.json();
      if (data.code === 200) {
        setSelectedIds([]);
        fetchNodes();
      }
    } catch {}
  };

  const handleDelete = async (id: number) => {
    if (!confirm('确定删除该节点？')) return;
    try {
      const res = await adminFetch(`/api/v1/admin/nodes/${id}`, {
        method: 'DELETE',
      });
      if (res.ok) {
        fetchNodes();
      }
    } catch {}
  };

  return (
    <AdminLayout title="节点管理" breadcrumbs={[{ label: '节点管理' }]}>
      <AdminTableToolbar
        searchValue={searchQuery}
        onSearchChange={handleSearchChange}
        searchPlaceholder="搜索标题或描述..."
        newHref="/admin/nodes/new"
        newLabel="新增节点"
      >
        <Filter className="w-5 h-5 text-text-light" />
        <select
          value={selectedEra}
          onChange={(e) => handleEraChange(e.target.value)}
          className="px-3 py-2 rounded-lg bg-bg border border-border text-text focus:outline-none focus:border-accent"
        >
          <option value="">全年代</option>
          {eras.map((era) => (
            <option key={era.id} value={era.id}>
              {era.name}
            </option>
          ))}
        </select>
        <select
          value={filterPublished}
          onChange={(e) => handleFilterPublishedChange(e.target.value)}
          className="px-3 py-2 rounded-lg bg-bg border border-border text-text focus:outline-none focus:border-accent"
        >
          <option value="">全部状态</option>
          <option value="true">已发布</option>
          <option value="false">未发布</option>
        </select>
      </AdminTableToolbar>

      {selectedIds.length > 0 && (
        <div className="card p-4 mb-6 flex items-center gap-4 bg-accent/5">
          <span className="text-text">已选择 {selectedIds.length} 项</span>
          <div className="flex gap-2">
            <button
              onClick={() => handleBatchAction('publish')}
              className="px-3 py-1.5 bg-green-500 text-white text-sm rounded-lg hover:bg-green-600 transition-colors"
            >
              批量发布
            </button>
            <button
              onClick={() => handleBatchAction('unpublish')}
              className="px-3 py-1.5 bg-yellow-500 text-white text-sm rounded-lg hover:bg-yellow-600 transition-colors"
            >
              取消发布
            </button>
            <button
              onClick={() => handleBatchAction('feature')}
              className="px-3 py-1.5 bg-blue-500 text-white text-sm rounded-lg hover:bg-blue-600 transition-colors"
            >
              设为精选
            </button>
            <button
              onClick={() => handleBatchAction('delete')}
              className="px-3 py-1.5 bg-red-500 text-white text-sm rounded-lg hover:bg-red-600 transition-colors"
            >
              批量删除
            </button>
          </div>
        </div>
      )}

      <div className="card overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-border">
              <th className="px-4 py-3 text-left text-sm font-medium text-text-light">
                <input
                  type="checkbox"
                  checked={selectedIds.length === nodes.length && nodes.length > 0}
                  onChange={handleSelectAll}
                  className="rounded"
                />
              </th>
              <th className="px-4 py-3 text-left text-sm font-medium text-text-light">标题</th>
              <th className="px-4 py-3 text-left text-sm font-medium text-text-light">年代</th>
              <th className="px-4 py-3 text-left text-sm font-medium text-text-light cursor-pointer hover:text-accent" onClick={() => handleSortChange('dateSort')}>
                日期
                {sortBy === 'dateSort' && (sortOrder === 'asc' ? ' ↑' : ' ↓')}
              </th>
              <th className="px-4 py-3 text-left text-sm font-medium text-text-light">照片</th>
              <th className="px-4 py-3 text-left text-sm font-medium text-text-light cursor-pointer hover:text-accent" onClick={() => handleSortChange('viewCount')}>
                浏览
                {sortBy === 'viewCount' && (sortOrder === 'asc' ? ' ↑' : ' ↓')}
              </th>
              <th className="px-4 py-3 text-left text-sm font-medium text-text-light">状态</th>
              <th className="px-4 py-3 text-left text-sm font-medium text-text-light">操作</th>
            </tr>
          </thead>
          <tbody>
            {isLoading ? (
              <tr>
                <td colSpan={8} className="text-center py-8">
                  <div className="inline-block w-6 h-6 border-2 border-accent border-t-transparent rounded-full animate-spin" />
                </td>
              </tr>
            ) : nodes.length === 0 ? (
              <tr>
                <td colSpan={8} className="text-center py-8 text-text-light">
                  暂无数据
                </td>
              </tr>
            ) : (
              nodes.map((node) => (
                <tr key={node.id} className="border-b border-border hover:bg-bg transition-colors">
                  <td className="px-4 py-4">
                    <input
                      type="checkbox"
                      checked={selectedIds.includes(node.id)}
                      onChange={() => handleSelect(node.id)}
                      className="rounded"
                    />
                  </td>
                  <td className="px-4 py-4">
                    <div className="flex items-center gap-3">
                      {node.photos[0]?.url ? (
                        <img src={node.photos[0].url} alt="" className="w-10 h-10 rounded object-cover" />
                      ) : (
                        <div className="w-10 h-10 rounded bg-bg flex items-center justify-center text-text-light text-xs">
                          无图
                        </div>
                      )}
                      <div>
                        <p className="text-sm font-medium text-text">{node.title}</p>
                        {node.isFeatured && (
                          <span className="inline-flex items-center gap-1 text-xs text-accent">
                            <Star className="w-3 h-3" />
                            精选
                          </span>
                        )}
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-4 text-sm text-text-light">{node.era.name}</td>
                  <td className="px-4 py-4 text-sm text-text-light">{node.date}</td>
                  <td className="px-4 py-4 text-sm text-text-light">{node.photoCount}</td>
                  <td className="px-4 py-4 text-sm text-text-light">{node.viewCount}</td>
                  <td className="px-4 py-4">
                    {node.isPublished ? (
                      <span className="inline-flex items-center gap-1 px-2 py-1 bg-green-100 text-green-700 text-xs rounded-full">
                        <CheckCircle className="w-4 h-4" />
                        已发布
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded-full">
                        <XCircle className="w-4 h-4" />
                        未发布
                      </span>
                    )}
                  </td>
                  <td className="px-4 py-4">
                    <div className="flex items-center gap-2">
                      <Link
                        href={`/timeline/${node.id}`}
                        target="_blank"
                        className="p-2 text-text-light hover:text-primary transition-colors"
                      >
                        <Eye className="w-5 h-5" />
                      </Link>
                      <Link
                        href={`/admin/nodes/${node.id}/edit`}
                        className="p-2 text-text-light hover:text-accent transition-colors"
                      >
                        <Edit className="w-5 h-5" />
                      </Link>
                      <button
                        onClick={() => handleDelete(node.id)}
                        className="p-2 text-text-light hover:text-red-500 transition-colors"
                      >
                        <Trash2 className="w-5 h-5" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>

        {!isLoading && nodes.length > 0 && (
          <AdminPagination page={page} pageSize={pageSize} total={total} onPageChange={setPage} />
        )}
      </div>
    </AdminLayout>
  );
}