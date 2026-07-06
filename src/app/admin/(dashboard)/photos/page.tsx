'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';

import { AdminPagination } from '@/components/admin/AdminPagination';
import { AdminTableToolbar } from '@/components/admin/AdminTableToolbar';
import { adminFetch } from '@/lib/admin-fetch';
import { Eye, Edit, Trash2, Image, CheckCircle } from 'lucide-react';

interface Photo {
  id: number;
  url: string;
  thumbnailUrl: string;
  caption: string;
  isCover: boolean;
  nodeId: number | null;
  nodeTitle: string;
  nodeDate: string;
}

export default function PhotosPage() {
  const [photos, setPhotos] = useState<Photo[]>([]);
  const [page, setPage] = useState(1);
  const [pageSize] = useState(20);
  const [total, setTotal] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedIds, setSelectedIds] = useState<number[]>([]);

  useEffect(() => {
    const controller = new AbortController();
    fetchPhotos(controller.signal);
    return () => controller.abort();
  }, [page, searchQuery]);

  const fetchPhotos = async (signal?: AbortSignal) => {
    setIsLoading(true);
    try {
      let url = `/api/v1/admin/photos?page=${page}&pageSize=${pageSize}`;
      if (searchQuery) url += `&q=${encodeURIComponent(searchQuery)}`;

      const res = await adminFetch(url, signal ? { signal } : undefined);
      const data = await res.json();
      if (data.code === 200) {
        setPhotos(data.data.list);
        setTotal(data.data.total);
      }
    } catch (error) {
      if (error instanceof Error && error.name === 'AbortError') return;
      setPhotos([]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSearchChange = (value: string) => {
    setSearchQuery(value);
    setPage(1);
  };

  const handleSelectAll = () => {
    if (selectedIds.length === photos.length) {
      setSelectedIds([]);
    } else {
      setSelectedIds(photos.map((p) => p.id));
    }
  };

  const handleSelect = (id: number) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]
    );
  };

  const handleDelete = async (id: number) => {
    if (!confirm('确定删除该照片？')) return;
    try {
      const res = await adminFetch(`/api/v1/admin/photos/${id}`, {
        method: 'DELETE',
      });
      if (res.ok) {
        fetchPhotos();
      }
    } catch {}
  };

  return (
    <>
      <AdminTableToolbar
        searchValue={searchQuery}
        onSearchChange={handleSearchChange}
        searchPlaceholder="搜索图片说明..."
        newHref="/admin/photos/new"
        newLabel="上传照片"
      />

      {selectedIds.length > 0 && (
        <div className="card p-4 mb-6 flex items-center gap-4 bg-accent/5">
          <span className="text-text">已选择 {selectedIds.length} 项</span>
          <button
            onClick={() => {
              if (!confirm('确定批量删除选中的照片？')) return;
              Promise.all(selectedIds.map((id) =>
                adminFetch(`/api/v1/admin/photos/${id}`, { method: 'DELETE' })
              )).then(() => {
                setSelectedIds([]);
                fetchPhotos();
              });
            }}
            className="px-3 py-1.5 bg-red-500 text-white text-sm rounded-lg hover:bg-red-600 transition-colors"
          >
            批量删除
          </button>
        </div>
      )}

      <div className="card overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-border">
              <th className="px-4 py-3 text-left text-sm font-medium text-text-light">
                <input
                  type="checkbox"
                  checked={selectedIds.length === photos.length && photos.length > 0}
                  onChange={handleSelectAll}
                  className="rounded"
                />
              </th>
              <th className="px-4 py-3 text-left text-sm font-medium text-text-light">图片</th>
              <th className="px-4 py-3 text-left text-sm font-medium text-text-light">说明</th>
              <th className="px-4 py-3 text-left text-sm font-medium text-text-light">所属节点</th>
              <th className="px-4 py-3 text-left text-sm font-medium text-text-light">状态</th>
              <th className="px-4 py-3 text-left text-sm font-medium text-text-light">操作</th>
            </tr>
          </thead>
          <tbody>
            {isLoading ? (
              <tr>
                <td colSpan={6} className="text-center py-8">
                  <div className="inline-block w-6 h-6 border-2 border-accent border-t-transparent rounded-full animate-spin" />
                </td>
              </tr>
            ) : photos.length === 0 ? (
              <tr>
                <td colSpan={6} className="text-center py-8 text-text-light">暂无数据</td>
              </tr>
            ) : (
              photos.map((photo) => (
                <tr key={photo.id} className="border-b border-border hover:bg-bg transition-colors">
                  <td className="px-4 py-4">
                    <input
                      type="checkbox"
                      checked={selectedIds.includes(photo.id)}
                      onChange={() => handleSelect(photo.id)}
                      className="rounded"
                    />
                  </td>
                  <td className="px-4 py-4">
                    <div className="flex items-center gap-3">
                      <img
                        src={photo.thumbnailUrl || photo.url}
                        alt=""
                        className="w-12 h-12 rounded object-cover"
                      />
                      {photo.isCover && (
                        <span className="inline-flex items-center gap-1 text-xs text-accent">
                          <CheckCircle className="w-3 h-3" />
                          封面
                        </span>
                      )}
                    </div>
                  </td>
                  <td className="px-4 py-4">
                    <p className="text-sm text-text truncate max-w-xs">{photo.caption || '无说明'}</p>
                  </td>
                  <td className="px-4 py-4">
                    {photo.nodeId ? (
                      <Link
                        href={`/admin/nodes/${photo.nodeId}/edit`}
                        className="text-sm text-accent hover:underline"
                      >
                        {photo.nodeTitle}
                      </Link>
                    ) : (
                      <span className="text-sm text-text-light">未关联</span>
                    )}
                  </td>
                  <td className="px-4 py-4">
                    {photo.isCover ? (
                      <span className="inline-flex items-center gap-1 px-2 py-1 bg-green-100 text-green-700 text-xs rounded-full">
                        <CheckCircle className="w-3 h-3" />
                        封面
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded-full">
                        <Image className="w-3 h-3" />
                        普通
                      </span>
                    )}
                  </td>
                  <td className="px-4 py-4">
                    <div className="flex items-center gap-2">
                      <a
                        href={photo.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="p-2 text-text-light hover:text-primary transition-colors"
                      >
                        <Eye className="w-5 h-5" />
                      </a>
                      <Link
                        href={`/admin/photos/${photo.id}/edit`}
                        className="p-2 text-text-light hover:text-accent transition-colors"
                      >
                        <Edit className="w-5 h-5" />
                      </Link>
                      <button
                        onClick={() => handleDelete(photo.id)}
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

        {!isLoading && photos.length > 0 && (
          <AdminPagination page={page} pageSize={pageSize} total={total} onPageChange={setPage} />
        )}
      </div>
    </>
    );
}