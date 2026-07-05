'use client';

import { useState, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import AdminLayout from '@/components/admin/AdminLayout';
import { AdminPagination } from '@/components/admin/AdminPagination';
import { AdminTableToolbar } from '@/components/admin/AdminTableToolbar';
import { adminFetch } from '@/lib/admin-fetch';
import { CheckCircle, XCircle, Pin, Trash2 } from 'lucide-react';

interface Message {
  id: number;
  nickname: string;
  content: string;
  status: 'pending' | 'approved' | 'rejected';
  rejectReason: string;
  isPinned: boolean;
  likeCount: number;
  createdAt: string;
  reviewer?: { id: number; name: string };
}

const statusTabs = [
  { value: '', label: '全部', color: 'bg-gray-500' },
  { value: 'pending', label: '待审核', color: 'bg-yellow-500' },
  { value: 'approved', label: '已通过', color: 'bg-green-500' },
  { value: 'rejected', label: '已拒绝', color: 'bg-red-500' },
];

// P3-5: useSearchParams 必须包裹 Suspense 边界，否则 Next.js 16 编译警告
function MessagesPageContent() {
  const searchParams = useSearchParams();
  const [messages, setMessages] = useState<Message[]>([]);
  const [page, setPage] = useState(1);
  const [pageSize] = useState(20);
  const [total, setTotal] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState(searchParams.get('status') || '');
  const [rejectModal, setRejectModal] = useState<{ id: number; reason: string } | null>(null);
  const [selectedIds, setSelectedIds] = useState<number[]>([]);
  const [batchRejectReason, setBatchRejectReason] = useState('');

  // P1-5: 合并"筛选变化"和"page 变化"为单个 Effect，避免筛选变化时触发两次请求；
  // 使用 AbortController 防止快速切换筛选时旧请求覆盖新请求；
  // 筛选变化时通过回调重置 page=1，而非在此 Effect 内部 setPage
  useEffect(() => {
    const controller = new AbortController();
    fetchMessages(controller.signal);
    return () => controller.abort();
  }, [page, activeTab, searchQuery]);

  const fetchMessages = async (signal?: AbortSignal) => {
    setIsLoading(true);
    try {
      let url = `/api/v1/admin/messages?page=${page}&pageSize=${pageSize}`;
      if (activeTab) url += `&status=${activeTab}`;
      if (searchQuery) url += `&q=${encodeURIComponent(searchQuery)}`;

      // P1-5: 传入 AbortSignal，使请求可被取消
      const res = await adminFetch(url, signal ? { signal } : undefined);
      const data = await res.json();
      if (data.code === 200) {
        setMessages(data.data.list);
        setTotal(data.data.total);
      }
    } catch (error) {
      // P1-5: 忽略 AbortController 主动取消触发的错误，避免误报
      if (error instanceof Error && error.name === 'AbortError') return;
      setMessages([]);
    } finally {
      setIsLoading(false);
    }
  };

  // P1-5: 筛选变化时重置 page=1，避免在 Effect 内部 setPage 触发额外请求
  const handleSearchChange = (value: string) => {
    setSearchQuery(value);
    setPage(1);
  };

  const handleTabChange = (value: string) => {
    setActiveTab(value);
    setPage(1);
  };

  const handleApprove = async (id: number) => {
    try {
      const res = await adminFetch(`/api/v1/admin/messages/${id}/approve`, {
        method: 'PATCH',
      });
      if (res.ok) {
        fetchMessages();
      }
    } catch {}
  };

  const handleReject = async () => {
    if (!rejectModal) return;
    try {
      const res = await adminFetch(`/api/v1/admin/messages/${rejectModal.id}/reject`, {
        method: 'PATCH',
        body: JSON.stringify({ rejectReason: rejectModal.reason }),
      });
      const data = await res.json();
      if (res.ok && data.code === 200) {
        setRejectModal(null);
        fetchMessages();
      } else {
        alert(data.message || '拒绝操作失败');
      }
    } catch (error) {
      alert('拒绝操作失败，请重试');
    }
  };

  const handlePin = async (id: number, isPinned: boolean) => {
    try {
      const res = await adminFetch(`/api/v1/admin/messages/${id}/pin`, {
        method: 'PATCH',
        body: JSON.stringify({ isPinned: !isPinned }),
      });
      if (res.ok) {
        fetchMessages();
      }
    } catch {}
  };

  const handleDelete = async (id: number) => {
    if (!confirm('确定删除该留言？')) return;
    try {
      const res = await adminFetch(`/api/v1/admin/messages/${id}`, {
        method: 'DELETE',
      });
      if (res.ok) {
        fetchMessages();
      }
    } catch {}
  };

  const handleSelectAll = () => {
    if (selectedIds.length === messages.length) {
      setSelectedIds([]);
    } else {
      setSelectedIds(messages.map((m) => m.id));
    }
  };

  const handleSelect = (id: number) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]
    );
  };

  const handleBatchApprove = async () => {
    if (!confirm(`确定通过选中的 ${selectedIds.length} 条留言？`)) return;
    try {
      const res = await adminFetch('/api/v1/admin/messages/batch', {
        method: 'POST',
        body: JSON.stringify({ ids: selectedIds, action: 'approve' }),
      });
      const data = await res.json();
      if (data.code === 200) {
        setSelectedIds([]);
        fetchMessages();
      }
    } catch {}
  };

  const handleBatchReject = async () => {
    if (!confirm(`确定拒绝选中的 ${selectedIds.length} 条留言？`)) return;
    try {
      const res = await adminFetch('/api/v1/admin/messages/batch', {
        method: 'POST',
        body: JSON.stringify({ ids: selectedIds, action: 'reject', rejectReason: batchRejectReason }),
      });
      const data = await res.json();
      if (data.code === 200) {
        setSelectedIds([]);
        setBatchRejectReason('');
        fetchMessages();
      }
    } catch {}
  };

  const handleBatchDelete = async () => {
    if (!confirm(`确定删除选中的 ${selectedIds.length} 条留言？`)) return;
    try {
      const res = await adminFetch('/api/v1/admin/messages/batch', {
        method: 'POST',
        body: JSON.stringify({ ids: selectedIds, action: 'delete' }),
      });
      const data = await res.json();
      if (data.code === 200) {
        setSelectedIds([]);
        fetchMessages();
      }
    } catch {}
  };

  const getStatusBadge = (status: string) => {
    const tab = statusTabs.find((t) => t.value === status);
    if (!tab) return null;
    return (
      <span className={`inline-flex items-center gap-1 px-2 py-1 ${tab.color} text-white text-xs rounded-full`}>
        {status === 'approved' && <CheckCircle className="w-3 h-3" />}
        {status === 'rejected' && <XCircle className="w-3 h-3" />}
        {status === 'pending' && <span className="w-3 h-3 rounded-full bg-white/30" />}
        {tab.label}
      </span>
    );
  };

  return (
    <AdminLayout title="留言审核" breadcrumbs={[{ label: '留言审核' }]}>
      <AdminTableToolbar
        searchValue={searchQuery}
        onSearchChange={handleSearchChange}
        searchPlaceholder="搜索昵称或内容..."
      >
        {statusTabs.map((tab) => (
          <button
            key={tab.value}
            onClick={() => handleTabChange(tab.value)}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              activeTab === tab.value
                ? `${tab.color} text-white`
                : 'bg-bg text-text-light hover:text-text'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </AdminTableToolbar>

      {selectedIds.length > 0 && (
        <div className="card p-4 mb-6 flex items-center gap-4 bg-accent/5">
          <span className="text-text">已选择 {selectedIds.length} 条留言</span>
          <button
            onClick={handleBatchApprove}
            className="px-3 py-1.5 bg-green-500 text-white text-sm rounded-lg hover:bg-green-600 transition-colors"
          >
            批量通过
          </button>
          <button
            onClick={handleBatchReject}
            className="px-3 py-1.5 bg-red-500 text-white text-sm rounded-lg hover:bg-red-600 transition-colors"
          >
            批量拒绝
          </button>
          <button
            onClick={handleBatchDelete}
            className="px-3 py-1.5 bg-gray-500 text-white text-sm rounded-lg hover:bg-gray-600 transition-colors"
          >
            批量删除
          </button>
        </div>
      )}

      <div className="card">
        {isLoading ? (
          <div className="text-center py-8">
            <div className="inline-block w-6 h-6 border-2 border-accent border-t-transparent rounded-full animate-spin" />
          </div>
        ) : messages.length === 0 ? (
          <div className="text-center py-8 text-text-light">暂无数据</div>
        ) : (
          <div className="divide-y divide-border">
            {messages.map((message) => (
              <div key={message.id} className="p-4 hover:bg-bg transition-colors">
                <div className="flex items-start gap-4">
                  <input
                    type="checkbox"
                    checked={selectedIds.includes(message.id)}
                    onChange={() => handleSelect(message.id)}
                    className="mt-2 rounded"
                  />
                  <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary font-medium flex-shrink-0">
                    {message.nickname.charAt(0)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="font-medium text-text">{message.nickname}</span>
                      {getStatusBadge(message.status)}
                      {message.isPinned && (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-accent/10 text-accent text-xs rounded">
                          <Pin className="w-3 h-3" />
                          置顶
                        </span>
                      )}
                      <span className="text-xs text-text-light">{message.createdAt}</span>
                    </div>
                    <p className="text-text-light text-sm mb-3">{message.content}</p>
                    {message.rejectReason && (
                      <p className="text-xs text-red-500 mb-3">拒绝原因：{message.rejectReason}</p>
                    )}
                    <div className="flex items-center gap-4">
                      <span className="text-xs text-text-light">点赞：{message.likeCount}</span>
                      {message.reviewer && (
                        <span className="text-xs text-text-light">审核人：{message.reviewer.name}</span>
                      )}
                      <div className="flex items-center gap-2 ml-auto">
                        {message.status === 'pending' && (
                          <>
                            <button
                              onClick={() => handleApprove(message.id)}
                              className="px-3 py-1 bg-green-500 text-white text-xs rounded-lg hover:bg-green-600 transition-colors"
                            >
                              通过
                            </button>
                            <button
                              onClick={() => setRejectModal({ id: message.id, reason: '' })}
                              className="px-3 py-1 bg-red-500 text-white text-xs rounded-lg hover:bg-red-600 transition-colors"
                            >
                              拒绝
                            </button>
                          </>
                        )}
                        {message.status === 'approved' && (
                          <>
                            <button
                              onClick={() => handlePin(message.id, message.isPinned)}
                              className={`px-3 py-1 text-xs rounded-lg transition-colors ${
                                message.isPinned
                                  ? 'bg-accent text-white'
                                  : 'border border-border text-text-light hover:text-accent'
                              }`}
                            >
                              {message.isPinned ? '取消置顶' : '置顶'}
                            </button>
                          </>
                        )}
                        <button
                          onClick={() => handleDelete(message.id)}
                          className="px-3 py-1 text-red-500 text-xs rounded-lg hover:bg-red-50 transition-colors"
                        >
                          删除
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {!isLoading && messages.length > 0 && (
          <AdminPagination page={page} pageSize={pageSize} total={total} onPageChange={setPage} />
        )}
      </div>

      {rejectModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-surface rounded-lg p-6 w-full max-w-md">
            <h3 className="text-lg font-semibold text-text mb-4">拒绝留言</h3>
            <textarea
              value={rejectModal.reason}
              onChange={(e) => setRejectModal({ ...rejectModal, reason: e.target.value })}
              rows={3}
              placeholder="请输入拒绝原因（可选）"
              className="w-full px-4 py-2 rounded-lg bg-bg border border-border text-text focus:outline-none focus:border-accent resize-none mb-4"
            />
            <div className="flex gap-3">
              <button
                onClick={() => setRejectModal(null)}
                className="flex-1 px-4 py-2 border border-border text-text rounded-lg hover:bg-bg transition-colors"
              >
                取消
              </button>
              <button
                onClick={handleReject}
                className="flex-1 px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors"
              >
                确认拒绝
              </button>
            </div>
          </div>
        </div>
      )}
    </AdminLayout>
  );
}

// P3-5: 导出包裹 Suspense 的默认组件
export default function MessagesPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center bg-bg">
          <div className="w-8 h-8 border-2 border-accent border-t-transparent rounded-full animate-spin" />
        </div>
      }
    >
      <MessagesPageContent />
    </Suspense>
  );
}