'use client';

import { useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import AdminLayout from '@/components/admin/AdminLayout';
import { CheckCircle, XCircle, Pin, Trash2, Search } from 'lucide-react';

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

export default function MessagesPage() {
  const searchParams = useSearchParams();
  const [messages, setMessages] = useState<Message[]>([]);
  const [page, setPage] = useState(1);
  const [pageSize] = useState(20);
  const [total, setTotal] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState(searchParams.get('status') || '');
  const [rejectModal, setRejectModal] = useState<{ id: number; reason: string } | null>(null);

  useEffect(() => {
    setPage(1);
    fetchMessages();
  }, [activeTab, searchQuery]);

  useEffect(() => {
    fetchMessages();
  }, [page]);

  const fetchMessages = async () => {
    setIsLoading(true);
    try {
      const token = localStorage.getItem('admin-token');
      let url = `/api/v1/admin/messages?page=${page}&pageSize=${pageSize}`;
      if (activeTab) url += `&status=${activeTab}`;
      if (searchQuery) url += `&q=${encodeURIComponent(searchQuery)}`;

      const res = await fetch(url, { headers: { Authorization: `Bearer ${token}` } });
      const data = await res.json();
      if (data.code === 200) {
        setMessages(data.data.list);
        setTotal(data.data.total);
      }
    } catch {
      setMessages([]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleApprove = async (id: number) => {
    try {
      const token = localStorage.getItem('admin-token');
      const res = await fetch(`/api/v1/admin/messages/${id}/approve`, {
        method: 'PATCH',
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        fetchMessages();
      }
    } catch {}
  };

  const handleReject = async () => {
    if (!rejectModal) return;
    try {
      const token = localStorage.getItem('admin-token');
      const res = await fetch(`/api/v1/admin/messages/${rejectModal.id}/reject`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ rejectReason: rejectModal.reason }),
      });
      if (res.ok) {
        setRejectModal(null);
        fetchMessages();
      }
    } catch {}
  };

  const handlePin = async (id: number, isPinned: boolean) => {
    try {
      const token = localStorage.getItem('admin-token');
      const res = await fetch(`/api/v1/admin/messages/${id}/pin`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
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
      const token = localStorage.getItem('admin-token');
      const res = await fetch(`/api/v1/admin/messages/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
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
      <div className="card p-6 mb-6">
        <div className="flex flex-col md:flex-row md:items-center gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-text-light" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="搜索昵称或内容..."
              className="w-full pl-10 pr-4 py-2 rounded-lg bg-bg border border-border text-text placeholder-text-light focus:outline-none focus:border-accent"
            />
          </div>
          <div className="flex items-center gap-2">
            {statusTabs.map((tab) => (
              <button
                key={tab.value}
                onClick={() => setActiveTab(tab.value)}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  activeTab === tab.value
                    ? `${tab.color} text-white`
                    : 'bg-bg text-text-light hover:text-text'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>
      </div>

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
          <div className="px-4 py-4 border-t border-border flex items-center justify-between">
            <span className="text-sm text-text-light">共 {total.toLocaleString()} 条记录</span>
            <div className="flex items-center gap-2">
              {page > 1 && (
                <button
                  onClick={() => setPage(page - 1)}
                  className="px-3 py-1.5 text-sm border border-border rounded-lg hover:bg-bg transition-colors"
                >
                  上一页
                </button>
              )}
              <span className="text-sm text-text-light">
                第 {page} 页 / 共 {Math.ceil(total / pageSize)} 页
              </span>
              {page < Math.ceil(total / pageSize) && (
                <button
                  onClick={() => setPage(page + 1)}
                  className="px-3 py-1.5 text-sm border border-border rounded-lg hover:bg-bg transition-colors"
                >
                  下一页
                </button>
              )}
            </div>
          </div>
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