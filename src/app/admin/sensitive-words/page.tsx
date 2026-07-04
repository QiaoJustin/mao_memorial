'use client';

import { useState, useEffect } from 'react';
import AdminLayout from '@/components/admin/AdminLayout';
import { Plus, Search, Trash2, AlertTriangle } from 'lucide-react';

interface SensitiveWord {
  id: number;
  word: string;
  level: number;
  category: string;
  replacement: string;
}

export default function SensitiveWordsPage() {
  const [words, setWords] = useState<SensitiveWord[]>([]);
  const [page, setPage] = useState(1);
  const [pageSize] = useState(50);
  const [total, setTotal] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);
  const [newWord, setNewWord] = useState('');
  const [showBatchModal, setShowBatchModal] = useState(false);
  const [batchWords, setBatchWords] = useState('');

  useEffect(() => {
    setPage(1);
    fetchWords();
  }, [searchQuery]);

  useEffect(() => {
    fetchWords();
  }, [page]);

  const fetchWords = async () => {
    setIsLoading(true);
    try {
      const token = localStorage.getItem('admin-token');
      let url = `/api/v1/admin/sensitive-words?page=${page}&pageSize=${pageSize}`;
      if (searchQuery) url += `&q=${encodeURIComponent(searchQuery)}`;

      const res = await fetch(url, { headers: { Authorization: `Bearer ${token}` } });
      const data = await res.json();
      if (data.code === 200) {
        setWords(data.data.list);
        setTotal(data.data.total);
      }
    } catch {
      setWords([]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleAdd = async () => {
    if (!newWord.trim()) {
      alert('请输入敏感词');
      return;
    }
    try {
      const token = localStorage.getItem('admin-token');
      const res = await fetch('/api/v1/admin/sensitive-words', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ word: newWord.trim() }),
      });
      const data = await res.json();
      if (data.code === 200) {
        setShowAddModal(false);
        setNewWord('');
        fetchWords();
      } else {
        alert(data.message || '添加失败');
      }
    } catch {}
  };

  const handleBatchAdd = async () => {
    if (!batchWords.trim()) {
      alert('请输入敏感词（每行一个）');
      return;
    }
    const wordList = batchWords.split('\n').map((w) => w.trim()).filter((w) => w);
    if (wordList.length === 0) {
      alert('请输入有效的敏感词');
      return;
    }
    try {
      const token = localStorage.getItem('admin-token');
      const res = await fetch('/api/v1/admin/sensitive-words/batch', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ words: wordList }),
      });
      if (res.ok) {
        setShowBatchModal(false);
        setBatchWords('');
        fetchWords();
      }
    } catch {}
  };

  const handleDelete = async (id: number) => {
    if (!confirm('确定删除该敏感词？')) return;
    try {
      const token = localStorage.getItem('admin-token');
      const res = await fetch(`/api/v1/admin/sensitive-words/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        fetchWords();
      }
    } catch {}
  };

  return (
    <AdminLayout title="敏感词管理" breadcrumbs={[{ label: '敏感词管理' }]}>
      <div className="card p-6 mb-6">
        <div className="flex flex-col md:flex-row md:items-center gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-text-light" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="搜索敏感词..."
              className="w-full pl-10 pr-4 py-2 rounded-lg bg-bg border border-border text-text placeholder-text-light focus:outline-none focus:border-accent"
            />
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowAddModal(true)}
              className="flex items-center gap-2 px-4 py-2 bg-accent text-white rounded-lg hover:bg-accent-light transition-colors"
            >
              <Plus className="w-5 h-5" />
              添加敏感词
            </button>
            <button
              onClick={() => setShowBatchModal(true)}
              className="flex items-center gap-2 px-4 py-2 border border-border text-text rounded-lg hover:bg-bg transition-colors"
            >
              批量导入
            </button>
          </div>
        </div>
      </div>

      <div className="card">
        {isLoading ? (
          <div className="text-center py-8">
            <div className="inline-block w-6 h-6 border-2 border-accent border-t-transparent rounded-full animate-spin" />
          </div>
        ) : words.length === 0 ? (
          <div className="text-center py-8 text-text-light">暂无敏感词</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-border">
                  <th className="px-4 py-3 text-left text-sm font-medium text-text-light">敏感词</th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-text-light">级别</th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-text-light">分类</th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-text-light">替换</th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-text-light">操作</th>
                </tr>
              </thead>
              <tbody>
                {words.map((word) => (
                  <tr key={word.id} className="border-b border-border hover:bg-bg transition-colors">
                    <td className="px-4 py-4">
                      <div className="flex items-center gap-2">
                        <AlertTriangle className="w-5 h-5 text-red-500" />
                        <span className="text-text font-medium">{word.word}</span>
                      </div>
                    </td>
                    <td className="px-4 py-4">
                      <span className={`px-2 py-1 text-xs rounded-full ${
                        word.level >= 3 ? 'bg-red-100 text-red-700' :
                        word.level === 2 ? 'bg-yellow-100 text-yellow-700' :
                        'bg-blue-100 text-blue-700'
                      }`}>
                        L{word.level}
                      </span>
                    </td>
                    <td className="px-4 py-4 text-sm text-text-light">{word.category || '-'}</td>
                    <td className="px-4 py-4 text-sm text-text-light">{word.replacement}</td>
                    <td className="px-4 py-4">
                      <button
                        onClick={() => handleDelete(word.id)}
                        className="p-2 text-text-light hover:text-red-500 transition-colors"
                      >
                        <Trash2 className="w-5 h-5" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {!isLoading && words.length > 0 && (
          <div className="px-4 py-4 border-t border-border flex items-center justify-between">
            <span className="text-sm text-text-light">共 {total.toLocaleString()} 条记录</span>
            <div className="flex items-center gap-2">
              {page > 1 && (
                <button onClick={() => setPage(page - 1)} className="px-3 py-1.5 text-sm border border-border rounded-lg hover:bg-bg transition-colors">
                  上一页
                </button>
              )}
              <span className="text-sm text-text-light">第 {page} 页 / 共 {Math.ceil(total / pageSize)} 页</span>
              {page < Math.ceil(total / pageSize) && (
                <button onClick={() => setPage(page + 1)} className="px-3 py-1.5 text-sm border border-border rounded-lg hover:bg-bg transition-colors">
                  下一页
                </button>
              )}
            </div>
          </div>
        )}
      </div>

      {showAddModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-surface rounded-lg p-6 w-full max-w-md">
            <h3 className="text-lg font-semibold text-text mb-4">添加敏感词</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-text mb-2">敏感词</label>
                <input
                  type="text"
                  value={newWord}
                  onChange={(e) => setNewWord(e.target.value)}
                  placeholder="请输入敏感词"
                  className="w-full px-4 py-2 rounded-lg bg-bg border border-border text-text focus:outline-none focus:border-accent"
                />
              </div>
            </div>
            <div className="flex gap-3 mt-6">
              <button onClick={() => setShowAddModal(false)} className="flex-1 px-4 py-2 border border-border text-text rounded-lg hover:bg-bg transition-colors">
                取消
              </button>
              <button onClick={handleAdd} className="flex-1 px-4 py-2 bg-accent text-white rounded-lg hover:bg-accent-light transition-colors">
                添加
              </button>
            </div>
          </div>
        </div>
      )}

      {showBatchModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-surface rounded-lg p-6 w-full max-w-md">
            <h3 className="text-lg font-semibold text-text mb-4">批量导入敏感词</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-text mb-2">敏感词列表（每行一个）</label>
                <textarea
                  value={batchWords}
                  onChange={(e) => setBatchWords(e.target.value)}
                  rows={8}
                  placeholder="请输入敏感词，每行一个"
                  className="w-full px-4 py-2 rounded-lg bg-bg border border-border text-text focus:outline-none focus:border-accent resize-none font-mono text-sm"
                />
              </div>
            </div>
            <div className="flex gap-3 mt-6">
              <button onClick={() => setShowBatchModal(false)} className="flex-1 px-4 py-2 border border-border text-text rounded-lg hover:bg-bg transition-colors">
                取消
              </button>
              <button onClick={handleBatchAdd} className="flex-1 px-4 py-2 bg-accent text-white rounded-lg hover:bg-accent-light transition-colors">
                导入
              </button>
            </div>
          </div>
        </div>
      )}
    </AdminLayout>
  );
}